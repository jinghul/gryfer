exports.up = function(knex, Promise) {
  let createQuery = `CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
  )
  WITH (OIDS=FALSE);
  ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
  `;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
    let dropQuery = `DROP TABLE session`;
    return knex.raw(dropQuery);
};
