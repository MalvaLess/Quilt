"""experiences.spend_points_on_claim + reward_options.one_per_player

Revision ID: 9a4e1f8b2c67
Revises: 3c7d9e2f4a11
Create Date: 2026-07-27 15:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "9a4e1f8b2c67"
down_revision: Union[str, Sequence[str], None] = "3c7d9e2f4a11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "experiences",
        sa.Column("spend_points_on_claim", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column(
        "reward_options",
        sa.Column("one_per_player", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("reward_options", "one_per_player")
    op.drop_column("experiences", "spend_points_on_claim")
