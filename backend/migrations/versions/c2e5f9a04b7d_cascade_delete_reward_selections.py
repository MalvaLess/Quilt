"""ON DELETE CASCADE en reward_selections -> reward_options / custom_rewards

Revision ID: c2e5f9a04b7d
Revises: 4f7b6c8a1d33
Create Date: 2026-07-24 00:40:00.000000

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c2e5f9a04b7d"
down_revision: Union[str, Sequence[str], None] = "4f7b6c8a1d33"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        op.f("reward_selections_reward_option_id_fkey"),
        "reward_selections",
        type_="foreignkey",
    )
    op.create_foreign_key(
        op.f("reward_selections_reward_option_id_fkey"),
        "reward_selections",
        "reward_options",
        ["reward_option_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint(
        op.f("reward_selections_custom_reward_id_fkey"),
        "reward_selections",
        type_="foreignkey",
    )
    op.create_foreign_key(
        op.f("reward_selections_custom_reward_id_fkey"),
        "reward_selections",
        "custom_rewards",
        ["custom_reward_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        op.f("reward_selections_custom_reward_id_fkey"),
        "reward_selections",
        type_="foreignkey",
    )
    op.create_foreign_key(
        op.f("reward_selections_custom_reward_id_fkey"),
        "reward_selections",
        "custom_rewards",
        ["custom_reward_id"],
        ["id"],
    )

    op.drop_constraint(
        op.f("reward_selections_reward_option_id_fkey"),
        "reward_selections",
        type_="foreignkey",
    )
    op.create_foreign_key(
        op.f("reward_selections_reward_option_id_fkey"),
        "reward_selections",
        "reward_options",
        ["reward_option_id"],
        ["id"],
    )
