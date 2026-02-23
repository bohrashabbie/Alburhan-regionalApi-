from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.connections.database import get_db
from src.models.models import ProjectImage
from src.schemas.schemas import ProjectImageCreate, ProjectImageUpdate, ProjectImageResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/project-images", tags=["Project Images"])


@router.get("/", response_model=ApiResult)
def get_all_images(db: Session = Depends(get_db)):
    records = crud.get_all(db, ProjectImage)
    return ApiResult(result=[ProjectImageResponse.model_validate(r) for r in records])


@router.get("/{image_id}", response_model=ApiResult)
def get_image(image_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, ProjectImage, image_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project image not found")
    return ApiResult(result=ProjectImageResponse.model_validate(record))


@router.post("/", response_model=ApiResult)
def create_image(data: ProjectImageCreate, db: Session = Depends(get_db)):
    record = crud.create(db, ProjectImage, data.model_dump())
    return ApiResult(result=ProjectImageResponse.model_validate(record), statusCode=201)


@router.put("/{image_id}", response_model=ApiResult)
def update_image(image_id: int, data: ProjectImageUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, ProjectImage, image_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project image not found")
    return ApiResult(result=ProjectImageResponse.model_validate(record))


@router.delete("/{image_id}", response_model=ApiResult)
def delete_image(image_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, ProjectImage, image_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project image not found")
    return ApiResult(result=ProjectImageResponse.model_validate(record))
