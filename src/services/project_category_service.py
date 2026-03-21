from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import ProjectCategory
from src.schemas.schemas import ProjectCategoryCreate, ProjectCategoryUpdate, ProjectCategoryResponse
from src.schemas.common import ApiResult
from src.crud.crud import BaseRepository
from src.utils.logger import get_logger

logger = get_logger("PROJECT_CATEGORY_SERVICE")
crud = BaseRepository(ProjectCategory)


async def get_all_categories(db: AsyncSession) -> ApiResult:
    try:
        logger.info("Fetching all project categories")
        records = await crud.get_all(db)
        return ApiResult(result=[ProjectCategoryResponse.model_validate(r) for r in records])
    except Exception as e:
        logger.error(f"Error fetching all project categories: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def get_category_by_id(db: AsyncSession, category_id: int) -> ApiResult:
    try:
        logger.info(f"Fetching project category with ID: {category_id}")
        record = await crud.get_by_id(db, category_id)
        if not record:
            logger.warning(f"Project category not found: {category_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project category not found")
        return ApiResult(result=ProjectCategoryResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error fetching project category {category_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def create_category(db: AsyncSession, data: ProjectCategoryCreate) -> ApiResult:
    try:
        logger.info(f"Creating new project category: {data.categoryname}")
        record = await crud.create(db, data.model_dump())
        return ApiResult(result=ProjectCategoryResponse.model_validate(record), statusCode=201)
    except Exception as e:
        logger.error(f"Error creating project category: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def update_category(db: AsyncSession, category_id: int, data: ProjectCategoryUpdate) -> ApiResult:
    try:
        logger.info(f"Updating project category: {category_id}")
        record = await crud.update(db, category_id, data.model_dump(exclude_unset=True))
        if not record:
            logger.warning(f"Project category not found for update: {category_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project category not found")
        return ApiResult(result=ProjectCategoryResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error updating project category {category_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def delete_category(db: AsyncSession, category_id: int) -> ApiResult:
    try:
        logger.info(f"Deleting project category: {category_id}")
        record = await crud.delete(db, category_id)
        if not record:
            logger.warning(f"Project category not found for deletion: {category_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project category not found")
        return ApiResult(result=ProjectCategoryResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error deleting project category {category_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))
