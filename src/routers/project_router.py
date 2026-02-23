from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.connections.database import get_db
from src.models.models import Project
from src.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=ApiResult)
def get_all_projects(db: Session = Depends(get_db)):
    records = crud.get_all(db, Project)
    return ApiResult(result=[ProjectResponse.model_validate(r) for r in records])


@router.get("/{project_id}", response_model=ApiResult)
def get_project(project_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, Project, project_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project not found")
    return ApiResult(result=ProjectResponse.model_validate(record))


@router.post("/", response_model=ApiResult)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    record = crud.create(db, Project, data.model_dump())
    return ApiResult(result=ProjectResponse.model_validate(record), statusCode=201)


@router.put("/{project_id}", response_model=ApiResult)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, Project, project_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project not found")
    return ApiResult(result=ProjectResponse.model_validate(record))


@router.delete("/{project_id}", response_model=ApiResult)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, Project, project_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Project not found")
    return ApiResult(result=ProjectResponse.model_validate(record))
