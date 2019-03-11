exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Account;
  CREATE TABLE Account (
	uid				INTEGER NOT NULL,
	password		VARCHAR(64),
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES Users
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Account`;
  return knex.raw(dropQuery);
};