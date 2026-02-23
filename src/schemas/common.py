from typing import Any, Optional
from pydantic import BaseModel


class ApiResult(BaseModel):
    result: Any = None
    statusCode: int = 200
    success: bool = True
    error: Optional[str] = None
