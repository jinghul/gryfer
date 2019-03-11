exports.up = function(knex, Promise) {
  let createQuery = ` DROP TABLE IF EXISTS UserProfile;
  CREATE TABLE UserProfile (
  username      VARCHAR(20),
  uid           INTEGER NOT NULL,
  passwordHash  VARCHAR(100),
  userToken     VARCHAR(100),
  dateJoined    TIMESTAMP,
  PRIMARY KEY (username),
  FOREIGN KEY (uid) REFERENCES Users
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE UserProfile`;
  return knex.raw(dropQuery);
};