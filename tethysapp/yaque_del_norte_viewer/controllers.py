from __future__ import division

# Django imports
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

# Tethys imports
from .model import generate_summary_df
from .app import YaqueDelNorteViewer as App

# Other imports
import traceback
import json
import numpy as np
import requests
from xarray import open_dataset
from io import BytesIO
import uuid
import os
import xml.etree.ElementTree as et


@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    resp = requests.get(
        r"https://tethys.byu.edu/thredds/wms/testAll/Yaque_Del_Norte_Viewer/floodextent4407.nc?"
        r"request=GetCapabilities&service=WMS&version=1.3.0"
    )

    tree = et.fromstring(resp.content)
    dates_str = tree[1][2][11][1][5].text.strip("\n").strip()

    dates_list = dates_str.split(",")
    start_date = dates_list[0]
    end_date = dates_list[-1]

    context = {
        "dates_str": dates_str,
        "start_date": start_date,
        "end_date": end_date,
    }

    return render(request, 'yaque_del_norte_viewer/home.html', context)


@login_required()
def damage_report_ajax(request):
    """
    Ajax controller to generate the damage report
    """
    # TODO: Add a check to make sure that the netcdf at the query string is not empty
    try:
        json_body = json.loads(request.body)

        query_string = json_body["query_string"]

        summary_df, full_report = generate_summary_df(query_string)

        if summary_df is None:

            response = {
                "error": True,
                "error_message": "There is no flooding in this stream."
            }

            return JsonResponse(response)

        else:
            time_list = summary_df.index.to_list()
            max_height_list = summary_df["timeseries"].values.tolist()
            damage_list = np.round(summary_df["damage"].values, 2).tolist()
            population_impacted_list = np.ceil(summary_df["population"].values).tolist()

            response = {
                "error": False,
                "time_list": time_list,
                "max_height_list": max_height_list,
                "damage_list": damage_list,
                "population_impacted_list": population_impacted_list,
                "full_results": full_report.to_csv(index=False)
            }

            return JsonResponse(response)

    except Exception:
        tb = traceback.format_exc()

        response = {
            "error": True,
            "error_message": tb,
        }

        return JsonResponse(response)


@login_required()
def is_flooded_check(request):

    print("in is_flooded_check_controller!")

    # TODO: Add custom setting to remove hardcoding the url
    query_string = r"https://tethys.byu.edu/thredds/fileServer/testAll/Yaque_Del_Norte_Viewer/Flooded_Bools.nc"

    res = requests.get(query_string)

    io_object = BytesIO(res.content)
    io_object.seek(0)

    app_workspace = App.get_app_workspace()
    netcdf_dir = os.path.join(app_workspace.path, 'tmp_netcdf')

    if not os.path.exists(netcdf_dir):
        os.mkdir(netcdf_dir)

    tmp_file_name = str(uuid.uuid4()) + ".nc"
    tmp_file_path = os.path.join(netcdf_dir, tmp_file_name)

    with open(tmp_file_path, 'wb') as out:
        out.write(io_object.read())

    io_object.close()  # Close IO object

    ds = open_dataset(tmp_file_path)
    df = ds.to_dataframe()
    ds.close()
    os.remove(tmp_file_path)

    rivids = df["rivid"].tolist()
    is_flooded = df["Is_Flooded"].tolist()

    response = {
        "rivids": rivids,
        "is_flooded": is_flooded
    }

    return JsonResponse(response)
