from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.creator import Creator
from app.models.uploaded_image import UploadedImage
from app.services.uploads import delete_image_file

DELETION_GRACE_DAYS = 30


def purge_creator(db: Session, creator: Creator) -> None:
    """Borra definitivamente a un creador y todo lo suyo, una vez pasado el
    período de gracia. UploadedImage no tiene ondelete=CASCADE (las filas
    Question/Answer que la referencian sí se borran en cascada al borrar al
    creador), así que se borran DESPUÉS de que el creador y su cascada ya
    desaparecieron — de lo contrario la FK bloquea el delete.
    """
    image_rows = db.query(UploadedImage).filter(UploadedImage.creator_id == creator.id).all()
    image_ids = [img.id for img in image_rows]
    stored_filenames = [img.stored_filename for img in image_rows if img.stored_filename]

    db.delete(creator)
    db.flush()

    if image_ids:
        db.query(UploadedImage).filter(UploadedImage.id.in_(image_ids)).delete(synchronize_session=False)

    db.commit()

    for filename in stored_filenames:
        delete_image_file(filename)


def purge_expired_accounts(db: Session) -> int:
    """Purga definitivamente las cuentas cuyo período de gracia post-borrado ya venció."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=DELETION_GRACE_DAYS)
    expired = (
        db.query(Creator)
        .filter(Creator.deleted_at.isnot(None), Creator.deleted_at <= cutoff)
        .all()
    )
    for creator in expired:
        purge_creator(db, creator)
    return len(expired)
