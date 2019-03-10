exports.up = function(knex, Promise) {
  let createQuery = ` DROP TABLE IF EXISTS UserProfile;
  CREATE TABLE UserProfile (
  username    VARCHAR(20),
  dateJoined    DATE,
  uid       INTEGER NOT NULL,
  PRIMARY KEY (username),
  FOREIGN KEY (uid) REFERENCES Users
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE UserProfile`;
  return knex.raw(dropQuery);
};