const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); // Encrypt the password
const jwt = require('jsonwebtoken'); // JSON Web Token 
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


module.exports = app;