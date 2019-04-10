CREATE TABLE Users (
  uid               SERIAL,
  fname             VARCHAR(60),
  lname             VARCHAR(60),
  email             VARCHAR(60) UNIQUE,
  PRIMARY KEY (uid)
)

