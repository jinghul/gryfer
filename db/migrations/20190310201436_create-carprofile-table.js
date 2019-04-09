exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS CarProfiles;
  CREATE TABLE CarProfiles (
	cid				INTEGER,
	license VARCHAR(10),
	make			VARCHAR(60),
	model			VARCHAR(60),
	modelYear		VARCHAR(60),
	milesDriven		NUMERIC,
	maxPassengers	INTEGER NOT NULL,
	PRIMARY KEY (cid),
	FOREIGN KEY (cid) REFERENCES Cars
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE CarProfiles`;
  return knex.raw(dropQuery);
};