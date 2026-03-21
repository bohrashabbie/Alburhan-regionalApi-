from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from src.connections.database import get_db
from src.models.models import User
from src.schemas.schemas import UserRegister, UserLogin, UserResponse
from src.schemas.common import ApiResult
from src.auth.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================
# REGISTER
# =========================
@router.post("/register", response_model=ApiResult)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        fullname=data.fullname,
        role=data.role,
    )

    db.add(user)

    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        return ApiResult(
            result=None,
            statusCode=409,
            success=False,
            error="Username or email already exists",
        )
    except Exception as e:
        await db.rollback()
        return ApiResult(
            result=None,
            statusCode=500,
            success=False,
            error=str(e),
        )

    return ApiResult(
        result=UserResponse.model_validate(user),
        statusCode=201,
        success=True,
    )


# =========================
# LOGIN
# =========================
@router.post("/login", response_model=ApiResult)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):

    # 🔍 Fetch user
    result = await db.execute(
        select(User).where(User.username == data.username)
    )
    user = result.scalar_one_or_none()

    # Invalid credentials
    if not user or not verify_password(data.password, user.password_hash):
        return ApiResult(
            result=None,
            statusCode=401,
            success=False,
            error="Invalid username or password",
        )

    # Inactive user
    if not user.isactive:
        return ApiResult(
            result=None,
            statusCode=403,
            success=False,
            error="Account is deactivated",
        )

    # Create token
    token = create_access_token(
        {"user_id": user.id, "role": user.role}
    )

    return ApiResult(
        result={
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).model_dump(),
        },
        statusCode=200,
        success=True,
    )


# =========================
# CURRENT USER
# =========================
@router.get("/me", response_model=ApiResult)
async def get_me(current_user: User = Depends(get_current_user)):
    return ApiResult(
        result=UserResponse.model_validate(current_user),
        statusCode=200,
        success=True,
    )