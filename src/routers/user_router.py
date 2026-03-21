from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.connections.database import get_db
from src.schemas.schemas import UserUpdate
from src.schemas.common import ApiResult
from src.utils.cache_decorator import cacheable, invalidate_cache
from config.settings import CACHE_KEYS
from src.services import user_service
from src.utils.logger import get_logger

logger = get_logger("USER_ROUTER")
router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["USERS_ALL"], ttl=60)
async def get_all_users(db: AsyncSession = Depends(get_db)):
    logger.info("GET /users - Fetching all users")
    return await user_service.get_all_users(db)


@router.get("/{user_id}", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["USER_BY_ID"], ttl=60)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"GET /users/{user_id}")
    return await user_service.get_user_by_id(db, user_id)


@router.put("/{user_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["USERS_ALL"], CACHE_KEYS["USER_BY_ID"])
async def update_user(user_id: int, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    logger.info(f"PUT /users/{user_id}")
    return await user_service.update_user(db, user_id, data)


@router.delete("/{user_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["USERS_ALL"], CACHE_KEYS["USER_BY_ID"])
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"DELETE /users/{user_id}")
    return await user_service.delete_user(db, user_id)
