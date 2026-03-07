from src.routers import (
    banner_router,
    branch_router,
    country_router,
    project_category_router,
    project_image_router,
    project_router,
    auth_router,
    user_router,
)

routers = [
    banner_router.router,
    branch_router.router,
    country_router.router,
    project_category_router.router,
    project_image_router.router,
    project_router.router,
    auth_router.router,
    user_router.router,
]
