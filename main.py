from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.routers.registry import routers

app = FastAPI(title="Alburhan Regional API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in routers:
    app.include_router(router, prefix="/api")

# Serve uploaded media files (e.g. banner images)
app.mount("/media", StaticFiles(directory="media"), name="media")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # change to "src.main:app" if needed
        host="127.0.0.1",
        port=8000,
        reload=True
    )