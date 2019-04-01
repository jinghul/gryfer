exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS History;
  CREATE TABLE History (
	uid 			INTEGER NOT NULL,
	aid				INTEGER,
	PRIMARY KEY (uid, aid),
	FOREIGN KEY (uid) REFERENCES UserProfile,
	FOREIGN KEY (aid) REFERENCES Advertisement
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE History`;
  return knex.raw(dropQuery);
};