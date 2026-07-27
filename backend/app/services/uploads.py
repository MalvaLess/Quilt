import os
import uuid

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
MAX_UPLOAD_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5")) * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def ensure_upload_dir() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_image_file(content: bytes, content_type: str) -> str:
    ensure_upload_dir()
    # Extension is derived from the validated content-type, never from the
    # client-supplied filename — an attacker-chosen extension (e.g. .html/.svg)
    # served back from /uploads would execute as that type in the browser.
    ext = CONTENT_TYPE_EXTENSIONS.get(content_type, ".jpg")
    stored_filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(UPLOAD_DIR, stored_filename), "wb") as f:
        f.write(content)
    return stored_filename


def delete_image_file(stored_filename: str) -> None:
    path = os.path.join(UPLOAD_DIR, stored_filename)
    if os.path.exists(path):
        os.remove(path)


def image_url(image) -> str | None:
    if not image or not image.stored_filename:
        return None
    return f"/uploads/{image.stored_filename}"
