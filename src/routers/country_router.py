from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from uuid import uuid4
import os
from src.connections.database import get_db
from src.models.models import Country
from src.schemas.schemas import CountryCreate, CountryUpdate, CountryResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/countries", tags=["Countries"])


@router.get("/", response_model=ApiResult)
def get_all_countries(db: Session = Depends(get_db)):
    records = crud.get_all(db, Country)
    return ApiResult(result=[CountryResponse.model_validate(r) for r in records])


@router.get("/{country_id}", response_model=ApiResult)
def get_country(country_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, Country, country_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
    return ApiResult(result=CountryResponse.model_validate(record))


@router.post("/", response_model=ApiResult)
def create_country(data: CountryCreate, db: Session = Depends(get_db)):
    record = crud.create(db, Country, data.model_dump())
    return ApiResult(result=CountryResponse.model_validate(record), statusCode=201)


@router.put("/{country_id}", response_model=ApiResult)
def update_country(country_id: int, data: CountryUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, Country, country_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
    return ApiResult(result=CountryResponse.model_validate(record))


@router.delete("/{country_id}", response_model=ApiResult)
def delete_country(country_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, Country, country_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
    return ApiResult(result=CountryResponse.model_validate(record))


MEDIA_ROOT = "media"
MEDIA_COUNTRIES_DIR = os.path.join(MEDIA_ROOT, "countries", "logos")


@router.post("/upload-logo", response_model=ApiResult)
async def upload_country_logo(file: UploadFile = File(...)):
    """
    Upload a country logo image and return a URL path
    that can be stored in the `logourl` field.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        return ApiResult(
            result=None,
            statusCode=400,
            success=False,
            error="Only image uploads are allowed.",
        )

    os.makedirs(MEDIA_COUNTRIES_DIR, exist_ok=True)

    _, ext = os.path.splitext(file.filename or "")
    if not ext:
        ext = ".png"

    filename = f"{uuid4().hex}{ext}"
    file_path = os.path.join(MEDIA_COUNTRIES_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as out_file:
        out_file.write(contents)

    url_path = f"/media/countries/logos/{filename}"
    return ApiResult(result={"url": url_path})
