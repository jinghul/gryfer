-- TABLES

CREATE TABLE Users (
  uid               SERIAL,
  fname             VARCHAR(60) NOT NULL,
  lname             VARCHAR(60) NOT NULL,
  email             VARCHAR(60) UNIQUE NOT NULL,
  PRIMARY KEY (uid)
);

CREATE TABLE UserProfiles (
  username        VARCHAR(20) NOT NULL,
  uid             INTEGER NOT NULL,
  dateJoined      TIMESTAMP NOT NULL,
  PRIMARY KEY (uid),
  FOREIGN KEY (uid) REFERENCES Users
);

CREATE TABLE Passengers (
    uid             INTEGER NOT NULL,
    rating          NUMERIC,
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) REFERENCES Users
);

CREATE TABLE Cars (
    cid             SERIAL,
    make            VARCHAR(60) NOT NULL,
    model           VARCHAR(60) NOT NULL,
    modelYear       INTEGER NOT NULL,
    maxPassengers   INTEGER NOT NULL,
    UNIQUE (make, model, modelYear),
    PRIMARY KEY (cid)
);

CREATE TABLE Drivers (
    uid                 INTEGER NOT NULL,
    rating              NUMERIC,
    license             VARCHAR(10) NOT NULL,
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) REFERENCES Users
);

CREATE TABLE Accounts (
    uid                 INTEGER NOT NULL,
    passwordHash        VARCHAR(100) NOT NULL,
    mode                BOOLEAN NOT NULL,
    userToken           VARCHAR(64),
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) REFERENCES Users
);

CREATE TABLE SavedDestinations (
    nickname        VARCHAR(20) NOT NULL,
    address         VARCHAR(60) NOT NULL,
    uid             INTEGER NOT NULL,
    lat             NUMERIC NOT NULL,
    lng             NUMERIC NOT NULL,
    PRIMARY KEY (nickname, uid),
    FOREIGN KEY (uid) REFERENCES Accounts
);

CREATE TABLE Advertisements (
    aid                 SERIAL,
    minBidPrice         NUMERIC NOT NULL,
    fromAddress         VARCHAR(60) NOT NULL,
    fromLat             NUMERIC NOT NULL,
    fromLng             NUMERIC NOT NULL,
    toAddress           VARCHAR(60) NOT NULL,
    toLat               NUMERIC NOT NULL,
    toLng               NUMERIC NOT NULL,
    departureTime       TIMESTAMP NOT NuLL,
    uid                 INTEGER NOT NULL,
    UNIQUE (aid, uid),
    PRIMARY KEY (aid),
    FOREIGN KEY (uid) REFERENCES Drivers
);

CREATE FUNCTION getMaxPrice(INTEGER, INTEGER) RETURNS NUMERIC AS
    $$
    DECLARE maxPrice NUMERIC;
    BEGIN
        SELECT MAX(bidPrice) into maxPrice
        FROM Bids
        WHERE uid = $1 AND aid = $2;

        RETURN maxPrice;
    END;
    $$
    LANGUAGE plpgsql;
  
CREATE TABLE Bids (
    uid             INTEGER NOT NULL,
    aid             INTEGER NOT NULL,
    numPassengers   INTEGER NOT NULL,
    bidPrice        NUMERIC NOT NULL,
    PRIMARY KEY (uid, aid, bidPrice),
    FOREIGN KEY (uid) REFERENCES Passengers,
    FOREIGN KEY (aid) REFERENCES Advertisements ON DELETE CASCADE,
    CONSTRAINT checkMaxBid
        CHECK (bidPrice > getMaxPrice(uid, aid))
);

CREATE TABLE CarProfiles (
    uid             INTEGER NOT NULL,
    cid             INTEGER NOT NULL,
    licensePlate    VARCHAR(10) NOT NULL,
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) REFERENCES Drivers,
    FOREIGN KEY (cid) REFERENCES Cars
);

CREATE TABLE Accepted (
    aid             INTEGER NOT NULL,
    puid            INTEGER NOT NULL,
    duid            INTEGER NOT NULL,
    price           NUMERIC NOT NULL,
    PRIMARY KEY (aid),
    FOREIGN KEY (aid, duid) REFERENCES Advertisements (aid, uid),
    FOREIGN KEY (puid, aid, price) REFERENCES Bids (uid, aid, bidPrice)
);

CREATE TABLE Histories (
    aid                 INTEGER NOT NULL,
    timeCompleted       TIMESTAMP NOT NULL,
    PRIMARY KEY (aid),
    FOREIGN KEY (aid) REFERENCES Accepted
)

CREATE TABLE PassengerRatings (
    forUid          INTEGER NOT NULL,
    aid             INTEGER NOT NULL,
    byUid           INTEGER NOT NULL,
    rating          NUMERIC NOT NULL,
    PRIMARY KEY (aid),
    FOREIGN KEY (forUid) REFERENCES Passengers (uid),
    FOREIGN KEY (byUid)  REFERENCES Drivers (uid),
    FOREIGN KEY (aid) REFERENCES Accepted (aid)
);

CREATE TABLE DriverRatings (
    forUid          INTEGER NOT NULL,
    aid             INTEGER NOT NULL,
    byUid           INTEGER NOT NULL,
    rating          NUMERIC NOT NULL,
    PRIMARY KEY (aid),
    FOREIGN KEY (forUid) REFERENCES Drivers (uid),
    FOREIGN KEY (byUid)  REFERENCES Passengers (uid),
    FOREIGN KEY (aid) REFERENCES Accepted (aid)
);


-- TRIGGERS

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


-- FUNCTIONS

CREATE OR REPLACE FUNCTION update_rating_passenger(INTEGER, NUMERIC) RETURNS VOID AS
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
        UPDATE Passengers
        SET rating = (num_reviews * prev_rating + $2)/(num_reviews + 1)
        WHERE $1 = Passengers.uid;

    END;
    $$
    LANGUAGE plpgsql ;


CREATE OR REPLACE FUNCTION update_rating_driver(INTEGER, NUMERIC) RETURNS VOID AS
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
        UPDATE Drivers
        SET rating = (num_reviews * prev_rating + $2)/(num_reviews + 1)
        WHERE $1 = Drivers.uid;
    END;
    $$
    LANGUAGE plpgsql ;
