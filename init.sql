CREATE TABLE Users (
	uid				INTEGER,
	fname 			VARCHAR(60),
	lname			VARCHAR(60),
	PRIMARY KEY (uid)
);

CREATE TABLE UserProfile (
	username		VARCHAR(20),
	dateJoined		DATE,
	uid				INTEGER NOT NULL,
	PRIMARY KEY (username),
	FOREIGN KEY (uid) REFERENCES Users
);

CREATE TABLE History (
	username 		VARCHAR(20),
	aid				INTEGER
	PRIMARY KEY (username, aid)
	FOREIGN KEY (username) REFERENCES UserProfile
	FOREIGN KEY (aid) REFERENCES Advertisement
);

CREATE TABLE Account (
	uid				INTEGER NOT NULL,
	password		VARCHAR(64),
	nickname		VARCHAR(20),
	PRIMARY KEY (uid, password),
	FOREIGN KEY (uid) REFERENCES Users,
	FOREIGN KEY (nickname) REFERENCES SavedDestinations
);

CREATE TABLE SavedDestinations (
	nickname		VARCHAR(20),
	address			VARCHAR(60),
	PRIMARY KEY (nickname)
);

CREATE TABLE Drivers (
	uid 			INTEGER NOT NULL REFERENCES Users(uid),
	tripsDriven		INTEGER NOT NULL,
	Rating			NUMERIC,
	cid				INTEGER,
	PRIMARY KEY (uid),
	FOREIGN KEY (cid) REFERENCES Car
);

CREATE TABLE Car (
	cid 			INTEGER,
	PRIMARY KEY (cid)
);

CREATE TABLE Advertisement (
	aid				INTEGER,
	minBidPrice		NUMERIC,
	fromAddress		VARCHAR(60),
	toAddress 		VARCHAR(60),
	uid			INTEGER NOT NULL,
	PRIMARY KEY (aid),
	FOREIGN KEY (uid) REFERENCES Drivers
);

CREATE TABLE Passengers (
	uid 			INTEGER NOT NULL REFERENCES Users(uid),
	tripsTaken		INTEGER NOT NULL,
	rating			NUMERIC,
	PRIMARY KEY (uid)	
);

CREATE TABLE Bid (
	uid 			INTEGER,
	aid				INTEGER,
	bidPrice		NUMERIC NOT NULL,
	PRIMARY KEY (uid, aid)
	FOREIGN KEY (uid) REFERENCES Passengers,
	FOREIGN KEY (aid) REFERENCES Advertisement
);

CREATE TABLE CarProfile (
	cid				INTEGER,
	make			VARCHAR(60),
	model			VARCHAR(60),
	modelYear		VARCHAR(60),
	milesDriven		VARCHAR(60),
	PRIMARY KEY (cid),
	FOREIGN KEY (cid) REFERENCES Car
);