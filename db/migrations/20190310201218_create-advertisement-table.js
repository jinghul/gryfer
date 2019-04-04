exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Advertisements;
  CREATE TABLE Advertisements (
	aid				SERIAL,
	minBidPrice		NUMERIC,
	fromAddress		VARCHAR(60),
	toAddress 		VARCHAR(60),
	departureTime	TIMESTAMP,
	uid				INTEGER NOT NULL,
	UNIQUE (aid, uid),
	PRIMARY KEY (aid),
	FOREIGN KEY (uid) REFERENCES Drivers
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Advertisements`;
  return knex.raw(dropQuery);
};