exports.up = function(knex, Promise) {
  
  let createQuery = `
    CREATE OR REPLACE FUNCTION add_bid_to_history()
    RETURNS TRIGGER AS
    $$
    BEGIN
        INSERT INTO
            History(uid, aid)
            VALUES(NEW.puid,NEW.aid);
        INSERT INTO
            History(uid, aid)
            VALUES(NEW.duid,NEW.aid);
        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE TRIGGER add_bid_to_history
    AFTER INSERT
    ON Accepted
    FOR EACH ROW
    EXECUTE PROCEDURE add_bid_to_history();



    CREATE OR REPLACE FUNCTION check_min_bid()
    RETURNS TRIGGER AS
    $$
    DECLARE min_bid NUMERIC;
    BEGIN
        SELECT minBidPrice into min_bid
        FROM Advertisement
        WHERE NEW.aid = Advertisement.aid;

        IF NEW.bidPrice < min_bid THEN
            RAISE NOTICE 'Bid price too low';
            RETURN NULL;
        END IF;

        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;

    CREATE TRIGGER check_min_bid
    BEFORE INSERT OR UPDATE
    ON Bid
    FOR EACH ROW
    EXECUTE PROCEDURE check_min_bid();




    CREATE OR REPLACE FUNCTION update_rating_driver()
    RETURNS TRIGGER AS
    $$
    DECLARE num_reviews INTEGER;
            prev_rating NUMERIC;

    BEGIN
        SELECT rating INTO prev_rating
        FROM Drivers
        WHERE NEW.forUid = Drivers.uid;

        SELECT count(*) INTO num_reviews
        FROM DriverRatings
        WHERE DriverRatings.forUid = NEW.forUid;

        prev_rating = COALESCE(prev_rating, 0);

        UPDATE Drivers
        SET rating = (num_reviews * prev_rating + NEW.rating)/(num_reviews + 1)
        WHERE NEW.forUid = Drivers.uid;

        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;

    CREATE TRIGGER update_rating_driver
    BEFORE INSERT OR UPDATE
    ON DriverRatings
    FOR EACH ROW
    EXECUTE PROCEDURE update_rating_driver();




    CREATE OR REPLACE FUNCTION update_rating_passenger()
    RETURNS TRIGGER AS
    $$
    DECLARE num_reviews INTEGER;
            prev_rating NUMERIC;

    BEGIN
        SELECT rating INTO prev_rating
        FROM Passengers
        WHERE NEW.forUid = Passengers.uid;

        SELECT count(*) INTO num_reviews
        FROM PassengerRatings
        WHERE PassengerRatings.forUid = NEW.forUid;

        prev_rating = COALESCE(prev_rating, 0);

        UPDATE Passengers
        SET rating = (num_reviews * prev_rating + NEW.rating)/(num_reviews + 1)
        WHERE NEW.forUid = Passengers.uid;
    END;
    $$
    LANGUAGE plpgsql ;

    CREATE TRIGGER update_rating_passenger
    BEFORE INSERT OR UPDATE
    ON PassengerRatings
    FOR EACH ROW
    EXECUTE PROCEDURE update_rating_passenger();




    CREATE OR REPLACE FUNCTION update_num_trips()
    RETURNS TRIGGER AS
    $$
    DECLARE num_trips INTEGER;

    BEGIN
        SELECT tripsTaken INTO num_trips
        FROM Passengers
        WHERE NEW.puid = Passengers.uid;

        UPDATE Passengers
        SET tripsTaken = num_trips + 1
        WHERE NEW.puid = Passengers.uid;

        SELECT tripsDriven INTO num_trips
        FROM Drivers
        WHERE NEW.duid = Drivers.uid;

        UPDATE Drivers
        SET tripsDriven = num_trips + 1
        WHERE NEW.duid = Drivers.uid;

        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;

    CREATE TRIGGER update_num_trips
    BEFORE INSERT OR UPDATE
    ON Accepted
    FOR EACH ROW
    EXECUTE PROCEDURE update_num_trips();
    `;


  return knex.raw(createQuery);


};


exports.down = function(knex, Promise) {
  
};