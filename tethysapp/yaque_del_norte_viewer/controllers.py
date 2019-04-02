# Django imports
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

# Tethys imports
from .model import generate_summary_df

# Other imports
import traceback
import json
import numpy as np


@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, 'yaque_del_norte_viewer/home.html', context)


@login_required()
def damage_report_ajax(request):
    """
    Ajax controller to generate the damage report
    """
    try:
        json_body = json.loads(request.body)

        query_string = json_body["query_string"]

        summary_df = generate_summary_df(query_string)

        time_list = summary_df.index.to_list()
        max_height_list = summary_df["Height"].values.tolist()
        damage_list = np.round(summary_df["damage"].values, 2).tolist()

        response = {
            "error": False,
            "time_list": time_list,
            "max_height_list": max_height_list,
            "damage_list": damage_list
        }

        return JsonResponse(response)

    except Exception:
        tb = traceback.format_exc()

        response = {
            "error": True,
            "traceback": tb,
        }

        return JsonResponse(response)
