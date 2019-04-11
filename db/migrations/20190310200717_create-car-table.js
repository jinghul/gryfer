exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Cars;
  CREATE TABLE Cars (
	cid 			SERIAL,
	make			VARCHAR(60) NOT NULL,
	model			VARCHAR(60) NOT NULL,
	modelYear		INTEGER NOT NULL,
	maxPassengers	INTEGER NOT NULL,
	UNIQUE (make, model, modelYear),
	PRIMARY KEY (cid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Cars`;
  return knex.raw(dropQuery);
};