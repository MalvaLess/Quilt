"""reward_options.requires_datetime (checkbox para habilitar fecha/hora)

Revision ID: 2b6d8f1a7c33
Revises: 8e1a2c6f0d95
Create Date: 2026-07-24 04:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "2b6d8f1a7c33"
down_revision: Union[str, Sequence[str], None] = "8e1a2c6f0d95"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "reward_options",
        sa.Column("requires_datetime", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("reward_options", "requires_datetime")
