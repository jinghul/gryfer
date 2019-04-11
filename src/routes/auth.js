const bcrypt = require('bcrypt')
const crypto = require('crypto')
const config = require('../../config.json')
const pg = require('pg')

// DB Connection
const pool = new pg.Pool({
    Advertisement: config.Advertisementname,
    user: config.username,
    database: config.api,
    password: config.password,
    host: config.host,
    port: config.port,
})

const express = require('express')
var router = express.Router()

router.get('/', (request, response) => {
    response.redirect('auth/signin')
})

// Render Sign-in page
router.get('/signin', (request, response) => {
    console.log(request.session.uid)
    if (request.session.uid != undefined) {
        if (request.session.mode) {
            response.redirect('../../make')
        } else {
            response.redirect('../../search')
        }
    } else {
        response.render('signin', { title: 'Sign In' })
    }
})

// Render rider registration page
router.get('/register/ride', (request, response) => {
    if (request.session.uid != undefined) {
        if (request.session.canride) {
            response.redirect('../../search')
        } else {
            response.render('register', {
                title: 'Start Riding',
                page: 'Ride',
                username: request.session.username,
                email: request.session.email,
                fname: request.session.fname,
                lname: request.session.lname,
                driver: request.session.mode,
                switchable: request.session.switchable
            })
        }
    } else {
        response.render('register', { title: 'Start Riding', page: 'Ride' })
    }
})

// Render driver registration page
router.get('/register/drive', (request, response) => {
    if (request.session.uid != undefined) {
        if (request.session.candrive) {
            response.redirect('../../make')
        } else {
            response.render('register', {
                title: 'Start Riding',
                page: 'Drive',
                drive: true,
                username: request.session.username,
                email: request.session.email,
                fname: request.session.fname,
                lname: request.session.lname,
                driver: request.session.mode,
                switchable: request.session.switchable
            })
        }
    } else {
        response.render('register', {
            title: 'Start Driving',
            page: 'Drive',
            drive: true,
        })
    }
})

router.post('/switch', (request, response) => {
    if (request.session.switchable) {
        pool.query('UPDATE Accounts SET mode = $1 where uid = $2', [!request.session.mode, request.session.uid])
        .then(() => {
            request.session.mode = !request.session.mode
            response.status(200).send('Switched.').end()
        })
    } else {
        response.status(401).send('Not switchable.').end()
    }
})

// Register new user
router.post('/register', (request, response) => {
    const user = request.body
    user.driver = (user.driver == 'true')

    if (request.session.uid !== undefined) {
        insertRole(user, request.session.uid).then(() => {
            return pool.query('UPDATE Accounts SET mode = $1 where uid = $2', [user.driver, request.session.uid])
        }).then(() => {
            if (user.driver) {
                request.session.candrive = true
                console.log("can drive")
            } else {
                request.session.canride = true
                console.log("can ride")
            }

            request.session.switchable = true
            request.session.mode = user.driver
            response.status(201).json(user)
        }).catch((err) => {
            console.log(err)
            response.status(500).end()
        })
    } else if (user.username == '' || user.password == '') {
        response.status(400).send('Missing required fields.').end()
    } else {
        hashPassword(user.password)
        .then(hashedPassword => {
            delete user.password
            user.password_digest = hashedPassword
        })
        .then(createToken())
        .then(token => {
                (user.token = token)
        })
        .then(() => {
            try {
                return createUser(user)
            } catch (err) {
                console.log('caught createuser error!!')
                reject(err)
            }
        })
        .then(user => {
            delete user.password_digest

            if (user.driver) {
                request.session.candrive = true
                console.log("can drive")
            } else {
                request.session.canride = true
                console.log("can ride")
            }

            request.session.uid = user.uid
            request.session.username = user.username
            request.session.mode = user.driver
            request.session.fname = user.fname
            request.session.lname = user.lname
            request.session.email = user.email
            request.session.switchable = false

            response.status(201).json(user)
        })
        .catch(err => {
            console.log(err)
            response.status(400).end()
        })
    }
})

const insertRole = async (user, uid) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        if (user.driver) {
            var result = await client.query('INSERT INTO Cars (make, model, modelYear, maxPassengers) VALUES ($1, $2, $3, $4) RETURNING cid', [user.make, user.model, user.year, user.maxPassengers])
            cid = result.rows[0].cid
            await client.query("INSERT INTO drivers (uid, license) VALUES ($1, $2, $3)", [uid, user.license])
            await client.query('INSERT INTO CarProfiles (uid, cid, licensePlate) VALUES ($1, $2, $3)', [uid, cid, user.carlicense])
        } else {
            await client.query("INSERT INTO passengers (uid) VALUES (#1, $2)", [uid])
        }
        await client.query('COMMIT')
    } catch (err) {
        await client.query('ROLLBACK')
        console.log("rollback: " + err)
        throw err
    } finally {
        client.release()
    }
}

