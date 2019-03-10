exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE Drivers (
	uid 			INTEGER NOT NULL REFERENCES Users(uid),
	tripsDriven		INTEGER NOT NULL,
	Rating			FLOAT,
	cid				INTEGER,
	PRIMARY KEY (uid),
	FOREIGN KEY (cid) REFERENCES Car
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Drivers`;
  return knex.raw(dropQuery);
};