from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


# --- Banner ---
class BannerCreate(BaseModel):
    bannername: str
    bannerdescription: Optional[str] = None
    info1: Optional[str] = None
    countryid: Optional[int] = None
    bannertype: Optional[str] = None
    isactive: Optional[bool] = True
    sequencenumber: Optional[int] = None
    bannerurl: Optional[str] = None
    position: Optional[str] = None


class BannerUpdate(BaseModel):
    bannername: Optional[str] = None
    bannerdescription: Optional[str] = None
    info1: Optional[str] = None
    countryid: Optional[int] = None
    bannertype: Optional[str] = None
    isactive: Optional[bool] = None
    sequencenumber: Optional[int] = None
    bannerurl: Optional[str] = None
    position: Optional[str] = None


class BannerResponse(BaseModel):
    id: int
    bannername: str
    bannerdescription: Optional[str] = None
    info1: Optional[str] = None
    countryid: Optional[int] = None
    bannertype: Optional[str] = None
    isactive: Optional[bool] = None
    sequencenumber: Optional[int] = None
    bannerurl: Optional[str] = None
    position: Optional[str] = None

    class Config:
        from_attributes = True


# --- BranchInfo ---
class BranchInfoCreate(BaseModel):
    countryid: Optional[int] = None
    email: Optional[EmailStr] = None
    countrycode: Optional[str] = None
    branchname: Optional[str] = None
    branchaddress: Optional[str] = None
    contact1: Optional[str] = None
    contact2: Optional[str] = None
    isactive: Optional[bool] = True


class BranchInfoUpdate(BaseModel):
    countryid: Optional[int] = None
    email: Optional[EmailStr] = None
    countrycode: Optional[str] = None
    branchname: Optional[str] = None
    branchaddress: Optional[str] = None
    contact1: Optional[str] = None
    contact2: Optional[str] = None
    isactive: Optional[bool] = None


class BranchInfoResponse(BaseModel):
    id: int
    countryid: Optional[int] = None
    email: Optional[EmailStr] = None
    countrycode: Optional[str] = None
    branchname: Optional[str] = None
    branchaddress: Optional[str] = None
    contact1: Optional[str] = None
    contact2: Optional[str] = None
    isactive: Optional[bool] = None

    @field_validator("email", mode="before")
    def empty_email_to_none(cls, v):
        if v == "":
            return None
        return v
    class Config:
        from_attributes = True


# --- Country ---
class CountryCreate(BaseModel):
    countrynameen: Optional[str] = None
    countrynamear: Optional[str] = None
    isactive: Optional[bool] = True
    sequencenumber: Optional[int] = None
    logourl: Optional[str] = None
    countryurl: Optional[str] = None


class CountryUpdate(BaseModel):
    countrynameen: Optional[str] = None
    countrynamear: Optional[str] = None
    isactive: Optional[bool] = None
    sequencenumber: Optional[int] = None
    logourl: Optional[str] = None
    countryurl: Optional[str] = None


class CountryResponse(BaseModel):
    id: int
    countrynameen: Optional[str] = None
    countrynamear: Optional[str] = None
    isactive: Optional[bool] = None
    sequencenumber: Optional[int] = None
    logourl: Optional[str] = None
    countryurl: Optional[str] = None

    class Config:
        from_attributes = True


# --- ProjectCategory ---
class ProjectCategoryCreate(BaseModel):
    category_name: str
    cover_image_url: Optional[str] = None


class ProjectCategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    cover_image_url: Optional[str] = None


class ProjectCategoryResponse(BaseModel):
    id: int
    category_name: str
    cover_image_url: Optional[str] = None

    class Config:
        from_attributes = True


# --- ProjectImage ---
class ProjectImageCreate(BaseModel):
    projectid: Optional[int] = None
    projectimageurl: Optional[str] = None
    sequencenumber: Optional[int] = None
    isactive: Optional[bool] = True


class ProjectImageUpdate(BaseModel):
    projectid: Optional[int] = None
    projectimageurl: Optional[str] = None
    sequencenumber: Optional[int] = None
    isactive: Optional[bool] = None


class ProjectImageResponse(BaseModel):
    id: int
    projectid: Optional[int] = None
    projectimageurl: Optional[str] = None
    sequencenumber: Optional[int] = None
    isactive: Optional[bool] = None

    class Config:
        from_attributes = True


# --- Project ---
class ProjectCreate(BaseModel):
    categoryid: Optional[int] = None
    projectname: str
    projectdescription: Optional[str] = None


class ProjectUpdate(BaseModel):
    categoryid: Optional[int] = None
    projectname: Optional[str] = None
    projectdescription: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    categoryid: Optional[int] = None
    projectname: str
    projectdescription: Optional[str] = None

    class Config:
        from_attributes = True


# --- User ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    fullname: Optional[str] = None
    role: Optional[str] = "user"


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    fullname: Optional[str] = None
    role: Optional[str] = None
    isactive: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    fullname: Optional[str] = None
    role: Optional[str] = None
    isactive: Optional[bool] = None

    class Config:
        from_attributes = True
