"""reward_threshold configurable por experiencia y por reward

Revision ID: 7a1c9e4d5f21
Revises: 2fdf76b2680a
Create Date: 2026-07-23 20:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "7a1c9e4d5f21"
down_revision: Union[str, Sequence[str], None] = "2fdf76b2680a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "experiences",
        sa.Column(
            "reward_threshold", sa.Integer(), nullable=False, server_default="60"
        ),
    )
    op.add_column(
        "reward_options", sa.Column("unlock_points", sa.Integer(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("reward_options", "unlock_points")
    op.drop_column("experiences", "reward_threshold")
