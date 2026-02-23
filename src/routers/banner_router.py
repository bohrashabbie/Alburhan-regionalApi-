from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
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
