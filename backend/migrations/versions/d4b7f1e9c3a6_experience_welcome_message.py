"""experiences.welcome_message (pregunta editable de bienvenida)

Revision ID: d4b7f1e9c3a6
Revises: 7e2c5a9d1f83
Create Date: 2026-08-01 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d4b7f1e9c3a6"
down_revision: Union[str, Sequence[str], None] = "7e2c5a9d1f83"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "experiences",
        sa.Column("welcome_message", sa.String(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("experiences", "welcome_message")
