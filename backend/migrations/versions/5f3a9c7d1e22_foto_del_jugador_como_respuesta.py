"""response_image_id en answers (minijuego: foto subida por el jugador)

Revision ID: 5f3a9c7d1e22
Revises: 2b6d8f1a7c33
Create Date: 2026-07-26 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "5f3a9c7d1e22"
down_revision: Union[str, Sequence[str], None] = "2b6d8f1a7c33"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("answers", sa.Column("response_image_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        None, "answers", "uploaded_images", ["response_image_id"], ["id"]
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, "answers", type_="foreignkey")
    op.drop_column("answers", "response_image_id")
