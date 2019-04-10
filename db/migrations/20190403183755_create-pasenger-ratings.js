exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS PassengerRatings;
  CREATE TABLE PassengerRatings (
	forUid			INTEGER NOT NULL,
	aid				INTEGER NOT NULL,
	byUid			INTEGER NOT NULL,
	rating 			NUMERIC NOT NULL,
	PRIMARY KEY (forUid, aid),
	FOREIGN KEY (forUid) REFERENCES Passengers (uid),
	FOREIGN KEY (byUid)  REFERENCES Drivers (uid),
	FOREIGN KEY (aid) REFERENCES Accepted (aid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE PassengerRatings`;
  return knex.raw(dropQuery);
};