#!/usr/bin/env bash

# Local PostgreSQL reset script.
# Run from the project root with:
#   bash ./docs/assets/reset_migrations_local_postgres.bash
#
# This script expects a local PostgreSQL database named `petspot_db`
# and uses the user:
#   postgres
#
# The script will ask for your local PostgreSQL password at runtime

read -s -p "Postgres password: " PGPASSWORD
echo
export PGPASSWORD

rm -rf ./migrations &&
pipenv run init &&
dropdb -h localhost -p 5432 -U postgres petspot_db || true &&
createdb -h localhost -p 5432 -U postgres petspot_db &&
psql -h localhost -p 5432 -U postgres -d petspot_db -c "CREATE EXTENSION IF NOT EXISTS unaccent;" || true &&
pipenv run migrate &&
pipenv run upgrade
