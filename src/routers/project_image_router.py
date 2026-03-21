from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.connections.database import get_db
from src.schemas.schemas import ProjectImageCreate, ProjectImageUpdate
from src.schemas.common import ApiResult
from src.utils.cache_decorator import cacheable, invalidate_cache
from config.settings import CACHE_KEYS
from src.services import project_image_service
from src.utils.logger import get_logger

logger = get_logger("PROJECT_IMAGE_ROUTER")
router = APIRouter(prefix="/project-images", tags=["Project Images"])

@router.get("/", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["PROJECT_IMAGES_ALL"], ttl=60)
async def get_all_images(db: AsyncSession = Depends(get_db)):
    logger.info("GET /project-images - Fetching all images")
    return await project_image_service.get_all_images(db)


@router.get("/{image_id}", response_model=ApiResult)
@cacheable(key=CACHE_KEYS["PROJECT_IMAGE_BY_ID"], ttl=60)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"GET /project-images/{image_id}")
    return await project_image_service.get_image_by_id(db, image_id)


@router.post("/", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECT_IMAGES_ALL"])
async def create_image(data: ProjectImageCreate, db: AsyncSession = Depends(get_db)):
    logger.info("POST /project-images - Creating new image")
    return await project_image_service.create_image(db, data)


@router.put("/{image_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECT_IMAGES_ALL"], CACHE_KEYS["PROJECT_IMAGE_BY_ID"])
async def update_image(image_id: int, data: ProjectImageUpdate, db: AsyncSession = Depends(get_db)):
    logger.info(f"PUT /project-images/{image_id}")
    return await project_image_service.update_image(db, image_id, data)


@router.delete("/{image_id}", response_model=ApiResult)
@invalidate_cache(CACHE_KEYS["PROJECT_IMAGES_ALL"], CACHE_KEYS["PROJECT_IMAGE_BY_ID"])
async def delete_image(image_id: int, db: AsyncSession = Depends(get_db)):
    logger.info(f"DELETE /project-images/{image_id}")
    return await project_image_service.delete_image(db, image_id)
