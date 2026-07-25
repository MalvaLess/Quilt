"""agregar answers.skipped (botón de saltear pregunta)

Revision ID: 8e1a2c6f0d95
Revises: c2e5f9a04b7d
Create Date: 2026-07-24 01:15:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "8e1a2c6f0d95"
down_revision: Union[str, Sequence[str], None] = "c2e5f9a04b7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "answers",
        sa.Column("skipped", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("answers", "skipped")
