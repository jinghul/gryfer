exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS CarProfiles;
  CREATE TABLE CarProfiles (
  uid				INTEGER,
	cid				INTEGER NOT NULL,
	licensePlate    VARCHAR(10),
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES Drivers,
	FOREIGN KEY (cid) REFERENCES Cars
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE CarProfiles`;
  return knex.raw(dropQuery);
};