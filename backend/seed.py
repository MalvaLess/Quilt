import os

from app.database import SessionLocal, engine, Base
from app.models.creator import Creator
from app.models.experience import Experience
from app.services.auth_service import hash_password

Base.metadata.create_all(bind=engine)


def seed():
    email = os.getenv("SEED_ADMIN_EMAIL")
    password = os.getenv("SEED_ADMIN_PASSWORD")

    if not email or not password:
        print("Tablas creadas. Seteá SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en .env para crear una cuenta inicial.")
        return

    db = SessionLocal()
    try:
        if not db.query(Creator).filter(Creator.email == email).first():
            admin = Creator(
                email=email,
                password_hash=hash_password(password),
                display_name="Admin",
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            db.add(
                Experience(
                    creator_id=admin.id,
                    title="Experiencia demo",
                    slug="demo",
                    status="published",
                )
            )
            db.commit()
        print("Seed listo ✔")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
