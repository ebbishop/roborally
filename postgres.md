##Using a postgres database
su posgres
psql
postgres -D /usr/local/pgsql/data

`CREATE DATABASE` /name/

`\q` closes connection to psql

psql -U postgres -d robodb -a -f robo.sql
