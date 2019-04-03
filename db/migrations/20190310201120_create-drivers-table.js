exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Drivers;
  CREATE TABLE Drivers (
	uid 			INTEGER NOT NULL REFERENCES Users(uid),
	tripsDriven		INTEGER NOT NULL,
	rating			NUMERIC,
	cid				INTEGER,
	PRIMARY KEY (uid),
	FOREIGN KEY (cid) REFERENCES Cars
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Drivers`;
  return knex.raw(dropQuery);
};