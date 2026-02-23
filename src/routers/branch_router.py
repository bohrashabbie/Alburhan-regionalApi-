from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.connections.database import get_db
from src.models.models import BranchInfo
from src.schemas.schemas import BranchInfoCreate, BranchInfoUpdate, BranchInfoResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.get("/", response_model=ApiResult)
def get_all_branches(db: Session = Depends(get_db)):
    records = crud.get_all(db, BranchInfo)
    return ApiResult(result=[BranchInfoResponse.model_validate(r) for r in records])


@router.get("/{branch_id}", response_model=ApiResult)
def get_branch(branch_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, BranchInfo, branch_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Branch not found")
    return ApiResult(result=BranchInfoResponse.model_validate(record))


@router.post("/", response_model=ApiResult)
def create_branch(data: BranchInfoCreate, db: Session = Depends(get_db)):
    record = crud.create(db, BranchInfo, data.model_dump())
    return ApiResult(result=BranchInfoResponse.model_validate(record), statusCode=201)


@router.put("/{branch_id}", response_model=ApiResult)
def update_branch(branch_id: int, data: BranchInfoUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, BranchInfo, branch_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Branch not found")
    return ApiResult(result=BranchInfoResponse.model_validate(record))


@router.delete("/{branch_id}", response_model=ApiResult)
def delete_branch(branch_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, BranchInfo, branch_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Branch not found")
    return ApiResult(result=BranchInfoResponse.model_validate(record))
