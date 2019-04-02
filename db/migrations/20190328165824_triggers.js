exports.up = function(knex, Promise) {
  
  let createQuery = `
    CREATE OR REPLACE FUNCTION accept_bid ()
    RETURNS TRIGGER AS
    $$
    BEGIN
        INSERT INTO
            History(username, aid)
            VALUES(new.uid,new.aid);
               RETURN new;
    END;
    $$
    LANGUAGE plpgsql ;

    CREATE TRIGGER accept_bid
    AFTER INSERT OR UPDATE
    ON Accepted
    FOR EACH ROW
    EXECUTE PROCEDURE acceept_bid();
    `;
  return knex.raw(createQuery);


};

exports.down = function(knex, Promise) {
  
};