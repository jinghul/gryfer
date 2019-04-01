exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Accepted;
  CREATE TABLE Accepted (
	aid				SERIAL,
	uid				INTEGER,
	price			FLOAT NOT NULL,
	PRIMARY KEY (aid, uid),
	FOREIGN KEY (aid) REFERENCES Advertisement,
	FOREIGN KEY (uid, aid, price) REFERENCES Bid
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Accepted`;
  return knex.raw(dropQuery);
};