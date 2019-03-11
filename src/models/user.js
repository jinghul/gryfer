const environment = process.env.NODE_ENV || 'development';    
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);
const knex = require('knex')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const signup = (request, response) => {
  const user = request.body
  hashPassword(user.password)
    .then((hashedPassword) => {
      delete user.password
      user.password_digest = hashedPassword
    })
    .then(() => createToken())
    .then(token => user.token = token)
    .then(() => createUser(user))
    .then(user => {
      delete user.password_digest
      response.status(201).json({ user })
    })
    .catch((err) => console.error(err))
}

// don't forget to export!
module.exports = {
  signup,
}

const hashPassword = (password) => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, 10, (err, hash) => {
      err ? reject(err) : resolve(hash)
    })
  )
}

const createUser = (user) => {
  console.log(user)
  try {
    var t = database.transaction()
    try {
      database("Users")
        .transacting(t)
        .insert({fname: user.fname, lname: user.lname})
      database('UserProfile')
          .insert({username: user.username, uid: 1, dateJoined: new Date()})
      database('Account')
          .insert({uid: 1, password: user.password_digest, userToken: user.userToken})
      t.commit()
    }
    catch (e) {
      t.rollback()
      throw e
    }
  }
  catch (e) {
    throw e
  }
  // return database.transaction(function(t) {
  //   return database('Users')
  //   .transacting(t)
  //   .insert({fname: user.fname, lname: user.lname})
  //   .then(function() {
  //     return database('UserProfile')
  //         .insert({username: user.username, uid: 1, dateJoined: new Date()})
  //         .then (function() {
  //           return database('Account')
  //               .insert({uid: 1, password: user.password_digest, userToken: user.userToken})
  //         })
  //   })
  //   .then(t.commit)
  //   .catch(function (e) {
  //     t.rollback();
  //     throw e;
  //   })
  // })
  // .then((data) => data.rows[0])
  // .catch(function(e) {
  //   throw e;
  // })
  
  // database.raw(
  //   "BEGIN; \
  //    INSERT INTO Users (fname, lname) VALUES ('" + user.fname + "', '" + user.lname + "'); \
  //    INSERT INTO UserProfile (username, uid, dateJoined) VALUES ('" + user.username + "', currval(pg_get_serial_sequence('Users', 'uid')), ?); \
  //    INSERT INTO Account (uid, password, userToken) VALUES (currval(pg_get_serial_sequence('Users', 'uid')), '" + user.password_digest  + "', '" + user.userToken + "') RETURNING uid, userToken; \
  //    COMMIT; \
  //   ",
  //    [new Date()]
  // )
  // .then((data) => data.rows[0])
}

const createToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, data) => {
      err ? reject(err) : resolve(data.toString('base64'))
    })
  })
}


