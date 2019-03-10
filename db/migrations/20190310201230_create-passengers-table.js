exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE Passengers (
	uid 			INTEGER NOT NULL REFERENCES Users(uid),
	tripsTaken		INTEGER NOT NULL,
	rating			FLOAT,
	PRIMARY KEY (uid)	
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Passengers`;
  return knex.raw(dropQuery);
};