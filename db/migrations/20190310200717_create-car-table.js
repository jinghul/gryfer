exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Car;
  CREATE TABLE Car (
	cid 			SERIAL,
	PRIMARY KEY (cid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Car`;
  return knex.raw(dropQuery);
};