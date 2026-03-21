from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.connections.database import get_db
from src.schemas.schemas import ProjectCategoryCreate, ProjectCategoryUpdate
from src.schemas.common import ApiResult
from src.schemas.pagination import PaginationParams
from src.utils.cache_decorator import cacheable, invalidate_cache
from config.settings import CACHE_KEYS
from src.services import project_category_service
from src.utils.logger import get_logger

logger = get_logger("PROJECT_CATEGORY_ROUTER")
router = APIRouter(prefix="/project-categories", tags=["Project Categories"])

@router.get("/", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["PROJECT_CATEGORIES_ALL"], ttl=60)
async def get_all_categories(
    db: AsyncSession = Depends(get_db),
    page: int = Query(None, ge=1, description="Page number"),
    page_size: int = Query(None, ge=1, le=100, description="Items per page")
):
    logger.info("GET /project-categories - Fetching all categories")
    pagination = PaginationParams(page=page, page_size=page_size) if page and page_size else None
    return await project_category_service.get_all_categories(db, pagination)


@router.get("/{category_id}", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["PROJECT_CATEGORY_BY_ID"], ttl=60)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"GET /project-categories/{category_id}")
    return await project_category_service.get_category_by_id(db, category_id)


@router.post("/", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECT_CATEGORIES_ALL"])
async def create_category(data: ProjectCategoryCreate, db: AsyncSession = Depends(get_db)):
    logger.info("POST /project-categories - Creating new category")
    return await project_category_service.create_category(db, data)


@router.put("/{category_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECT_CATEGORIES_ALL"], CACHE_KEYS["PROJECT_CATEGORY_BY_ID"])
async def update_category(category_id: int, data: ProjectCategoryUpdate, db: AsyncSession = Depends(get_db)):
    logger.info(f"PUT /project-categories/{category_id}")
    return await project_category_service.update_category(db, category_id, data)


@router.delete("/{category_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECT_CATEGORIES_ALL"], CACHE_KEYS["PROJECT_CATEGORY_BY_ID"])
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"DELETE /project-categories/{category_id}")
    return await project_category_service.delete_category(db, category_id)
