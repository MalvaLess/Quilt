from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth_routes,
    experience_routes,
    module_routes,
    play_routes,
    session_routes,
)

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


@app.get("/api/health")
def health():
    return {"status": "ok"}