const createUser = async (user) => {
    let user1 = JSON.parse(JSON.stringify(user))
    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        var result = await client.query('INSERT INTO Users (fname, lname, email) VALUES($1, $2, $3) RETURNING uid', [user1.fname, user1.lname, user1.email])
        console.log('user: ' + JSON.stringify(user))
        // save user.uid to return
        user1.uid = result.rows[0].uid

        await client.query("INSERT INTO UserProfiles (username, uid, dateJoined) VALUES ($1, currval('users_uid_seq'), $2)", [user1.username, new Date()])
        await client.query("INSERT INTO Accounts (uid, passwordHash, userToken, mode) VALUES (currval('users_uid_seq'), $1, $2, $3)", [user1.password_digest, user1.token, user1.driver])
        
        console.log(user1.driver)
        if (user1.driver) {
            result  = await client.query('INSERT INTO Cars (make, model, modelYear, maxPassengers) VALUES ($1, $2, $3, $4) RETURNING cid', [user.make, user.model, user.year, user.maxPassengers])
            cid = result.rows[0].cid
            await client.query("INSERT INTO drivers (uid, tripsDriven, license) VALUES (currval('users_uid_seq'), $1, $2)", [user1.uid, 0, user.license])
            await client.query('INSERT INTO CarProfiles (uid, cid, licensePlate) VALUES ($1, $2, $3)', [user1.uid, cid, user.carlicense])
        } else {
            await client.query("INSERT INTO passengers (uid, tripsTaken) VALUES (currval('users_uid_seq'), $1)", [0])
        }
        await client.query('COMMIT')
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
        return user1
    }
}

router.post('/signin', (request, response) => {
    const userReq = request.body

    if (userReq.username == undefined) {
        response.status(400).end()
        return
    }

    findUser(userReq)
        .then(foundUser => {
            console.log(foundUser)
            user = foundUser
            return checkPassword(userReq.password, foundUser)
        })
        .then(() => createToken())
        .then(token => updateUserToken(token, user))
        .then(() => {
            delete user.password_digest

            // keep details in session
            request.session.uid = user.uid
            request.session.username = user.username
            console.log(user.mode);
            request.session.mode = user.mode // false = rider, true = driver
            request.session.fname = user.fname
            request.session.lname = user.lname
            request.session.email = user.email

            pool.query('SELECT * FROM drivers where uid = $1', [
                request.session.uid,
            ]).then(results => {
                if (results.rowCount != 0) {
                    request.session.candrive = true
                    console.log('can drive')
                }

                pool.query('SELECT * FROM passengers where uid = $1', [
                    request.session.uid,
                ]).then(results => {
                    if (results.rowCount != 0) {
                        request.session.canride = true
                        console.log('can ride')
                    }
                    request.session.switchable = request.session.canride && request.session.candrive
                    response.status(200).json(user)
                })
            })
        })
        .catch(err => {
            console.log(err)
            response.status(401).end()
        })
})

router.post('/signout', (request, response) => {
    request.session.destroy()
    response.status(200).end()
})

const hashPassword = (password, user) => {
    return new Promise((resolve, reject) =>
        bcrypt.hash(password, 10, (err, hash) => {
            err ? reject(err) : resolve(hash)
        })
    )
}

const createToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, data) => {
            err ? reject(err) : resolve(data.toString('base64'))
        })
    })
}

const findUser = userReq => {
    return pool
        .query(
            'SELECT * FROM Accounts NATURAL JOIN Users NATURAL JOIN UserProfiles WHERE UserProfiles.username = $1',
            [userReq.username]
        )
        .then(results => results.rows[0])
        .catch(error => console.error(error.stack))
}

const checkPassword = (reqPassword, foundUser) => {
    return new Promise((resolve, reject) => {
        if (foundUser == undefined) {
            reject(new Error('Undefined user'))
        }
        bcrypt.compare(reqPassword, foundUser.password, (err, response) => {
            if (err) {
                reject(err)
            } else if (response) {
                resolve(response)
            } else {
                reject(new Error('Passwords do not match.'))
            }
        })
    })
}

const updateUserToken = (token, user) => {
    return pool
        .query(
            'UPDATE Accounts SET userToken = $1 WHERE uid = $2 RETURNING uid, userToken',
            [token, user.uid]
        )
        .then(results => results.rows[0])
        .catch(error => console.error(error.stack))
}

module.exports = router
