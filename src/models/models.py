from sqlalchemy import Column, Integer, String, Text, Boolean
from src.connections.database import Base


class Banner(Base):
    __tablename__ = "banner"

    id = Column(Integer, primary_key=True, index=True)
    bannername = Column("bannername", String(300), nullable=False)
    bannerdescription = Column("bannerdescription", Text)
    info1 = Column(Text)
    countryid = Column("countryid", Integer)
    bannertype = Column("bannertype", String(100))
    isactive = Column("isactive", Boolean, default=True)
    sequencenumber = Column("sequencenumber", Integer)
    bannerurl = Column("bannerurl", Text)
    position = Column(String(100))


class BranchInfo(Base):
    __tablename__ = "branch_info"

    id = Column(Integer, primary_key=True, index=True)
    countryid = Column("countryid", Integer)
    email = Column(String(300))
    countrycode = Column("countrycode", String(20))
    branchname = Column("branchname", String(300))
    branchaddress = Column("branchaddress", Text)
    contact1 = Column(String(100))
    contact2 = Column(String(100))
    isactive = Column("isactive", Boolean, default=True)


class Country(Base):
    __tablename__ = "country"

    id = Column(Integer, primary_key=True, index=True)
    countrynameen = Column("countrynameen", String(300))
    countrynamear = Column("countrynamear", String(300))
    isactive = Column("isactive", Boolean, default=True)
    sequencenumber = Column("sequencenumber", Integer)
    logourl = Column("logourl", Text)
    countryurl = Column("countryurl", Text)


class ProjectCategory(Base):
    __tablename__ = "project_category"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(300), nullable=False)
    cover_image_url = Column(Text)


class ProjectImage(Base):
    __tablename__ = "project_image"

    id = Column(Integer, primary_key=True, index=True)
    projectid = Column("projectid", Integer)
    projectimageurl = Column("projectimageurl", Text)
    sequencenumber = Column("sequencenumber", Integer)
    isactive = Column("isactive", Boolean, default=True)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    categoryid = Column("categoryid", Integer)
    projectname = Column("projectname", String(400), nullable=False)
    projectdescription = Column("projectdescription", Text)
