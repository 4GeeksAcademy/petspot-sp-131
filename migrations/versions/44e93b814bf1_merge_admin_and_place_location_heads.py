"""merge admin and place/location heads

Revision ID: 44e93b814bf1
Revises: be4f40c598c2, 123456789abc
Create Date: 2026-04-15 15:09:49.931983

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '44e93b814bf1'
down_revision = ('be4f40c598c2', '123456789abc')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
