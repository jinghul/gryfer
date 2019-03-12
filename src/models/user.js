const environment = process.env.NODE_ENV || 'development';
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const config = require('../../config.json')
const Pool = require('pg').Pool
const pool = new Pool({
  user: config.username,
  host: 'localhost',
  database: config.api,
  password: config.password,
  port: 5432,
})

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

const signin = (request, response) => {
  const userReq = request.body
  findUser(userReq)
    .then(foundUser => {
      user = foundUser
      return checkPassword(userReq.password, foundUser)
    })
    .then((res) => createToken())
    .then(token => updateUserToken(token, user))
    .then(() => {
      delete user.password_digest
      response.status(200).json(user)
    })
    .catch((err) => console.error(err))
}

// don't forget to export!
module.exports = {
  signup,
  signin,
}

const hashPassword = (password, user) => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, 10, (err, hash) => {
      err ? reject(err) : resolve(hash)
    })
  )
}

const createUser = (user) => {
  let user1 = JSON.parse(JSON.stringify(user))
  pool.connect((err, client, done) => {
    const shouldAbort = (err) => {
      if (err) {
        console.error('Error in transaction', err.stack)
        client.query('ROLLBACK', (err) => {
          if (err) {
            console.error('Error rolling back client', err.stack)
          }
          // release the client back to the pool
          done()
        })
      }
      return !!err
    }


    client.query('BEGIN', (err) => {
      console.log(user1)
      if (shouldAbort(err))  {
        return
      }
      client.query('INSERT INTO Users (fname, lname, email) VALUES($1, $2, $3) RETURNING uid', [user1.fname, user1.lname, user1.email], (err, res) => {
        if (shouldAbort(err))  {
          return
        }
        const insertUserProfileText = "INSERT INTO UserProfile (username, uid, dateJoined) VALUES ($1, currval('users_uid_seq'), $2)"
        const insertUserProfileValues = [user1.username, new Date()]
        client.query(insertUserProfileText, insertUserProfileValues, (err, res) => {
          if (shouldAbort(err)) {
            return
          }
          const insertAccountText = "INSERT INTO Account (uid, password, userToken) VALUES (currval('users_uid_seq'), $1, $2)"
          const insertAccountValues = [user1.password_digest, user1.token]
          client.query(insertAccountText, insertAccountValues, (err, res) => {
            if (shouldAbort(err)) {
              return
            }
            client.query('COMMIT', (err) => {
              if (err) {
                console.error("Error committing transaction", err.stack)
              }
              done()
            })
          })
        })
      })
    })
  })
  return user
}

const createToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, data) => {
      err ? reject(err) : resolve(data.toString('base64'))
    })
  })
}

const findUser = (userReq) => {
  return pool.query("SELECT * FROM Account NATURAL JOIN Users NATURAL JOIN UserProfile WHERE UserProfile.username = $1", [userReq.username])
  .then((results) => results.rows[0])
  .catch((error) => console.error(error.stack))
}


const checkPassword = (reqPassword, foundUser) => {
  return new Promise((resolve, reject) =>
    bcrypt.compare(reqPassword, foundUser.password, (err, response) => {
        if (err) {
          reject(err)
        }
        else if (response) {
          resolve(response)
        } else {
          reject(new Error('Passwords do not match.'))
        }
    })
  )
}

const updateUserToken = (token, user) => {
  return pool.query("UPDATE Account SET userToken = $1 WHERE uid = $2 RETURNING uid, username, userToken", [token, user.uid], (error, results) => {
    return results.rows[0]
  })
}


