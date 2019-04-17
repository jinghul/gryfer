
exports.up = function(knex, Promise) {
  let createQuery = `
  CREATE OR REPLACE FUNCTION update_rating_passenger(INTEGER, NUMERIC) RETURNS NUMERIC AS
    $$
    DECLARE num_reviews INTEGER;
            prev_rating NUMERIC;
    BEGIN
        SELECT rating INTO prev_rating
        FROM Passengers
        WHERE $1 = Passengers.uid;

        SELECT count(*) INTO num_reviews
        FROM PassengerRatings
        WHERE PassengerRatings.forUid = $1;

        prev_rating = COALESCE(prev_rating, 0);

        RETURN ((num_reviews-1) * prev_rating + $2)/(num_reviews);

    END;
    $$
    LANGUAGE plpgsql ;


  CREATE OR REPLACE FUNCTION update_rating_driver(INTEGER, NUMERIC) RETURNS NUMERIC AS
    $$
    DECLARE num_reviews INTEGER;
            prev_rating NUMERIC;
    BEGIN
        SELECT rating INTO prev_rating
        FROM Drivers
        WHERE $1 = Drivers.uid;

        SELECT count(*) INTO num_reviews
        FROM DriverRatings
        WHERE DriverRatings.forUid = $1;
        
        prev_rating = COALESCE(prev_rating, 0);

        RETURN ((num_reviews-1) * prev_rating + $2)/(num_reviews);
    END;
    $$
    LANGUAGE plpgsql ;`

    return knex.raw(createQuery)
};

exports.down = function(knex, Promise) {
  let dropQuery = `
  DROP FUNCTION update_rating_passenger;
  DROP FUNCTION update_rating_driver;
  `;
  return knex.raw(dropQuery);
};
