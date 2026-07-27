"""creators.deleted_at (soft-delete con periodo de gracia de 30 días)

Revision ID: 7e2c5a9d1f83
Revises: 9a4e1f8b2c67
Create Date: 2026-07-27 18:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "7e2c5a9d1f83"
down_revision: Union[str, Sequence[str], None] = "9a4e1f8b2c67"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "creators",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("creators", "deleted_at")
