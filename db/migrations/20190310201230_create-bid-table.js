exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Bids;
  CREATE TABLE Bids (
	uid 			INTEGER,
	aid				INTEGER,
	bidPrice		NUMERIC NOT NULL,
	PRIMARY KEY (uid, aid, bidPrice),
	FOREIGN KEY (uid) REFERENCES Passengers,
	FOREIGN KEY (aid) REFERENCES Advertisements
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Bids`;
  return knex.raw(dropQuery);
};