exports.up = function(knex, Promise) {
  let createQuery = ` DROP TABLE IF EXISTS UserProfiles;
  CREATE TABLE UserProfiles (
  username        VARCHAR(20) UNIQUE NOT NULL,
  uid             INTEGER NOT NULL,
  dateJoined      TIMESTAMP NOT NULL,
  PRIMARY KEY (uid),
  FOREIGN KEY (uid) REFERENCES Users ON DELETE CASCADE
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE UserProfiles`;
  return knex.raw(dropQuery);
};