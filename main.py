from fastapi import FastAPI
from src.routers.registry import routers

app = FastAPI(title="Alburhan Regional API", version="1.0.0")

for router in routers:
    app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Alburhan Regional API is running"}
