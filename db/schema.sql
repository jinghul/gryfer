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

CREATE TABLE Histories (
  	puid			INTEGER NOT NULL,
	duid 			INTEGER NOT NULL,
	aid				INTEGER NOT NULL,
	PRIMARY KEY (aid),
	FOREIGN KEY (aid) REFERENCES Accepted
);



