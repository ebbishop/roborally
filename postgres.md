##Using a postgres database in the command line

Switch to user 'postgres': (probably created for you by default)
`su posgres`

Start posgres process: (on emma's ubuntu machine - your path may vary):
`postgres -D /usr/local/pgsql/data`

Open postgres:
`psql`

Create a database:
`CREATE DATABASE <name>`

List dbs:
`\l`

Use a database:
`\c <name>`

List tables:
`\dt`

Select all rows from a table:
`SELECT * FROM <table>`

Exit postgres:
`\q`

to insert data from a file:
`psql -U postgres -d robodb -a -f robo.sql`
