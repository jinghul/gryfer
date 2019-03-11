exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS CarProfile;
  CREATE TABLE CarProfile (
	cid				INTEGER,
	make			VARCHAR(60),
	model			VARCHAR(60),
	modelYear		VARCHAR(60),
	milesDriven		VARCHAR(60),
	PRIMARY KEY (cid),
	FOREIGN KEY (cid) REFERENCES Car
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE CarProfile`;
  return knex.raw(dropQuery);
};