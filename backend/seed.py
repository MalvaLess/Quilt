from app.database import SessionLocal, engine, Base
from app.models.creator import Creator
from app.models.experience import Experience
from app.services.auth_service import hash_password

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        if not db.query(Creator).filter(Creator.email == "demo@quilt.dev").first():
            demo = Creator(
                email="demo@quilt.dev",
                password_hash=hash_password("demo1234"),
                display_name="Demo",
            )
            db.add(demo)
            db.commit()
            db.refresh(demo)
            db.add(
                Experience(
                    creator_id=demo.id,
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
