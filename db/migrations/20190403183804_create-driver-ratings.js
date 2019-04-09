exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS DriverRatings;
  CREATE TABLE DriverRatings (
	forUid 			INTEGER NOT NULL,
	aid				INTEGER NOT NULL,
	byUid				INTEGER NOT NULL,
	rating 			NUMERIC NOT NULL,
	PRIMARY KEY (forUid, aid),
	FOREIGN KEY (forUid) REFERENCES Drivers,
	FOREIGN KEY (byUid)  REFERENCES Passengers,
    FOREIGN KEY (aid) REFERENCES Accepted (aid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE DriverRatings`;
  return knex.raw(dropQuery);
};