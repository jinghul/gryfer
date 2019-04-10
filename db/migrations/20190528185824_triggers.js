exports.up = function(knex, Promise) {
  
  let createQuery = `    
    CREATE OR REPLACE FUNCTION check_min_bid()
    RETURNS TRIGGER AS
    $$
    DECLARE min_bid NUMERIC;
    BEGIN
        SELECT minBidPrice into min_bid
        FROM Advertisements
        WHERE NEW.aid = Advertisements.aid;
        IF NEW.bidPrice < min_bid THEN
            RAISE EXCEPTION 'Bid price too low';
            RETURN NULL;
        END IF;
        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;
    CREATE TRIGGER check_min_bid
    BEFORE INSERT OR UPDATE
    ON Bids
    FOR EACH ROW
    EXECUTE PROCEDURE check_min_bid();
    
    CREATE OR REPLACE FUNCTION check_new_bid_not_accepted()
    RETURNS TRIGGER AS
    $$
    BEGIN
        IF EXISTS (
        SELECT 1
        FROM Accepted
        WHERE NEW.aid = Accepted.aid) THEN
            RAISE EXCEPTION 'Bid already accepted';
            RETURN NULL;
        END IF;
        
        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;
    CREATE TRIGGER check_new_bid_not_accepted
    BEFORE INSERT OR UPDATE
    ON Bids
    FOR EACH ROW
    EXECUTE PROCEDURE check_new_bid_not_accepted();
    
    
    
    CREATE OR REPLACE FUNCTION check_not_too_many_passengers()
    RETURNS TRIGGER AS
    $$
    DECLARE max_pass NUMERIC;
    BEGIN
        
        IF NOT EXISTS(
          SELECT 1
          FROM (Drivers 
          INNER JOIN  CarProfiles ON CarProfiles.cid=Drivers.cid
          INNER JOIN Advertisements ON Drivers.uid=Advertisements.uid) AS CarAd
          WHERE NEW.aid = CarAd.aid
        ) THEN
            RAISE EXCEPTION 'No valid car for ads';
            RETURN NULL;
        END IF;
           
        SELECT CarAd.maxPassengers into max_pass
        FROM (Drivers 
        INNER JOIN  CarProfiles ON CarProfiles.cid=Drivers.cid 
        INNER JOIN Advertisements ON Drivers.uid=Advertisements.uid) AS CarAd
        WHERE NEW.aid = CarAd.aid;
    
        IF NEW.numPassengers > max_pass THEN
              RAISE EXCEPTION 'Too many passengers';
            RETURN NULL;
        END IF;
        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;
    CREATE TRIGGER check_not_too_many_passengers
    BEFORE INSERT OR UPDATE
    ON Bids
    FOR EACH ROW
    EXECUTE PROCEDURE check_not_too_many_passengers();
    
    
    CREATE OR REPLACE FUNCTION ad_not_accepted()
    RETURNS TRIGGER AS
    $$
    BEGIN
        IF EXISTS (
        SELECT 1
        FROM Accepted
        WHERE OLD.aid = Accepted.aid) THEN
            RAISE EXCEPTION 'Advertisement already accepted';
            RETURN NULL;
        END IF;
        
        RETURN NULL;
    END;
    $$
    LANGUAGE plpgsql ;
    CREATE TRIGGER ad_not_accepted
    BEFORE DELETE
    ON Advertisements
    FOR EACH ROW
    EXECUTE PROCEDURE ad_not_accepted();
    
    
    
    
    
    
    
    
    
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
    `;


  return knex.raw(createQuery);


};
// REMOVED TRIGGER
// CREATE OR REPLACE FUNCTION check_review_driver()
//     RETURNS TRIGGER AS
//     $$
//     DECLARE ad_puid INTEGER;
//             ad_duid INTEGER;
//             count INTEGER;
//     BEGIN
    
//         SELECT count(*) into count
//         FROM Accepted
//         WHERE NEW.aid = Accepted.aid;
        
//         IF count = 0 THEN
//           RAISE EXCEPTION 'Ad not accepted';
//           RETURN NULL;
//         END IF;
        
//         SELECT puid, duid INTO ad_puid, ad_duid
//         FROM Accepted
//         WHERE NEW.aid = Accepted.aid;

//         IF NEW.byUid <> ad_puid THEN
//             RAISE EXCEPTION 'Incorrect Passenger';
//             RETURN NULL;
//         ELSIF NEW.forUid <> ad_duid THEN
//             RAISE EXCEPTION 'Incorrect Driver';
//             RETURN NULL;
//         END IF;

//         RETURN NEW;
//     END;
//     $$
//     LANGUAGE plpgsql;

//     CREATE TRIGGER check_review_driver
//     BEFORE INSERT OR UPDATE
//     ON DriverRatings
//     FOR EACH ROW
//     EXECUTE PROCEDURE check_review_driver();
    
    
    
//     CREATE OR REPLACE FUNCTION check_review_passenger()
//     RETURNS TRIGGER AS
//     $$
//     DECLARE ad_puid INTEGER;
//             ad_duid INTEGER;
//             count INTEGER;
//     BEGIN
    
        
        
//         SELECT puid, duid INTO ad_puid, ad_duid
//         FROM Accepted
//         WHERE NEW.aid = Accepted.aid;

//         IF NEW.forUid <> ad_puid THEN
//             RAISE EXCEPTION 'Incorrect Passenger';
//             RETURN NULL;
//         ELSIF NEW.byUid <> ad_duid THEN
//             RAISE EXCEPTION 'Incorrect Driver';
//             RETURN NULL;
//         END IF;

//         RETURN NEW;
//     END;
//     $$
//     LANGUAGE plpgsql;
    
//     CREATE TRIGGER check_review_passenger
//     BEFORE INSERT OR UPDATE
//     ON PassengerRatings
//     FOR EACH ROW
//     EXECUTE PROCEDURE check_review_passenger();
    
exports.down = function(knex, Promise) {
  
};