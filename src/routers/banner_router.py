from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from uuid import uuid4
import os
from src.connections.database import get_db
from src.models.models import Banner
from src.schemas.schemas import BannerCreate, BannerUpdate, BannerResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/banners", tags=["Banners"])


@router.get("/", response_model=ApiResult)
def get_all_banners(db: Session = Depends(get_db)):
    records = crud.get_all(db, Banner)
    return ApiResult(result=[BannerResponse.model_validate(r) for r in records])


@router.get("/{banner_id}", response_model=ApiResult)
def get_banner(banner_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, Banner, banner_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Banner not found")
    return ApiResult(result=BannerResponse.model_validate(record))


@router.post("/", response_model=ApiResult)
def create_banner(data: BannerCreate, db: Session = Depends(get_db)):
    record = crud.create(db, Banner, data.model_dump())
    return ApiResult(result=BannerResponse.model_validate(record), statusCode=201)


@router.put("/{banner_id}", response_model=ApiResult)
def update_banner(banner_id: int, data: BannerUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, Banner, banner_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Banner not found")
    return ApiResult(result=BannerResponse.model_validate(record))


@router.delete("/{banner_id}", response_model=ApiResult)
def delete_banner(banner_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, Banner, banner_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Banner not found")
    return ApiResult(result=BannerResponse.model_validate(record))


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
