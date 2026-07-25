from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import (
    auth_routes,
    experience_routes,
    module_routes,
    play_routes,
    session_routes,
    upload_routes,
)
from app.services.uploads import UPLOAD_DIR, ensure_upload_dir

app = FastAPI(title="Quilt API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
