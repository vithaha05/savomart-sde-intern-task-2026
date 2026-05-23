"""initial_schema

Revision ID: 817ef9e57ee7
Revises: 
Create Date: 2026-05-23 15:41:33.685494

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '817ef9e57ee7'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    discount_type = postgresql.ENUM(
        "PERCENT",
        "FLAT",
        name="discount_type",
        create_type=False,
    )
    discount_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mobile_number", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_mobile_number", "users", ["mobile_number"], unique=True)

    op.create_table(
        "offers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("discount_label", sa.String(length=100), nullable=False),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_all_stores", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("store_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("image_url", sa.String(length=2048), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_offers_is_active", "offers", ["is_active"], unique=False)

    op.create_table(
        "otps",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mobile_number", sa.String(length=20), nullable=False),
        sa.Column("otp_code", sa.String(length=128), nullable=False),
        sa.Column("is_used", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_otps_mobile_number", "otps", ["mobile_number"], unique=False)
    op.create_index(
        "ix_otps_one_active_per_mobile",
        "otps",
        ["mobile_number"],
        unique=True,
        postgresql_where=sa.text("is_used = false"),
    )

    op.create_table(
        "coupons",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("discount_type", discount_type, nullable=False),
        sa.Column("discount_value", sa.Float(), nullable=False),
        sa.Column("min_purchase", sa.Float(), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_used", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_coupons_code", "coupons", ["code"], unique=True)
    op.create_index("ix_coupons_user_id", "coupons", ["user_id"], unique=False)

    op.create_table(
        "loyalty_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("points_balance", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("tier", sa.String(length=50), server_default=sa.text("'Silver'"), nullable=False),
        sa.Column("total_earned", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("total_redeemed", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_loyalty_profiles_user_id", "loyalty_profiles", ["user_id"], unique=True)

    op.create_table(
        "support_tickets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("contact", sa.String(length=255), nullable=False),
        sa.Column("issue_category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=50), server_default=sa.text("'open'"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_support_tickets_status", "support_tickets", ["status"], unique=False)
    op.create_index("ix_support_tickets_user_id", "support_tickets", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_support_tickets_user_id", table_name="support_tickets")
    op.drop_index("ix_support_tickets_status", table_name="support_tickets")
    op.drop_table("support_tickets")

    op.drop_index("ix_loyalty_profiles_user_id", table_name="loyalty_profiles")
    op.drop_table("loyalty_profiles")

    op.drop_index("ix_coupons_user_id", table_name="coupons")
    op.drop_index("ix_coupons_code", table_name="coupons")
    op.drop_table("coupons")

    op.drop_index("ix_otps_one_active_per_mobile", table_name="otps")
    op.drop_index("ix_otps_mobile_number", table_name="otps")
    op.drop_table("otps")

    op.drop_index("ix_offers_is_active", table_name="offers")
    op.drop_table("offers")

    op.drop_index("ix_users_mobile_number", table_name="users")
    op.drop_table("users")

    sa.Enum(name="discount_type").drop(op.get_bind(), checkfirst=True)
