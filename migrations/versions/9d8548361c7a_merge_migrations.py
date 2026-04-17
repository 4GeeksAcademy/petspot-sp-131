"""merge migrations

Revision ID: 9d8548361c7a
Revises: 123456789abc, e8687cc7d703
Create Date: 2026-04-17 09:30:58.717739

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9d8548361c7a'
down_revision = ('123456789abc', 'e8687cc7d703')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
