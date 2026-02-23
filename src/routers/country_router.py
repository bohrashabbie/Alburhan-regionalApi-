from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.connections.database import get_db
from src.models.models import Country
from src.schemas.schemas import CountryCreate, CountryUpdate, CountryResponse
from src.schemas.common import ApiResult
from src.crud import crud

router = APIRouter(prefix="/countries", tags=["Countries"])


@router.get("/", response_model=ApiResult)
def get_all_countries(db: Session = Depends(get_db)):
    records = crud.get_all(db, Country)
    return ApiResult(result=[CountryResponse.model_validate(r) for r in records])


@router.get("/{country_id}", response_model=ApiResult)
def get_country(country_id: int, db: Session = Depends(get_db)):
    record = crud.get_by_id(db, Country, country_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
    return ApiResult(result=CountryResponse.model_validate(record))


@router.post("/", response_model=ApiResult)
def create_country(data: CountryCreate, db: Session = Depends(get_db)):
    record = crud.create(db, Country, data.model_dump())
    return ApiResult(result=CountryResponse.model_validate(record), statusCode=201)


@router.put("/{country_id}", response_model=ApiResult)
def update_country(country_id: int, data: CountryUpdate, db: Session = Depends(get_db)):
    record = crud.update(db, Country, country_id, data.model_dump(exclude_unset=True))
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
    return ApiResult(result=CountryResponse.model_validate(record))


@router.delete("/{country_id}", response_model=ApiResult)
def delete_country(country_id: int, db: Session = Depends(get_db)):
    record = crud.delete(db, Country, country_id)
    if not record:
        return ApiResult(result=None, statusCode=404, success=False, error="Country not found")
    return ApiResult(result=CountryResponse.model_validate(record))
