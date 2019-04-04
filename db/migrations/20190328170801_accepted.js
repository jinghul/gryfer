exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Accepted;
  CREATE TABLE Accepted (
	aid				SERIAL,
	puid			INTEGER,
	duid			INTEGER,
	price			NUMERIC NOT NULL,
	PRIMARY KEY (aid, puid, duid),
	FOREIGN KEY (aid, duid) REFERENCES Advertisements (aid, uid),
	FOREIGN KEY (puid, aid, price) REFERENCES Bids (uid, aid, bidPrice)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Accepted`;
  return knex.raw(dropQuery);
};