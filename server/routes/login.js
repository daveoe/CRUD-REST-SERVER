const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); // Encrypt the password
const jwt = require('jsonwebtoken'); // JSON Web Token 
const {OAuth2Client} = require('google-auth-library'); // Google Authentication Library
const client = new OAuth2Client(process.env.CLIENT_ID); // Google Client
const User = require('../models/user');



app.post('/login', (req, res) => {

    let body = req.body;

    // Login
    User.findOne({email: body.email}, (err, userDB) => {

        // If there's a server error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // If the user doesn't exist
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(User) or password is incorrect'
                }
            });
        }

        // Compares the password the user puts with the password from the DataBase
        if (!bcrypt.compareSync(body.password, userDB.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'User or (password) is incorrect'
                }
            });
        }

        let token = jwt.sign({
            user: userDB 
        }, process.env.SEED, {expiresIn: process.env.EXP_TOKEN})

        res.json({
            ok: true,
            user: userDB,
            token
        });

    });

})


// Google Configurations
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

        return {
            name: payload.name,
            email: payload.email,
            img: payload.picture,
            google: true
        }
  }

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
            ok: false,
            err: e
            });
        });

    User.findOne({email: googleUser.email}, (err, userDB) => {

        // If there's a server error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (userDB) {
            // If it exist but didn't authenticate with google
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'You must use your normal authentication'
                    }
                });
            // If it exist and it did authenticate with google
            } else {
                // Renewing Token
                let token = jwt.sign({
                    user: userDB 
                }, process.env.SEED, {expiresIn: process.env.EXP_TOKEN});

                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });
            }
        // If is the first time the user is authenticating
        } else {
            let user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            // Save on the Data Base
            user.save((err, userDB) => {
                 // If there's a server error
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                // Generating new Token
                let token = jwt.sign({
                    user: userDB 
                }, process.env.SEED, {expiresIn: process.env.EXP_TOKEN});

                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });

            });
        }

    })

    // res.json({
    //     user: googleUser
    // });

})


module.exports = app;