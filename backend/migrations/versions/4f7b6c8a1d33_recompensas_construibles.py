"""recompensas construibles por el jugador (custom_rewards)

Revision ID: 4f7b6c8a1d33
Revises: 9b3d1a7c2e44
Create Date: 2026-07-23 21:40:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "4f7b6c8a1d33"
down_revision: Union[str, Sequence[str], None] = "9b3d1a7c2e44"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "modules", sa.Column("custom_reward_limit", sa.Integer(), nullable=True)
    )

    op.create_table(
        "custom_rewards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("player_id", sa.Integer(), nullable=False),
        sa.Column("module_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("icon", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"]),
        sa.ForeignKeyConstraint(["module_id"], ["modules.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column(
        "reward_selections", sa.Column("custom_reward_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        None, "reward_selections", "custom_rewards", ["custom_reward_id"], ["id"]
    )
    op.alter_column(
        "reward_selections", "reward_option_id", existing_type=sa.Integer(), nullable=True
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "reward_selections", "reward_option_id", existing_type=sa.Integer(), nullable=False
    )
    op.drop_constraint(None, "reward_selections", type_="foreignkey")
    op.drop_column("reward_selections", "custom_reward_id")
    op.drop_table("custom_rewards")
    op.drop_column("modules", "custom_reward_limit")
