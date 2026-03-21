from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.connections.database import get_db
from src.schemas.schemas import ProjectCreate, ProjectUpdate
from src.schemas.common import ApiResult
from src.schemas.pagination import PaginationParams
from src.utils.cache_decorator import cacheable, invalidate_cache
from config.settings import CACHE_KEYS
from src.services import project_service
from src.utils.logger import get_logger

logger = get_logger("PROJECT_ROUTER")
router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["PROJECTS_ALL"], ttl=60)
async def get_all_projects(
    db: AsyncSession = Depends(get_db),
    page: int = Query(None, ge=1, description="Page number"),
    page_size: int = Query(None, ge=1, le=100, description="Items per page")
):
    logger.info("GET /projects - Fetching all projects")
    pagination = PaginationParams(page=page, page_size=page_size) if page and page_size else None
    return await project_service.get_all_projects(db, pagination)


@router.get("/{project_id}", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["PROJECT_BY_ID"], ttl=60)
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"GET /projects/{project_id}")
    return await project_service.get_project_by_id(db, project_id)


@router.post("/", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECTS_ALL"])
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    logger.info("POST /projects - Creating new project")
    return await project_service.create_project(db, data)


@router.put("/{project_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECTS_ALL"], CACHE_KEYS["PROJECT_BY_ID"])
async def update_project(project_id: int, data: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    logger.info(f"PUT /projects/{project_id}")
    return await project_service.update_project(db, project_id, data)


@router.delete("/{project_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECTS_ALL"], CACHE_KEYS["PROJECT_BY_ID"])
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"DELETE /projects/{project_id}")
    return await project_service.delete_project(db, project_id)
