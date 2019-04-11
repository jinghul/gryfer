exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Advertisements;
  CREATE TABLE Advertisements (
	aid				SERIAL,
	minBidPrice		NUMERIC NOT NULL,
	fromAddress		VARCHAR(60) NOT NULL,
	fromLat			NUMERIC NOT NULL,
	fromLng			NUMERIC NOT NULL,
	toAddress 		VARCHAR(60) NOT NULL,
	toLat			NUMERIC NOT NULL,
	toLng			NUMERIC NOT NULL,
	departureTime	TIMESTAMP NOT NULL,
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