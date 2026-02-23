from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.connections.database import get_db
from src.models.models import ProjectCategory
from src.schemas.schemas import ProjectCategoryCreate, ProjectCategoryUpdate, ProjectCategoryResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/project-categories", tags=["Project Categories"])


@router.get("/", response_model=ApiResult)
def get_all_categories(db: Session = Depends(get_db)):
    records = crud.get_all(db, ProjectCategory)
    return ApiResult(result=[ProjectCategoryResponse.model_validate(r) for r in records])


@router.get("/{category_id}", response_model=ApiResult)
def get_category(category_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, ProjectCategory, category_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project category not found")
    return ApiResult(result=ProjectCategoryResponse.model_validate(record))


@router.post("/", response_model=ApiResult)
def create_category(data: ProjectCategoryCreate, db: Session = Depends(get_db)):
    record = crud.create(db, ProjectCategory, data.model_dump())
    return ApiResult(result=ProjectCategoryResponse.model_validate(record), statusCode=201)


@router.put("/{category_id}", response_model=ApiResult)
def update_category(category_id: int, data: ProjectCategoryUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, ProjectCategory, category_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project category not found")
    return ApiResult(result=ProjectCategoryResponse.model_validate(record))


@router.delete("/{category_id}", response_model=ApiResult)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, ProjectCategory, category_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project category not found")
    return ApiResult(result=ProjectCategoryResponse.model_validate(record))
