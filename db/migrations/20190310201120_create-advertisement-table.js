exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE Advertisement (
	aid				INTEGER,
	minBidPrice		FLOAT,
	fromAddress		VARCHAR(60),
	toAddress 		VARCHAR(60),
	uid			INTEGER NOT NULL,
	PRIMARY KEY (aid),
	FOREIGN KEY (uid) REFERENCES Drivers
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Advertisement`;
  return knex.raw(dropQuery);
};