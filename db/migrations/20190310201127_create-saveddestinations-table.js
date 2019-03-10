exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE SavedDestinations (
	nickname		VARCHAR(20),
	address			VARCHAR(60),
	PRIMARY KEY (nickname)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE SavedDestinations`;
  return knex.raw(dropQuery);
};