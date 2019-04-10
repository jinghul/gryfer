exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Accounts;
  CREATE TABLE Accounts (
	uid				      INTEGER NOT NULL,
  passwordHash		VARCHAR(100) NOT NULL,
  mode            BOOLEAN NOT NULL,
  userToken		    VARCHAR(64),
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES Users
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Accounts`;
  return knex.raw(dropQuery);
};