exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE History (
	username 		VARCHAR(20),
	aid				INTEGER
	PRIMARY KEY (username, aid)
	FOREIGN KEY (username) REFERENCES UserProfile
	FOREIGN KEY (aid) REFERENCES Advertisement
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE History`;
  return knex.raw(dropQuery);
};