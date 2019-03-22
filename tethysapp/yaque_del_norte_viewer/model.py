from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, func, Float
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry

Base = declarative_base()
engine = create_engine("postgresql://tethys_super:pass@localhost:5436/postgres")


# Database Models
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


"""Start Session"""
Session = sessionmaker(bind=engine)
session = Session()


"""How to query to see where the point resides"""
# query = session.query(SpatialPopulation).filter(
#     func.ST_Contains(SpatialPopulation.geom, 'SRID=4326;POINT(-71.298244 19.603763)')
# )
#
# for i in query:
#     print(i)

session.close()