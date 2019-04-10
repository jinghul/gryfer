exports.up = function(knex, Promise) {
  let createQuery = `DROP TABLE IF EXISTS Bids;
  CREATE FUNCTION getMaxPrice(INTEGER) RETURNS NUMERIC AS
  	$$
  	DECLARE maxPrice NUMERIC;
  	BEGIN
	  	SELECT MAX(bidPrice) into maxPrice
	  	FROM Bids
	  	WHERE aid = $1;

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
	FOREIGN KEY (aid) REFERENCES Advertisements ON DELETE CASCADE,
	CONSTRAINT checkMaxBid
		CHECK (bidPrice > getMaxPrice(aid))
)`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let dropQuery = `
  DROP TABLE Bids;
  DROP FUNCTION getMaxPrice;
  `;
  return knex.raw(dropQuery);
};