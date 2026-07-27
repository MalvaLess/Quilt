"""modules.custom_reward_unlock_points (umbral propio para la recompensa construible)

Revision ID: 3c7d9e2f4a11
Revises: 5f3a9c7d1e22
Create Date: 2026-07-27 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "3c7d9e2f4a11"
down_revision: Union[str, Sequence[str], None] = "5f3a9c7d1e22"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "modules",
        sa.Column("custom_reward_unlock_points", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("modules", "custom_reward_unlock_points")
