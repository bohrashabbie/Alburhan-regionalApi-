from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import User
from src.schemas.schemas import UserUpdate, UserResponse
from src.schemas.common import ApiResult
from src.schemas.pagination import PaginationParams, PaginatedResponse
from src.crud.crud import BaseRepository
from src.utils.logger import get_logger

logger = get_logger("USER_SERVICE")
crud = BaseRepository(User)


async def get_all_users(db: AsyncSession, pagination: PaginationParams = None) -> ApiResult:
    try:
        logger.info(f"Fetching users (page={pagination.page if pagination else 'all'})")
        
        if pagination:
            records = await crud.get_all(db, skip=pagination.skip, limit=pagination.limit)
            total = await crud.count(db)
            
            paginated = PaginatedResponse.create(
                items=[UserResponse.model_validate(r) for r in records],
                total=total,
                page=pagination.page,
                page_size=pagination.page_size
            )
            return ApiResult(result=paginated.model_dump())
        else:
            records = await crud.get_all(db)
            return ApiResult(result=[UserResponse.model_validate(r) for r in records])
    except Exception as e:
        logger.error(f"Error fetching all users: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def get_user_by_id(db: AsyncSession, user_id: int) -> ApiResult:
    try:
        logger.info(f"Fetching user with ID: {user_id}")
        record = await crud.get_by_id(db, user_id)
        if not record:
            logger.warning(f"User not found: {user_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="User not found")
        return ApiResult(result=UserResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def update_user(db: AsyncSession, user_id: int, data: UserUpdate) -> ApiResult:
    try:
        logger.info(f"Updating user: {user_id}")
        record = await crud.update(db, user_id, data.model_dump(exclude_unset=True))
        if not record:
            logger.warning(f"User not found for update: {user_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="User not found")
        return ApiResult(result=UserResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def delete_user(db: AsyncSession, user_id: int) -> ApiResult:
    try:
        logger.info(f"Deleting user: {user_id}")
        record = await crud.delete(db, user_id)
        if not record:
            logger.warning(f"User not found for deletion: {user_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="User not found")
        return ApiResult(result=UserResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))
