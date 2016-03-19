##Using a postgres database in the command line

Switch to user 'postgres': (probably created for you by default when you install postgres)
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

Insert seed data from a file:
`cd` into the directory where the `.sql` file is stored. Then run:
`psql -U <username - probably postgres> -d <dbname> -a -f <filename>`

example:
`psql -U postgres -d robodb -a -f robo.sql`
