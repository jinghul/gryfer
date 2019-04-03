exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Accounts;
  CREATE TABLE Accounts (
	uid				INTEGER NOT NULL,
	password		VARCHAR(100),
	userToken		VARCHAR(64),
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES Users
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Accounts`;
  return knex.raw(dropQuery);
};