exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Users;
  CREATE TABLE Users (
  uid               SERIAL,
  fname             VARCHAR(60),
  lname             VARCHAR(60),
  email             VARCHAR(60) UNIQUE,
  PRIMARY KEY (uid)
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Users`;
  return knex.raw(dropQuery);
};