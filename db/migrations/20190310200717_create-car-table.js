exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Cars;
  CREATE TABLE Cars (
	cid 			SERIAL,
	PRIMARY KEY (cid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Cars`;
  return knex.raw(dropQuery);
};