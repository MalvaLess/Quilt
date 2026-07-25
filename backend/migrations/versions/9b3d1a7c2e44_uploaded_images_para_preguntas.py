"""uploaded_images + image_id en questions (minijuego de imágenes)

Revision ID: 9b3d1a7c2e44
Revises: 7a1c9e4d5f21
Create Date: 2026-07-23 21:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "9b3d1a7c2e44"
down_revision: Union[str, Sequence[str], None] = "7a1c9e4d5f21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "uploaded_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("creator_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(), nullable=False),
        sa.Column("stored_filename", sa.String(), nullable=True),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["creator_id"], ["creators.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.add_column("questions", sa.Column("image_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        None, "questions", "uploaded_images", ["image_id"], ["id"]
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, "questions", type_="foreignkey")
    op.drop_column("questions", "image_id")
    op.drop_table("uploaded_images")
