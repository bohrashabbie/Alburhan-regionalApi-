from sqlalchemy.ext.asyncio import AsyncSession
from src.models.models import Project
from src.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from src.schemas.common import ApiResult
from src.crud.crud import BaseRepository
from src.utils.logger import get_logger

logger = get_logger("PROJECT_SERVICE")
crud = BaseRepository(Project)


async def get_all_projects(db: AsyncSession) -> ApiResult:
    try:
        logger.info("Fetching all projects")
        records = await crud.get_all(db)
        return ApiResult(result=[ProjectResponse.model_validate(r) for r in records])
    except Exception as e:
        logger.error(f"Error fetching all projects: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def get_project_by_id(db: AsyncSession, project_id: int) -> ApiResult:
    try:
        logger.info(f"Fetching project with ID: {project_id}")
        record = await crud.get_by_id(db, project_id)
        if not record:
            logger.warning(f"Project not found: {project_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project not found")
        return ApiResult(result=ProjectResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def create_project(db: AsyncSession, data: ProjectCreate) -> ApiResult:
    try:
        logger.info(f"Creating new project: {data.projectname}")
        record = await crud.create(db, data.model_dump())
        return ApiResult(result=ProjectResponse.model_validate(record), statusCode=201)
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def update_project(db: AsyncSession, project_id: int, data: ProjectUpdate) -> ApiResult:
    try:
        logger.info(f"Updating project: {project_id}")
        record = await crud.update(db, project_id, data.model_dump(exclude_unset=True))
        if not record:
            logger.warning(f"Project not found for update: {project_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project not found")
        return ApiResult(result=ProjectResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))


async def delete_project(db: AsyncSession, project_id: int) -> ApiResult:
    try:
        logger.info(f"Deleting project: {project_id}")
        record = await crud.delete(db, project_id)
        if not record:
            logger.warning(f"Project not found for deletion: {project_id}")
            return ApiResult(result=None, statusCode=404, success=False, error="Project not found")
        return ApiResult(result=ProjectResponse.model_validate(record))
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {str(e)}")
        return ApiResult(result=None, statusCode=500, success=False, error=str(e))
