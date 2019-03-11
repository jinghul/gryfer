# gryfer
A carpool app where passengers can bid on rides.


## Backend

### Making sure database is properly set up
1. `brew install postgresql` if necessary

2. `psql postgres`

3. `CREATE ROLE [username] WITH LOGIN PASSWORD ['password'];`

4. `ALTER ROLE [username] CREATEDB;`

5. Exit with `\q`

6. Connect `psql -d postgres -U [username]`

7. Create the database using `CREATE DATABASE [name of db];`.

### Granting permission to edit database.
1. Connect to database as admin: `psql -d [name of db]`

2. Grant privileges: `grant all privileges on all tables in schema public to [username];`

### Create config file.
1. Create `config.json` in the root directory

2. Write a json file as follows:
```
{
	"username" : "[username]",
    "password" : "[password]",
    "api": "[name of db]"
}
```

3. Inside knexfile.js, update the connections to be:
```
postgresql://[user]:[password]@[netloc][:port][/dbname]
```

### Setting up backend and initializing tables.
1. Run `npm install` to install dependencies.

2. Run `npx knex migrate:latest` to initialize database.

3. Run `npx knex migrate:rollback` to unintialize database.

4. Run `nodemon index.js` to start the backend server.