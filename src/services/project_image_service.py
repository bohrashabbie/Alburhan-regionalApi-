from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import ProjectImage
from src.schemas.schemas import ProjectImageCreate, ProjectImageUpdate, ProjectImageResponse
from src.schemas.common import ApiResult
from src.schemas.pagination import PaginationParams, PaginatedResponse
from src.crud.crud import BaseRepository
from src.utils.logger import get_logger

logger = get_logger("PROJECT_IMAGE_SERVICE")
crud = BaseRepository(ProjectImage)


async def get_all_images(db: AsyncSession, pagination: PaginationParams = None) -> ApiResult:
    try:
        logger.info(f"Fetching project images (page={pagination.page if pagination else 'all'})")
        
        if pagination:
            records = await crud.get_all(db, skip=pagination.skip, limit=pagination.limit)
            total = await crud.count(db)
            
            paginated = PaginatedResponse.create(
                items=[ProjectImageResponse.model_validate(r) for r in records],
                total=total,
                page=pagination.page,
                page_size=pagination.page_size
            )
            return ApiResult(result=paginated.model_dump())
        else:
            records = await crud.get_all(db)
            return ApiResult(result=[ProjectImageResponse.model_validate(r) for r in records])
    except Exception as e:
        logger.error(f"Error fetching all project images: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def get_image_by_id(db: AsyncSession, image_id: int) -> ApiResult:
    try:
        logger.info(f"Fetching project image with ID: {image_id}")
        record = await crud.get_by_id(db, image_id)
        if not record:
            logger.warning(f"Project image not found: {image_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project image not found")
        return ApiResult(result=ProjectImageResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error fetching project image {image_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def create_image(db: AsyncSession, data: ProjectImageCreate) -> ApiResult:
    try:
        logger.info(f"Creating new project image for project: {data.projectid}")
        record = await crud.create(db, data.model_dump())
        return ApiResult(result=ProjectImageResponse.model_validate(record), statusCode=201)
    except Exception as e:
        logger.error(f"Error creating project image: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def update_image(db: AsyncSession, image_id: int, data: ProjectImageUpdate) -> ApiResult:
    try:
        logger.info(f"Updating project image: {image_id}")
        record = await crud.update(db, image_id, data.model_dump(exclude_unset=True))
        if not record:
            logger.warning(f"Project image not found for update: {image_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project image not found")
        return ApiResult(result=ProjectImageResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error updating project image {image_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def delete_image(db: AsyncSession, image_id: int) -> ApiResult:
    try:
        logger.info(f"Deleting project image: {image_id}")
        record = await crud.delete(db, image_id)
        if not record:
            logger.warning(f"Project image not found for deletion: {image_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project image not found")
        return ApiResult(result=ProjectImageResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error deleting project image {image_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))
