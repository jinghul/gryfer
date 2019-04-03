exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS PassengerRatings;
  CREATE TABLE PassengerRatings (
	forUid			INTEGER NOT NULL,
	aid				INTEGER NOT NULL,
	by				INTEGER NOT NULL,
	rating 			NUMERIC NOT NULL,
	PRIMARY KEY (forUid, aid),
	FOREIGN KEY (forUid) REFERENCES Passengers,
	FOREIGN KEY (by)  REFERENCES Drivers,
	FOREIGN KEY (aid) REFERENCES Advertisement
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE PassengerRatings`;
  return knex.raw(dropQuery);
};