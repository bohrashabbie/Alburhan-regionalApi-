from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.connections.database import get_db
from src.schemas.schemas import BranchInfoCreate, BranchInfoUpdate
from src.schemas.common import ApiResult
from src.schemas.pagination import PaginationParams
from src.utils.cache_decorator import cacheable, invalidate_cache
from config.settings import CACHE_KEYS
from src.services import branch_service
from src.utils.logger import get_logger

logger = get_logger("BRANCH_ROUTER")
router = APIRouter(prefix="/branches", tags=["Branches"])

@router.get("/", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["BRANCHES_ALL"], ttl=60)
async def get_all_branches(
    db: AsyncSession = Depends(get_db),
    page: int = Query(None, ge=1, description="Page number"),
    page_size: int = Query(None, ge=1, le=100, description="Items per page")
):
    logger.info("GET /branches - Fetching all branches")
    pagination = PaginationParams(page=page, page_size=page_size) if page and page_size else None
    return await branch_service.get_all_branches(db, pagination)


@router.get("/{branch_id}", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["BRANCH_BY_ID"], ttl=60)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"GET /branches/{branch_id}")
    return await branch_service.get_branch_by_id(db, branch_id)


@router.post("/", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["BRANCHES_ALL"])
async def create_branch(data: BranchInfoCreate, db: AsyncSession = Depends(get_db)):
    logger.info("POST /branches - Creating new branch")
    return await branch_service.create_branch(db, data)


@router.put("/{branch_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["BRANCHES_ALL"], CACHE_KEYS["BRANCH_BY_ID"])
async def update_branch(branch_id: int, data: BranchInfoUpdate, db: AsyncSession = Depends(get_db)):
    logger.info(f"PUT /branches/{branch_id}")
    return await branch_service.update_branch(db, branch_id, data)


@router.delete("/{branch_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["BRANCHES_ALL"], CACHE_KEYS["BRANCH_BY_ID"])
async def delete_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"DELETE /branches/{branch_id}")
    return await branch_service.delete_branch(db, branch_id)
