exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Bid;
  CREATE TABLE Bid (
	uid 			INTEGER,
	aid				INTEGER,
	bidPrice		NUMERIC NOT NULL,
	PRIMARY KEY (uid, aid, bidPrice),
	FOREIGN KEY (uid) REFERENCES Passengers,
	FOREIGN KEY (aid) REFERENCES Advertisement
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Bid`;
  return knex.raw(dropQuery);
};