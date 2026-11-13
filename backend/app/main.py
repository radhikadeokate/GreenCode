
from fastapi import FastAPI, HTTPException

from backend.app.core.config import settings
from backend.app.db.database import check_database_connection
from backend.app.api.auth import router as auth_router
from backend.app.api.projects import router as projects_router
from backend.app.api.analyses import router as analyses_router

app = FastAPI(
    title=settings.app_name,
    description="Software Sustainability Assessment and Optimization Platform",
    version="1.0.0",
)

app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(projects_router, prefix=settings.api_v1_prefix)
app.include_router(analyses_router, prefix=settings.api_v1_prefix)
@app.get(f"{settings.api_v1_prefix}/health")
def health_check():
    return {"status": "ok"}


@app.get(f"{settings.api_v1_prefix}/health/database")
def database_health_check():
    try:
        check_database_connection()
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(
            status_code=503,
            detail={"status": "error", "database": "unavailable"},
        )
