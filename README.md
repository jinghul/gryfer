# gryfer
A carpool app where passengers can bid on rides.


## Backend

### Making sure database is properly set up
1. `brew install postgresql` if necessary

2. `psql postgres`

3. `CREATE ROLE me WITH LOGIN PASSWORD 'password';`

4. `ALTER ROLE me CREATEDB;`

5. Exit with `\q`

6. Connect `psql -d postgres -U me`

7. Create the database using `CREATE DATABASE api;`.

### Setting up backend and initializing tables.
1. Run `npm install` to install dependencies.

2. Run `npx knex migrate:latest` to initialize database.

3. Run `npx knex migrate:rollback` to unintialize database.

4. Run `nodemon index.js` to start the backend server.