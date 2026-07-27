from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.creator import Creator
from app.models.uploaded_image import UploadedImage
from app.rate_limit import limiter
from app.services.auth_service import get_current_creator
from app.services.uploads import (
    ALLOWED_CONTENT_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    delete_image_file,
    image_url,
    save_image_file,
)

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/images")
@limiter.limit("20/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, "Formato de imagen no soportado")

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            413, f"La imagen supera el límite de {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB"
        )

    stored_filename = save_image_file(content, file.content_type)
    image = UploadedImage(
        creator_id=current_creator.id,
        original_filename=file.filename or "image",
        stored_filename=stored_filename,
        content_type=file.content_type,
        size_bytes=len(content),
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return {"id": image.id, "url": image_url(image)}


@router.delete("/images/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    image = db.query(UploadedImage).get(image_id)
    if not image:
        raise HTTPException(404, "Imagen no encontrada")
    if image.creator_id != current_creator.id:
        raise HTTPException(403, "No tenés permiso sobre esta imagen")

    if image.stored_filename:
        delete_image_file(image.stored_filename)
        image.stored_filename = None
        image.deleted_at = datetime.now(timezone.utc)
        db.commit()

    return {"deleted": True}
