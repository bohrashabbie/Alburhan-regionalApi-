from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import Country
from src.schemas.schemas import CountryCreate, CountryUpdate, CountryResponse
from src.schemas.common import ApiResult
from src.crud.crud import BaseRepository
from src.utils.logger import get_logger

logger = get_logger("COUNTRY_SERVICE")
crud = BaseRepository(Country)


async def get_all_countries(db: AsyncSession) -> ApiResult:
    try:
        logger.info("Fetching all countries")
        records = await crud.get_all(db)
        return ApiResult(result=[CountryResponse.model_validate(r) for r in records])
    except Exception as e:
        logger.error(f"Error fetching all countries: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def get_country_by_id(db: AsyncSession, country_id: int) -> ApiResult:
    try:
        logger.info(f"Fetching country with ID: {country_id}")
        record = await crud.get_by_id(db, country_id)
        if not record:
            logger.warning(f"Country not found: {country_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
        return ApiResult(result=CountryResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error fetching country {country_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def create_country(db: AsyncSession, data: CountryCreate) -> ApiResult:
    try:
        logger.info(f"Creating new country: {data.countryname}")
        record = await crud.create(db, data.model_dump())
        return ApiResult(result=CountryResponse.model_validate(record), statusCode=201)
    except Exception as e:
        logger.error(f"Error creating country: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def update_country(db: AsyncSession, country_id: int, data: CountryUpdate) -> ApiResult:
    try:
        logger.info(f"Updating country: {country_id}")
        record = await crud.update(db, country_id, data.model_dump(exclude_unset=True))
        if not record:
            logger.warning(f"Country not found for update: {country_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
        return ApiResult(result=CountryResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error updating country {country_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def delete_country(db: AsyncSession, country_id: int) -> ApiResult:
    try:
        logger.info(f"Deleting country: {country_id}")
        record = await crud.delete(db, country_id)
        if not record:
            logger.warning(f"Country not found for deletion: {country_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
        return ApiResult(result=CountryResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error deleting country {country_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))
