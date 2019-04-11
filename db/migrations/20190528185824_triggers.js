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
          FROM (CarProfiles 
          INNER JOIN Cars ON Cars.cid=CarProfiles.cid
          INNER JOIN Advertisements ON CarProfiles.uid=Advertisements.uid) AS CarAd
          WHERE NEW.aid = CarAd.aid
        ) THEN
            RAISE EXCEPTION 'No valid car for ads';
            RETURN NULL;
        END IF;
           
        SELECT CarAd.maxPassengers into max_pass
        FROM (CarProfiles 
        INNER JOIN Cars ON Cars.cid=CarProfiles.cid
        INNER JOIN Advertisements ON CarProfiles.uid=Advertisements.uid) AS CarAd
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
    
    
    
    CREATE OR REPLACE FUNCTION bid_on_own_ad()
    RETURNS TRIGGER AS
    $$
    DECLARE ad_creator_id INTEGER;
    BEGIN
        SELECT uid INTO ad_creator_id
        FROM Advertisements
        WHERE NEW.aid = Advertisements.aid;
        
        IF (ad_creator_id = NEW.uid) THEN
            RAISE EXCEPTION 'Cannot bid on your own ad';
            RETURN NULL;
        END IF;
        
        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;
    
    CREATE TRIGGER bid_on_own_ad
    BEFORE INSERT OR UPDATE
    ON Bids
    FOR EACH ROW
    EXECUTE PROCEDURE bid_on_own_ad();
    
    
    CREATE OR REPLACE FUNCTION accepted_completed_ad()
    RETURNS TRIGGER AS
    $$
    BEGIN
        IF NOT EXISTS (
        SELECT 1
        FROM Accepted
        WHERE NEW.aid = Accepted.aid) THEN
            RAISE EXCEPTION 'Advertisement not accepted';
            RETURN NULL;
        END IF;
        
        RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql ;
    
    CREATE TRIGGER accepted_completed_ad
    BEFORE INSERT OR UPDATE
    ON Histories
    FOR EACH ROW
    EXECUTE PROCEDURE accepted_completed_ad();
    
    `;


  return knex.raw(createQuery);


};
    
exports.down = function(knex, Promise) {
  
};