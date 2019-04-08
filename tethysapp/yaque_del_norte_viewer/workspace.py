# Writes the landuse shapefile to a database with PostGIS
if __name__ == "__main__":
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy import create_engine, Column, Integer, String, Float
    from sqlalchemy.orm import sessionmaker
    from geoalchemy2 import Geometry
    import osgeo.ogr

    Base = declarative_base()
    engine = create_engine("")  # Engine information goes here

    # DB Class
    class SpatialLandUse(Base):
        __tablename__ = 'landuse_table'

        # Columns
        id = Column(Integer, primary_key=True)
        gridcode = Column(Integer)
        area = Column(Float)
        geom = Column(Geometry('GEOMETRY'))


    # Create table if it doesn't exist
    if not engine.dialect.has_table(engine, SpatialLandUse.__tablename__):
        SpatialLandUse.__table__.create(engine)

    # Read Shapefile with osgeo
    shapefile_path = r"/home/wade/Downloads/LandUseShapefile/LandUse.shp"
    shapefile_obj = osgeo.ogr.Open(shapefile_path)
    layer = shapefile_obj.GetLayer(0)
    layerDefinition = layer.GetLayerDefn()

    # New DB Session
    Session = sessionmaker(bind=engine)
    session = Session()

    # Creating Objects to store in the database
    for i in range(layer.GetFeatureCount()):
        feature = layer.GetFeature(i)
        wkt = feature.GetGeometryRef().ExportToWkt()

        geometry_string = "SRID=4326;{}".format(wkt)
        temp_region = SpatialLandUse(
            gridcode=feature.GetField("GRIDCODE"),
            area=feature.GetField("Area"),
            geom=geometry_string,
        )

        try:
            session.add(temp_region)
            session.commit()
        except Exception as e:
            print(e)

    # Close DB session
    session.close()
