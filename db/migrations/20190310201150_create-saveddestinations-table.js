exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS SavedDestinations;
  CREATE TABLE SavedDestinations (
  	nickname		VARCHAR(20) NOT NULL,
  	address			VARCHAR(60) NOT NULL,
  	uid				  INTEGER NOT NULL,
    lat				  NUMERIC NOT NULL,
    lng				  NUMERIC NOT NULL,
  	PRIMARY KEY (nickname, uid),
  	FOREIGN KEY (uid) REFERENCES Accounts
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE SavedDestinations`;
  return knex.raw(dropQuery);
};