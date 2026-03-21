from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
import os
from src.connections.database import get_db
from src.schemas.schemas import CountryCreate, CountryUpdate
from src.schemas.common import ApiResult
from src.utils.cache_decorator import cacheable, invalidate_cache
from config.settings import CACHE_KEYS
from src.services import country_service
from src.utils.logger import get_logger

logger = get_logger("COUNTRY_ROUTER")
router = APIRouter(prefix="/countries", tags=["Countries"])

@router.get("/", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["COUNTRIES_ALL"], ttl=60)
async def get_all_countries(db: AsyncSession = Depends(get_db)):
    logger.info("GET /countries - Fetching all countries")
    return await country_service.get_all_countries(db)


@router.get("/{country_id}", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["COUNTRY_BY_ID"], ttl=60)
async def get_country(country_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"GET /countries/{country_id}")
    return await country_service.get_country_by_id(db, country_id)


@router.post("/", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["COUNTRIES_ALL"])
async def create_country(data: CountryCreate, db: AsyncSession = Depends(get_db)):
    logger.info("POST /countries - Creating new country")
    return await country_service.create_country(db, data)


@router.put("/{country_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["COUNTRIES_ALL"], CACHE_KEYS["COUNTRY_BY_ID"])
async def update_country(country_id: int, data: CountryUpdate, db: AsyncSession = Depends(get_db)):
    logger.info(f"PUT /countries/{country_id}")
    return await country_service.update_country(db, country_id, data)


@router.delete("/{country_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["COUNTRIES_ALL"], CACHE_KEYS["COUNTRY_BY_ID"])
async def delete_country(country_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"DELETE /countries/{country_id}")
    return await country_service.delete_country(db, country_id)


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
