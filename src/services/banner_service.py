from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import Banner
from src.schemas.schemas import BannerCreate, BannerUpdate, BannerResponse
from src.schemas.common import ApiResult
from src.crud.crud import BaseRepository
from src.utils.logger import get_logger

logger = get_logger("BANNER_SERVICE")
crud = BaseRepository(Banner)


async def get_all_banners(db: AsyncSession) -> ApiResult:
    try:
        logger.info("Fetching all banners")
        records = await crud.get_all(db)
        return ApiResult(result=[BannerResponse.model_validate(r) for r in records])
    except Exception as e:
        logger.error(f"Error fetching all banners: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def get_banner_by_id(db: AsyncSession, banner_id: int) -> ApiResult:
    try:
        logger.info(f"Fetching banner with ID: {banner_id}")
        record = await crud.get_by_id(db, banner_id)
        if not record:
            logger.warning(f"Banner not found: {banner_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Banner not found")
        return ApiResult(result=BannerResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error fetching banner {banner_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def create_banner(db: AsyncSession, data: BannerCreate) -> ApiResult:
    try:
        logger.info(f"Creating new banner: {data.bannername}")
        record = await crud.create(db, data.model_dump())
        return ApiResult(result=BannerResponse.model_validate(record), statusCode=201)
    except Exception as e:
        logger.error(f"Error creating banner: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def update_banner(db: AsyncSession, banner_id: int, data: BannerUpdate) -> ApiResult:
    try:
        logger.info(f"Updating banner: {banner_id}")
        record = await crud.update(db, banner_id, data.model_dump(exclude_unset=True))
        if not record:
            logger.warning(f"Banner not found for update: {banner_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Banner not found")
        return ApiResult(result=BannerResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error updating banner {banner_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def delete_banner(db: AsyncSession, banner_id: int) -> ApiResult:
    try:
        logger.info(f"Deleting banner: {banner_id}")
        record = await crud.delete(db, banner_id)
        if not record:
            logger.warning(f"Banner not found for deletion: {banner_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Banner not found")
        return ApiResult(result=BannerResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error deleting banner {banner_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))
