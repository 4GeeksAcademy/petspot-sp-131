"""remove locations table

Revision ID: a1d2f3c4b5e6
Revises: 51f6a9580c9a
Create Date: 2026-04-19 21:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1d2f3c4b5e6'
down_revision = '51f6a9580c9a'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('locations')


def downgrade():
    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('city', sa.String(length=120), nullable=False),
        sa.Column('place_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['place_id'], ['places.id']),
        sa.PrimaryKeyConstraint('id')
    )
