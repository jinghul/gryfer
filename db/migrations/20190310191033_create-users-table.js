exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE Users (
  uid       INTEGER,
  fname       VARCHAR(60),
  lname     VARCHAR(60),
  password    VARCHAR(64),
  PRIMARY KEY (uid),
  FOREIGN KEY (uid, password) REFERENCES Account
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `DROP TABLE Users`;
  return knex.raw(dropQuery);
};