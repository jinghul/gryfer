exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Users;
  CREATE TABLE Users (
  uid               SERIAL,
  fname             VARCHAR(60) NOT NULL,
  lname             VARCHAR(60) NOT NULL,
  email             VARCHAR(60) UNIQUE NOT NULL,
  PRIMARY KEY (uid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Users`;
  return knex.raw(dropQuery);
};