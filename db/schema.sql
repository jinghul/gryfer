CREATE TABLE Users (
  uid               SERIAL,
  fname             VARCHAR(60),
  lname             VARCHAR(60),
  email             VARCHAR(60) UNIQUE,
  PRIMARY KEY (uid)
);

CREATE TABLE UserProfiles (
  username        VARCHAR(20),
  uid             INTEGER NOT NULL,
  dateJoined      TIMESTAMP,
  PRIMARY KEY (uid),
  FOREIGN KEY (uid) REFERENCES Users
);

CREATE TABLE Passengers (
	uid 			INTEGER NOT NULL REFERENCES Users(uid),
	tripsTaken		INTEGER NOT NULL,
	rating			NUMERIC,
	PRIMARY KEY (uid)	
);

CREATE TABLE Cars (
	cid 			SERIAL,
	PRIMARY KEY (cid)
);

CREATE TABLE Drivers (
	uid 				INTEGER NOT NULL REFERENCES Users(uid),
	tripsDriven			INTEGER NOT NULL,
	rating				NUMERIC,
	cid					INTEGER,
	license				VARCHAR(10) NOT NULL,
	PRIMARY KEY (uid),
	FOREIGN KEY (cid) REFERENCES Cars
);

CREATE TABLE Accounts (
	uid				    INTEGER NOT NULL,
  	passwordHash		VARCHAR(100) NOT NULL,
  	mode            	BOOLEAN NOT NULL,
  	userToken		    VARCHAR(64),
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES Users
);

CREATE TABLE SavedDestinations (
	nickname		VARCHAR(20),
	address			VARCHAR(60),
	uid				INTEGER NOT NULL,
	PRIMARY KEY (nickname, uid),
	FOREIGN KEY (uid) REFERENCES Accounts
);

CREATE TABLE Advertisements (
	aid					SERIAL,
	minBidPrice			NUMERIC,
	fromAddress			VARCHAR(60),
	fromLat				NUMERIC,
	fromLng				NUMERIC,
	toAddress 			VARCHAR(60),
	toLat				NUMERIC,
	toLng				NUMERIC,
	departureTime		TIMESTAMP,
	uid					INTEGER NOT NULL,
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
	uid 			INTEGER,
	aid				INTEGER,
	numPassengers   INTEGER,
	bidPrice		NUMERIC NOT NULL,
	PRIMARY KEY (uid, aid, bidPrice),
	FOREIGN KEY (uid) REFERENCES Passengers,
	FOREIGN KEY (aid) REFERENCES Advertisements,
	CONSTRAINT checkMaxBid
		CHECK (bidPrice > getMaxPrice(uid, aid))
);

CREATE TABLE CarProfiles (
	cid				INTEGER,
	license         VARCHAR(10),
	make			VARCHAR(60),
	model			VARCHAR(60),
	modelYear		VARCHAR(60),
	milesDriven		NUMERIC,
	maxPassengers	INTEGER NOT NULL,
	PRIMARY KEY (cid),
	FOREIGN KEY (cid) REFERENCES Cars
);

CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
  )
  WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE TABLE Accepted (
	aid				INTEGER,
	puid			INTEGER,
	duid			INTEGER,
	price			NUMERIC NOT NULL,
	PRIMARY KEY (aid),
	FOREIGN KEY (aid, duid) REFERENCES Advertisements (aid, uid),
	FOREIGN KEY (puid, aid, price) REFERENCES Bids (uid, aid, bidPrice)
);

CREATE TABLE Histories (
    puid			    INTEGER NOT NULL,
	duid 			    INTEGER NOT NULL,
	aid				    INTEGER NOT NULL,
    timeCompleted  		TIMESTAMP,
	PRIMARY KEY (aid),
	FOREIGN KEY (aid) REFERENCES Accepted
)

CREATE TABLE PassengerRatings (
	forUid			INTEGER NOT NULL,
	aid				INTEGER NOT NULL,
	byUid			INTEGER NOT NULL,
	rating 			NUMERIC NOT NULL,
	PRIMARY KEY (forUid, aid),
	FOREIGN KEY (forUid) REFERENCES Passengers,
	FOREIGN KEY (byUid)  REFERENCES Drivers,
	FOREIGN KEY (aid) REFERENCES Accepted (aid)
);

CREATE TABLE DriverRatings (
	forUid 			INTEGER NOT NULL,
	aid				INTEGER NOT NULL,
	byUid			INTEGER NOT NULL,
	rating 			NUMERIC NOT NULL,
	PRIMARY KEY (forUid, aid),
	FOREIGN KEY (forUid) REFERENCES Drivers,
	FOREIGN KEY (byUid)  REFERENCES Passengers,
    FOREIGN KEY (aid) REFERENCES Accepted (aid)
);



