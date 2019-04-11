exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS SavedDestinations;
  CREATE TABLE SavedDestinations (
	nickname		VARCHAR(20),
	address			VARCHAR(60),
	uid				INTEGER NOT NULL,
    lat				NUMERIC,
    lng				NUMERIC,
	PRIMARY KEY (nickname, uid),
	FOREIGN KEY (uid) REFERENCES Accounts
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE SavedDestinations`;
  return knex.raw(dropQuery);
};