from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.connections.database import get_db
from src.models.models import User
from src.schemas.schemas import UserRegister, UserLogin, UserResponse
from src.schemas.common import ApiResult
from src.auth.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=ApiResult)
def register(data: UserRegister, db: Session = Depends(get_db)):
    # Check if username already exists
    if db.query(User).filter(User.username == data.username).first():
        return ApiResult(result=None, statusCode=409, success=False, error="Username already exists")

    # Check if email already exists
    if db.query(User).filter(User.email == data.email).first():
        return ApiResult(result=None, statusCode=409, success=False, error="Email already exists")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        fullname=data.fullname,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return ApiResult(result=UserResponse.model_validate(user), statusCode=201)


@router.post("/login", response_model=ApiResult)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        return ApiResult(result=None, statusCode=401, success=False, error="Invalid username or password")

    if not user.isactive:
        return ApiResult(result=None, statusCode=403, success=False, error="Account is deactivated")

    token = create_access_token({"user_id": user.id, "role": user.role})
    return ApiResult(result={"access_token": token, "token_type": "bearer", "user": UserResponse.model_validate(user).model_dump()})


@router.get("/me", response_model=ApiResult)
def get_me(current_user: User = Depends(get_current_user)):
    return ApiResult(result=UserResponse.model_validate(current_user))
