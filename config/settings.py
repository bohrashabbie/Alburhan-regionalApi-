DB_SERVER = "localhost"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "Sha2558161"

# JWT Settings
JWT_SECRET_KEY = "change-this-to-a-strong-random-secret-key"
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60

# cache configuration

CACHE_PREFIX = "alburhan"

CACHE_KEYS = {
    "BRANCHES_ALL": "branches:all",
    "BRANCH_BY_ID": "branches:{branch_id}",
    "BANNERS_ALL": "banners:all",
    "BANNER_BY_ID": "banners:{banner_id}",
    "COUNTRIES_ALL": "countries:all",
    "COUNTRY_BY_ID": "countries:{country_id}",
    "PROJECTS_ALL": "projects:all",
    "PROJECT_BY_ID": "projects:{project_id}",
    "PROJECT_CATEGORIES_ALL": "project_categories:all",
    "PROJECT_CATEGORY_BY_ID": "project_categories:{category_id}",
    "PROJECT_IMAGES_ALL": "project_images:all",
    "PROJECT_IMAGE_BY_ID": "project_images:{image_id}",
    "USERS_ALL": "users:all",
    "USER_BY_ID": "users:{user_id}",
}