exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE Car (
	cid 			INTEGER,
	uid				INTEGER NOT NULL,
	PRIMARY KEY (cid),
	FOREIGN KEY (uid) REFERENCES Drivers
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Car`;
  return knex.raw(dropQuery);
};