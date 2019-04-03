exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Histories;
  CREATE TABLE Histories (
	uid 			INTEGER NOT NULL,
	aid				INTEGER,
	PRIMARY KEY (uid, aid),
	FOREIGN KEY (uid) REFERENCES UserProfiles,
	FOREIGN KEY (aid) REFERENCES Advertisements
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Histories`;
  return knex.raw(dropQuery);
};