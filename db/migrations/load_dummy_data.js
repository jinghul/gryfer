exports.up = function(knex, Promise) {
  let createQuery = `INSERT INTO Users (fname, lname, email) VALUES
	('charles', 'ma', 'cma4@bu.edu'),
	('alan', 'burstein', 'alanbur@bu.edu'),
	('ethan', 'zou', 'ezou20@college.harvard.edu'),
	('jinghu', 'lei', 'jinghul@bu.edu');

	INSERT INTO UserProfiles (username, uid, dateJoined) VALUES
	('churles', 1, NOW()::timestamp),
	('aaron', 2, NOW()::timestamp),
	('sleppy', 3, NOW()::timestamp),
	('bingboo', 4, NOW()::timestamp);

	INSERT INTO Passengers (uid, tripsTaken, rating) VALUES
	(1, 0, 4.5),
	(2, 0, 5.0);

	INSERT INTO Cars (cid) VALUES
	(100),
	(101);

	INSERT INTO Drivers (uid, tripsDriven, rating, cid, license) VALUES
	(3, 3, 2.0, 100, 'S918841412'),
	(4, 2, 4.5, 101, 'S847189374');

	INSERT INTO Accounts (uid, password, mode, userToken) VALUES
	(1, 'what', false, 'usertoken1'),
	(2, 'a', false, 'usertoken2'),
	(3, 'great', true, 'usertoken3'),
	(4, 'password', true, 'usertoken4');

	INSERT INTO SavedDestinations (nickname, address, uid) VALUES
	('tembu', '28 college avenue east', 1),
	('mbs', 'marina bay sands', 1),
	('tembu', '28 college avenue east', 2),
	('tembu', '28 college avenue east', 3),
	('utown', '8 college avenue east', 4),
	('tembu', '28 college avenue east', 4),
	('fatboys', 'clarke quay somewhere', 4);

	INSERT INTO Advertisements (minBidPrice, fromAddress, toAddress, departureTime, uid, maxPassengers) VALUES
	(10.0, '28 college avenue east', 'marina bay sands', NOW()::timestamp, 3, 4),
	(15.0, '8 college avenue east', 'clarke quay somewhere', NOW()::timestamp, 4, 6),
	(16.0, 'fine foods', 'food clique', NOW()::timestamp, 4, 6);

                                               
	INSERT INTO Bids (uid, aid, numPassengers, bidPrice) VALUES
	(2, 2, 1, 18.0),
	(1, 2, 4, 19.0),
	(2, 1, 5, 11.0),
	(1, 3, 3, 19.0);

	INSERT INTO CarProfiles (cid, make, model, modelYear, milesDriven, maxPassengers) VALUES
	(100, 'toyota', 'prius', '2016', 124923.1, 4),
	(101, 'honda', 'crv', '2018', 98752.4, 6);

	INSERT INTO Accepted (aid, puid, duid, price) VALUES
	(2, 1, 4, 19.0),
	(1, 2, 3, 11.0);

	INSERT INTO DriverRatings(forUid, aid, byUid, rating) VALUES
	(4, 2, 1, 9.0);
	`;
  return knex.raw(createQuery);
};

// THESE SHOULD ERROR
//
// INSERT INTO Bids (uid, aid, bidPrice) VALUES
// (1, 1, 9.0);
// INSERT INTO DriverRatings(forUid, aid, byUid, rating) VALUES
// (4, 3, 1, 5.0);
// ---After the accepted bids---
// INSERT INTO Bids (uid, aid, bidPrice) VALUES
// (2, 2, 18.0);

exports.down = function(knex, Promise) {
  let dropQuery = ``;
  return knex.raw(dropQuery);
};

