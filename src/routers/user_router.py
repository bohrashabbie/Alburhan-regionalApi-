from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.connections.database import get_db
from src.models.models import User
from src.schemas.schemas import UserUpdate, UserResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=ApiResult)
def get_all_users(db: Session = Depends(get_db)):
    records = crud.get_all(db, User)
    return ApiResult(result=[UserResponse.model_validate(r) for r in records])


@router.get("/{user_id}", response_model=ApiResult)
def get_user(user_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, User, user_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="User not found")
    return ApiResult(result=UserResponse.model_validate(record))


@router.put("/{user_id}", response_model=ApiResult)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, User, user_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="User not found")
    return ApiResult(result=UserResponse.model_validate(record))


@router.delete("/{user_id}", response_model=ApiResult)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, User, user_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="User not found")
    return ApiResult(result=UserResponse.model_validate(record))
