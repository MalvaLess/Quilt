import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.database import SessionLocal
from app.rate_limit import limiter
from app.routes import (
    auth_routes,
    experience_routes,
    module_routes,
    play_routes,
    session_routes,
    upload_routes,
)
from app.services.account_service import purge_expired_accounts
from app.services.uploads import UPLOAD_DIR, ensure_upload_dir

if not os.getenv("SECRET_KEY"):
    raise RuntimeError("SECRET_KEY no está configurada (revisá backend/.env)")

logger = logging.getLogger("quilt.account_purge")
PURGE_INTERVAL_SECONDS = 6 * 60 * 60  # cada 6 horas alcanza sobrado para un período de gracia de 30 días


async def _account_purge_loop():
    while True:
        try:
            db = SessionLocal()
            try:
                purged = purge_expired_accounts(db)
                if purged:
                    logger.info("Purgadas %d cuenta(s) tras vencer el período de gracia", purged)
            finally:
                db.close()
        except Exception:
            logger.exception("Error corriendo la purga de cuentas eliminadas")
        await asyncio.sleep(PURGE_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_account_purge_loop())
    try:
        yield
    finally:
        task.cancel()


app = FastAPI(title="Quilt API", lifespan=lifespan)

# Rate limiting global para mitigar fuerza bruta / scraping / abuso de la API.
# Límites más estrictos por endpoint se aplican con @limiter.limit(...) en las rutas.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS_ORIGINS en .env como lista separada por comas (ej: http://localhost:5173,http://192.168.0.7:5173).
# Sin configurar, cae a "*" para no romper el entorno actual — configurarlo en producción.
_cors_origins = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _cors_origins == "*" else [o.strip() for o in _cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(experience_routes.router)
app.include_router(module_routes.router)
app.include_router(play_routes.router)
app.include_router(session_routes.router)
app.include_router(upload_routes.router)

ensure_upload_dir()
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
