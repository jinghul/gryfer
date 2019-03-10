exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Account;
  CREATE TABLE Account (
	uid				INTEGER NOT NULL,
	password		VARCHAR(64),
	nickname		VARCHAR(20),
	PRIMARY KEY (uid, password),
	FOREIGN KEY (uid) REFERENCES Users,
	FOREIGN KEY (nickname) REFERENCES SavedDestinations
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Account`;
  return knex.raw(dropQuery);
};