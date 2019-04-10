from __future__ import division
import time

from xarray import open_dataset
import uuid
import json
import os
import requests
from io import BytesIO
import numpy as np
import scipy.interpolate as si
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, func, Float
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry

# Tethys Imports
from .app import YaqueDelNorteViewer as App

# Creating base for database models
Base = declarative_base()


# Database Models
class SpatialLandUse(Base):
    __tablename__ = 'landuse_table'

    # Columns
    id = Column(Integer, primary_key=True)
    gridcode = Column(Integer)
    area = Column(Float)
    geom = Column(Geometry('GEOMETRY'))


# Model Functions
def calculate_cost(gridcode, depth, ratio):

    land_use_dict = {
        1: None,
        4: None,
        5: None,
        6: None,
        7: None,
        8: None,
        9: None,
        11: None,
        12: None,
        13: None,
        14: 'AGRICULTURAL',
        15: None,
        17: 'AGRICULTURAL',
        18: None,
        19: 'AGRICULTURAL',
        20: 'COMMERCIAL',
        30: None,
        31: None,
        39: None,
        42: 'AGRICULTURAL',
        43: 'AGRICULTURAL',
        45: 'AGRICULTURAL',
        46: 'AGRICULTURAL',
        48: 'AGRICULTURAL',
        49: 'AGRICULTURAL',
        51: 'AGRICULTURAL',
        52: 'AGRICULTURAL',
        85: None,
        105: 'AGRICULTURAL',
        112: None,
        137: 'AGRICULTURAL',
        144: None,
    }

    grid_code_map = land_use_dict[gridcode]

    if grid_code_map is None:
        return 0

    elif grid_code_map == "AGRICULTURAL":
        # Agricultural Depth Damage Interpolation
        x_agricultural = np.array([0, 0.5, 1.0, 1.5, 2.0, 3, 4, 5, 6])
        y_agricultural = np.array([0, 0.027, 0.048, 0.055, 0.061, 0.077, 0.088, 0.096, 0.101])  # y are cost in euros/m2
        y_agricultural_dollar = y_agricultural * ratio  # y are cost in dollars/m2
        interp_object_agricultural = si.PchipInterpolator(x_agricultural, y_agricultural_dollar)

        damage_per_area = interp_object_agricultural(depth)

        return damage_per_area * (90 * 90)  # 90 m DEM

    elif grid_code_map == "COMMERCIAL":
        # Commercial
        x_commercial = np.array([0, 0.5, 1.0, 1.5, 2.0, 3, 4, 5, 6])
        # y are cost in euros/m2
        y_commercial = np.array([0, 95.39, 130.97, 144.08, 154.75, 156.00, 156.00, 156.00, 156.00])
        y_commercial_dollar = y_commercial * ratio  # y are cost in dollars/m2
        interp_object_commercial = si.PchipInterpolator(x_commercial, y_commercial_dollar)

        damage_per_area = interp_object_commercial(depth)

        return damage_per_area * (90 * 90)  # 90 m DEM

    else:
        return 0

    # This is code to generate other curves, may be useful if the land use maps are updated
    # # Residential
    # x_residential = np.array([0, 0.5, 1.0, 1.5, 2.0, 3, 4, 5, 6])
    # y_residential = np.array([0, 34.85, 50.5, 59.78, 67.41, 69.84, 71.0, 71.0, 71.0])
    # y_residential_dollar = y_residential * ratio  # y are cost in dollars/m2
    # interp_object_Residential = si.PchipInterpolator(x_residential, y_residential_dollar)
    #
    # # Industrial
    # x_industrial = np.array([0, 0.5, 1.0, 1.5, 2.0, 3, 4, 5, 6])
    # y_industrial = np.array(
    #     [0, 90.05, 119.98, 127.81, 135.00, 135.00, 135.00, 135.00, 135.00])  # y are cost in euros/m2
    # y_industrial_dollar = y_industrial * ratio  # y are cost in dollars/m2
    # interp_object_Industrial = si.PchipInterpolator(x_industrial, y_industrial_dollar)


def generate_summary_df(query_string):

    # Create SQL_Alchemy engine
    db_name = App.get_custom_setting('Database Name')
    db_ip = App.get_custom_setting('Database IP')
    db_port = App.get_custom_setting('Database Port')
    db_username = App.get_custom_setting('Database Username')
    db_password = App.get_custom_setting('Database Password')

    engine = create_engine("postgresql://{}:{}@{}:{}/{}".format(
        db_username, db_password, db_ip, db_port, db_name)
    )

    start = time.time()
    # Get request for data from Thredds Server
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
    df = ds.to_dataframe().dropna()  # Drop NaN values
    ds.close()  # Close dataset
    os.remove(tmp_file_path)  # Remove temporary NetCDF file

    print("Time to Download file and read it again:", time.time() - start)

    start = time.time()

    df = df.loc[df["Height"] != 0]  # Drop Zero Values
    df = df.reset_index()  # Convert from multi-index df to single-index df

    print("zeros dropped and index reset")

    # Creating lat lon df
    print(df.columns)
    coord_df = df[["lat", "lon"]]
    print(len(coord_df))
    coord_df = coord_df.drop_duplicates()
    # coord_df["grid_code"] = 0
    print("coord df created and duplicates dropped")

    print("Time to manipulate the DF", time.time() - start)

    start = time.time()

    """Start Session"""
    Session = sessionmaker(bind=engine)
    session = Session()

    # TODO: Optimize this segment with an apply statement
    # Query for unique lat lon vals

    coord_dict = {}
    for i, df_tuple in enumerate(coord_df.itertuples(index=False)):

        lat = df_tuple.lat
        lon = df_tuple.lon

        """How to query to see where the point resides"""
        query = session.query(SpatialLandUse).filter(
            func.ST_Contains(SpatialLandUse.geom, 'SRID=4326;POINT({} {})'.format(lon, lat))
        )

        coord_dict[(lat, lon)] = query[0].gridcode
        assert query.count() == 1, "Query by point returned multiple polygons (model.generate_summary_df)"

    session.close()

    print("Time to query database", time.time() - start)

    start = time.time()

    df["grid_code"] = list(zip(df["lat"], df["lon"]))
    df["grid_code"] = df["grid_code"].map(coord_dict)

    print("Time to assign gridcodes to df", time.time() - start)

    # TODO: optimize this segment with the interpolation, I think calling scipy.interpolate is taking too long
    start = time.time()

    # Exchange Rate
    r = requests.get('https://api.exchangeratesapi.io/latest')
    json.loads(r.text)
    exchange_rates = json.loads(r.text)
    ratio = exchange_rates["rates"]["USD"]  # USD compared to Euros

    df["damage"] = list(zip(df["grid_code"], df["Height"]))

    df["damage"] = df["damage"].apply(lambda x: calculate_cost(x[0], x[1], ratio))

    print("Time to calculate damages", time.time() - start)

    start = time.time()

    # Convert dates to strings
    df["time"] = df["time"].apply(lambda x: x.strftime("%Y-%m-%d %H:%M:%S"))

    df.drop(["lat", "lon", "grid_code"], axis=1, inplace=True)

    df_summed = df.groupby(df["time"]).agg({'Height': 'max',
                                            'damage': 'sum',
                                            })

    print("Time to group and summarize", time.time() - start)

    print("Finished with summary df generation")

    return df_summed
