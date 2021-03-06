exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Histories;
  CREATE TABLE Histories (
  	aid				    INTEGER NOT NULL,
    timeCompleted 		TIMESTAMP NOT NULL,
  	PRIMARY KEY (aid),
  	FOREIGN KEY (aid) REFERENCES Accepted
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Histories`;
  return knex.raw(dropQuery);
};