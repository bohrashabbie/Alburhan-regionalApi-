from fastapi import APIRouter, Depends, UploadFile, File
from uuid import uuid4
import os
from src.connections.database import get_db
from src.schemas.schemas import BannerCreate, BannerUpdate
from src.schemas.common import ApiResult
from sqlalchemy.ext.asyncio import AsyncSession
from src.utils.cache_decorator import cacheable, invalidate_cache
from config.settings import CACHE_KEYS
from src.services import banner_service
from src.utils.logger import get_logger

logger = get_logger("BANNER_ROUTER")
router = APIRouter(prefix="/banners", tags=["Banners"])


@router.get("/", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["BANNERS_ALL"], ttl=60)
async def get_all_banners(db: AsyncSession = Depends(get_db)):
    logger.info("GET /banners - Fetching all banners")
    return await banner_service.get_all_banners(db)

@router.get("/{banner_id}", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["BANNER_BY_ID"], ttl=60)
async def get_banner(banner_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"GET /banners/{banner_id}")
    return await banner_service.get_banner_by_id(db, banner_id)


@router.post("/", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["BANNERS_ALL"])
async def create_banner(data: BannerCreate, db: AsyncSession = Depends(get_db)):
    logger.info("POST /banners - Creating new banner")
    return await banner_service.create_banner(db, data)


@router.put("/{banner_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["BANNERS_ALL"], CACHE_KEYS["BANNER_BY_ID"])
async def update_banner(banner_id: int, data: BannerUpdate, db: AsyncSession = Depends(get_db)):
    logger.info(f"PUT /banners/{banner_id}")
    return await banner_service.update_banner(db, banner_id, data)


@router.delete("/{banner_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["BANNERS_ALL"], CACHE_KEYS["BANNER_BY_ID"])
async def delete_banner(banner_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"DELETE /banners/{banner_id}")
    return await banner_service.delete_banner(db, banner_id)



# Upload image api
MEDIA_ROOT = "media"
MEDIA_BANNERS_DIR = os.path.join(MEDIA_ROOT, "banners")


@router.post("/upload-image", response_model=ApiResult)
async def upload_banner_image(file: UploadFile = File(...)):
    """
    Receive an image file, save it to disk, and return a URL path
    that can be stored in the banner's `bannerurl` field.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        return ApiResult(
            result=None,
            statusCode=400,
            success=False,
            error="Only image uploads are allowed.",
        )

    os.makedirs(MEDIA_BANNERS_DIR, exist_ok=True)

    _, ext = os.path.splitext(file.filename or "")
    if not ext:
        ext = ".png"

    filename = f"{uuid4().hex}{ext}"
    file_path = os.path.join(MEDIA_BANNERS_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as out_file:
        out_file.write(contents)

    # Store a relative URL; frontend will prepend backend base URL when rendering.
    url_path = f"/media/banners/{filename}"
    return ApiResult(result={"url": url_path})
