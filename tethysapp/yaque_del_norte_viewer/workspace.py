# Writes the landuse shapefile to a database with PostGIS
if __name__ == "__main__":
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy import create_engine, Column, Integer, String, Float
    from sqlalchemy.orm import sessionmaker
    from geoalchemy2 import Geometry
    import osgeo.ogr

    Base = declarative_base()
    engine = create_engine("postgresql://username:password@IP:PORT/mydatabase")

    # DB Class
    class SpatialLandUse(Base):
        __tablename__ = 'landuse_table'

        # Columns
        id = Column(Integer, primary_key=True)
        gridcode = Column(Integer)
        fid_1 = Column(Integer)
        id_1 = Column(Integer)
        gridcode_1 = Column(Integer)
        oid_ = Column(Integer)
        value = Column(Integer)
        count = Column(Float)
        class_name = Column(String)
        area = Column(Float)
        geom = Column(Geometry('GEOMETRY'))


    # Create table if it doesn't exist
    if not engine.dialect.has_table(engine, SpatialLandUse.__tablename__):
        SpatialLandUse.__table__.create(engine)

    # Read Shapefile with osgeo
    shapefile_path = r"/home/wade/Downloads/Yaque_Land_Use_WGS84/yaque_uso.shp"
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
            fid_1=feature.GetField("FID_1"),
            id_1=feature.GetField("ID_1"),
            gridcode_1=feature.GetField("GRIDCODE_1"),
            oid_=feature.GetField("OID_"),
            value=feature.GetField("Value"),
            count=feature.GetField("Count"),
            class_name=feature.GetField("Class_name").encode('utf-8'),
            area=feature.GetField("Area"),
            geom=geometry_string,
        )

        try:
            session.add(temp_region)
            session.commit()
        except Exception as e:
            print(e)

    # Commit and close DB session

    session.close()
