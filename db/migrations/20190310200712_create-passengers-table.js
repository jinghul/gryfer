exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Passengers;
  CREATE TABLE Passengers (
	uid 			INTEGER NOT NULL REFERENCES Users(uid) ON DELETE CASCADE,
	tripsTaken		INTEGER NOT NULL,
	rating			NUMERIC,
	PRIMARY KEY (uid)	
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Passengers`;
  return knex.raw(dropQuery);
};