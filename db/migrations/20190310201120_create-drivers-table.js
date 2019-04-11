exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Drivers;
  CREATE TABLE Drivers (
	uid 				INTEGER NOT NULL REFERENCES Users(uid),
	rating				NUMERIC,
	license				VARCHAR(10) NOT NULL,
	PRIMARY KEY (uid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Drivers`;
  return knex.raw(dropQuery);
};