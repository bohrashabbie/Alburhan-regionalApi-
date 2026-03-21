from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import BranchInfo
from src.schemas.schemas import BranchInfoCreate, BranchInfoUpdate, BranchInfoResponse
from src.schemas.common import ApiResult
from src.crud.crud import BaseRepository
from src.utils.logger import get_logger

logger = get_logger("BRANCH_SERVICE")
crud = BaseRepository(BranchInfo)


async def get_all_branches(db: AsyncSession) -> ApiResult:
    try:
        logger.info("Fetching all branches")
        records = await crud.get_all(db)
        return ApiResult(result=[BranchInfoResponse.model_validate(r) for r in records])
    except Exception as e:
        logger.error(f"Error fetching all branches: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def get_branch_by_id(db: AsyncSession, branch_id: int) -> ApiResult:
    try:
        logger.info(f"Fetching branch with ID: {branch_id}")
        record = await crud.get_by_id(db, branch_id)
        if not record:
            logger.warning(f"Branch not found: {branch_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Branch not found")
        return ApiResult(result=BranchInfoResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error fetching branch {branch_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def create_branch(db: AsyncSession, data: BranchInfoCreate) -> ApiResult:
    try:
        logger.info(f"Creating new branch: {data.branchname}")
        record = await crud.create(db, data.model_dump())
        return ApiResult(result=BranchInfoResponse.model_validate(record), statusCode=201)
    except Exception as e:
        logger.error(f"Error creating branch: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def update_branch(db: AsyncSession, branch_id: int, data: BranchInfoUpdate) -> ApiResult:
    try:
        logger.info(f"Updating branch: {branch_id}")
        record = await crud.update(db, branch_id, data.model_dump(exclude_unset=True))
        if not record:
            logger.warning(f"Branch not found for update: {branch_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Branch not found")
        return ApiResult(result=BranchInfoResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error updating branch {branch_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def delete_branch(db: AsyncSession, branch_id: int) -> ApiResult:
    try:
        logger.info(f"Deleting branch: {branch_id}")
        record = await crud.delete(db, branch_id)
        if not record:
            logger.warning(f"Branch not found for deletion: {branch_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Branch not found")
        return ApiResult(result=BranchInfoResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error deleting branch {branch_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))
