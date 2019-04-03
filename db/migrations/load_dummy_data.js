exports.up = function(knex, Promise) {
  let createQuery = `INSERT INTO Users (fname, lname, email) VALUES
	('charles', 'ma', 'cma4@bu.edu'),
	('alan', 'burstein', 'alanbur@bu.edu'),
	('ethan', 'zou', 'ezou20@college.harvard.edu'),
	('jinghu', 'lei', 'jinghul@bu.edu');

	INSERT INTO UserProfile (username, uid, dateJoined) VALUES
	('churles', 1, NOW()::timestamp),
	('aaron', 2, NOW()::timestamp),
	('sleppy', 3, NOW()::timestamp),
	('bingboo', 4, NOW()::timestamp);

	INSERT INTO Passengers (uid, tripsTaken, rating) VALUES
	(1, 4, 4.5),
	(2, 1, 5.0);

	INSERT INTO Car (cid) VALUES
	(100),
	(101);

	INSERT INTO Drivers (uid, tripsDriven, rating, cid, license) VALUES
	(3, 3, 2.0, 100, 'S918841412'),
	(4, 2, 4.5, 101, 'S847189374');

	INSERT INTO Account (uid, password, userToken) VALUES
	(1, 'what', 'usertoken1'),
	(2, 'a', 'usertoken2'),
	(3, 'great', 'usertoken3'),
	(4, 'password', 'usertoken4');

	INSERT INTO SavedDestinations (nickname, address, uid) VALUES
	('tembu', '28 college avenue east', 1),
	('mbs', 'marina bay sands', 1),
	('tembu', '28 college avenue east', 2),
	('tembu', '28 college avenue east', 3),
	('utown', '8 college avenue east', 4),
	('tembu', '28 college avenue east', 4),
	('fatboys', 'clarke quay somewhere', 4);

	INSERT INTO Advertisement (minBidPrice, fromAddress, toAddress, departureTime, uid) VALUES
	(10.0, '28 college avenue east', 'marina bay sands', NOW()::timestamp, 3),
	(15.0, '8 college avenue east', 'clarke quay somewhere', NOW()::timestamp, 4);

	INSERT INTO History (uid, aid) VALUES
	(3, 1),
	(4, 2);

	INSERT INTO Bid (uid, aid, bidPrice) VALUES
	(1, 1, 10.0),
	(2, 2, 18.0),
	(1, 2, 19.0),
	(2, 1, 11.0);

	INSERT INTO CarProfile (cid, make, model, modelYear, milesDriven) VALUES
	(100, 'toyota', 'prius', '2016', 124923.1),
	(101, 'honda', 'civic', '2018', 98752.4);

	INSERT INTO Accepted (aid, puid, duid, price) VALUES
	(2, 1, 4, 19.0),
	(1, 2, 3, 11.0);`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = ``;
  return knex.raw(dropQuery);
};

