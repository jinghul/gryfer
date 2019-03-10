exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE Bid (
	uid 			INTEGER,
	aid				INTEGER,
	bidPrice		FLOAT NOT NULL,
	PRIMARY KEY (uid, aid)
	FOREIGN KEY (uid) REFERENCES Passengers,
	FOREIGN KEY (aid) REFERENCES Advertisement
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Bid`;
  return knex.raw(dropQuery);
};