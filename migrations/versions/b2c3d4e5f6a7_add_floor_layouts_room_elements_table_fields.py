"""add floor_layouts, room_elements and new table fields

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-06 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'floor_layouts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('place_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'room_elements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('layout_id', sa.Integer(), nullable=False),
        sa.Column('element_type', sa.String(length=30), nullable=False, server_default='wall'),
        sa.Column('pos_x', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('pos_y', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('width', sa.Integer(), nullable=False, server_default='120'),
        sa.Column('height', sa.Integer(), nullable=False, server_default='20'),
        sa.Column('rotation', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('color', sa.String(length=30), nullable=True),
        sa.Column('label', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['layout_id'], ['floor_layouts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.add_column('tables', sa.Column('layout_id', sa.Integer(), nullable=True))
    op.add_column('tables', sa.Column('width', sa.Integer(), nullable=True, server_default='80'))
    op.add_column('tables', sa.Column('height', sa.Integer(), nullable=True, server_default='80'))
    op.add_column('tables', sa.Column('rotation', sa.Integer(), nullable=True, server_default='0'))

    op.create_foreign_key(
        'fk_tables_layout_id',
        'tables', 'floor_layouts',
        ['layout_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade():
    op.drop_constraint('fk_tables_layout_id', 'tables', type_='foreignkey')
    op.drop_column('tables', 'rotation')
    op.drop_column('tables', 'height')
    op.drop_column('tables', 'width')
    op.drop_column('tables', 'layout_id')
    op.drop_table('room_elements')
    op.drop_table('floor_layouts')
