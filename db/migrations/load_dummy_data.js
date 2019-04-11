exports.up = function(knex, Promise) {
  let createQuery = `INSERT INTO Users (fname, lname, email) VALUES
	('Charles', 'Ma', 'cma4@bu.edu'),
	('Alan', 'Burstein', 'alanbur@bu.edu'),
	('Ethan', 'Zou', 'ezou20@college.harvard.edu'),
	('Jinghu', 'Lei', 'jing@bu.edu'),
	('Rudhra', 'Raveendran', 'rud@bu.edu'),
	('Wayne', 'Snyder', 'snyder@bu.edu'),
	('Jane', 'Doe', 'jane@email.com');

	INSERT INTO UserProfiles (username, uid, dateJoined) VALUES
	('churles', 1, NOW()::timestamp),
	('aaron', 2, NOW()::timestamp),
	('sleppy', 3, NOW()::timestamp),
	('bingboo', 4, NOW()::timestamp),
	('rooday', 5, NOW()::timestamp),
	('snyder', 6, NOW()::timestamp),
	('jdoe', 7, NOW()::timestamp);

	INSERT INTO Passengers (uid, tripsTaken, rating) VALUES
	(1, 0, 4.5),
	(2, 0, 5.0),
	(5, 0, 3.7),
	(6, 10, 5.0);

	INSERT INTO Cars (make, model, modelYear, maxPassengers) VALUES
	('toyota', 'prius', 2009, 4),
	('honda', 'crv', 2012, 6),
	('BMW', 'M8', 2018, 4),
	('toyota', 'sienna', 2004, 6);

	INSERT INTO Drivers (uid, tripsDriven, rating, license) VALUES
	(3, 3, 2.0, 'S918841412'),
	(4, 2, 4.5, 'S847189374'),
	(6, 100, 5.0, 'S847876374'),
	(7, 89, 3.8, 'S973654014');

	INSERT INTO Accounts (uid, passwordHash, mode, userToken) VALUES
	(1, 'what', false, 'usertoken1'),
	(2, 'a', false, 'usertoken2'),
	(3, 'great', true, 'usertoken3'),
	(4, 'again', true, 'usertoken4'),
	(5, 'words', false, 'usertoken5'),
	(6, 'more', false, 'usertoken6'),
	(7, 'random', true, 'usertoken7');

	INSERT INTO SavedDestinations (nickname, address, uid) VALUES
	('tembu', '28 college avenue east', 1),
	('mbs', 'marina bay sands', 1),
	('tembu', '28 college avenue east', 2),
	('tembu', '28 college avenue east', 3),
	('utown', '8 college avenue east', 4),
	('tembu', '28 college avenue east', 4),
	('fatboys', 'clarke quay somewhere', 4);

	INSERT INTO Advertisements (minBidPrice, fromAddress, fromLat, fromLng, toAddress, toLat, toLng, departureTime, uid) VALUES
	(10.0, '28 College Avenue East', 1.3060616, 103.7719055, 'Marina Bay Sands', 1.2833808, 103.8585377, '2019-04-26 09:30', 3),
	(15.0, '8 College Avenue East', 1.3078482, 103.7709924, 'Clarke Quay', 1.2906078, 103.8442855, '2019-04-30 14:30', 4),
	(13.0, 'Singapore Zoo', 1.4043539, 103.7908343, 'Jurong Bird Park', 1.3187119, 103.704253, '2019-05-03 19:30', 6),
	(18.0, 'TreeTop Walk', 1.3607341, 103.8103328, 'Nanyang Technological University', 1.3483153, 103.680946, '2019-04-18 12:30', 6),
	(13.0, 'McDonalds', 1.3226099, 103.8115106, 'ION Orchard Mall', 1.3039991,103.8297814, '2019-05-31 14:25', 7);

    INSERT INTO CarProfiles (uid, cid, licensePlate) VALUES
    (3, 1, 'plate1'),
		(4, 2, 'plate2'),
		(6, 3, 'plate3'),
		(7, 4, 'plate4');
                                               
	INSERT INTO Bids (uid, aid, numPassengers, bidPrice) VALUES
	(2, 2, 1, 18.0),
	(1, 2, 4, 33.0),
	(2, 1, 4, 11.0),
	(1, 3, 3, 19.30),
	(1, 2, 3, 50.15),
	(5, 4, 4, 25.0),
	(5, 4, 4, 28.50),
	(6, 5, 6, 31.23),
	(6, 5, 6, 47.4);


	INSERT INTO Accepted (aid, puid, duid, price) VALUES
	(2, 1, 4, 50.15);

    INSERT INTO Histories(puid, duid, aid, timeCompleted) VALUES 
    (1, 4, 2, '2019-04-30 15:35');
    
--     DELETE FROM Advertisements where aid=1;
                
--	INSERT INTO DriverRatings(forUid, aid, byUid, rating) VALUES
--	(4, 2, 1, 4.5);

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

