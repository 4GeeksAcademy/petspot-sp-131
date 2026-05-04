"""add paypal fields to reservations

Revision ID: a1b2c3d4e5f6
Revises: dc0cdb223824
Create Date: 2026-05-04 17:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'dc0cdb223824'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('reservations', sa.Column('paypal_order_id', sa.String(length=255), nullable=True))
    op.add_column('reservations', sa.Column('paypal_capture_id', sa.String(length=255), nullable=True))
    op.add_column('reservations', sa.Column('payment_status', sa.String(length=50), nullable=True))
    op.add_column('reservations', sa.Column('refunded_at', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('reservations', 'refunded_at')
    op.drop_column('reservations', 'payment_status')
    op.drop_column('reservations', 'paypal_capture_id')
    op.drop_column('reservations', 'paypal_order_id')
