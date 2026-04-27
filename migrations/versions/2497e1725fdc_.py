"""normalize pet fields to enums

Revision ID: 2497e1725fdc
Revises: 441726df2a1a
Create Date: 2026-04-27 21:08:14.825724

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '2497e1725fdc'
down_revision = '441726df2a1a'
branch_labels = None
depends_on = None


def upgrade():
    pet_animal_type = postgresql.ENUM('dog', 'cat', 'other', name='pet_animal_type')
    pet_size = postgresql.ENUM('small', 'medium', 'large', name='pet_size')

    op.add_column('pets', sa.Column('other_type', sa.String(length=120), nullable=True))

    op.execute("""
        UPDATE pets
        SET
            other_type = CASE
                WHEN lower(trim(animal_type)) IN ('perro', 'dog', 'gato', 'cat', 'otros', 'other') THEN NULL
                ELSE trim(animal_type)
            END,
            animal_type = CASE
                WHEN lower(trim(animal_type)) IN ('perro', 'dog') THEN 'dog'
                WHEN lower(trim(animal_type)) IN ('gato', 'cat') THEN 'cat'
                ELSE 'other'
            END,
            size = CASE
                WHEN lower(trim(size)) IN ('pequeño', 'pequeno', 'small') THEN 'small'
                WHEN lower(trim(size)) IN ('grande', 'large') THEN 'large'
                ELSE 'medium'
            END
    """)

    pet_animal_type.create(op.get_bind(), checkfirst=True)
    pet_size.create(op.get_bind(), checkfirst=True)

    op.execute("""
        ALTER TABLE pets
        ALTER COLUMN animal_type TYPE pet_animal_type
        USING animal_type::pet_animal_type
    """)
    op.execute("""
        ALTER TABLE pets
        ALTER COLUMN size TYPE pet_size
        USING size::pet_size
    """)


def downgrade():
    pet_animal_type = postgresql.ENUM('dog', 'cat', 'other', name='pet_animal_type')
    pet_size = postgresql.ENUM('small', 'medium', 'large', name='pet_size')

    op.execute("""
        ALTER TABLE pets
        ALTER COLUMN animal_type TYPE VARCHAR(120)
        USING animal_type::text
    """)
    op.execute("""
        ALTER TABLE pets
        ALTER COLUMN size TYPE VARCHAR(120)
        USING size::text
    """)
    op.execute("""
        UPDATE pets
        SET animal_type = CASE
            WHEN animal_type = 'other' AND other_type IS NOT NULL AND trim(other_type) <> '' THEN other_type
            ELSE animal_type
        END
    """)

    op.drop_column('pets', 'other_type')
    pet_size.drop(op.get_bind(), checkfirst=True)
    pet_animal_type.drop(op.get_bind(), checkfirst=True)
