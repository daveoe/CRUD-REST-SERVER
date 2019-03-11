const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); // Encrypt the password
const _ = require('underscore');
const User = require('../models/user');
const {verifyToken, verifyAdmin_Role} = require('../middlewares/authentication');


// GET
app.get('/user', verifyToken, (req, res) => {

    let from = req.query.from || 0;
    from = Number(from); // This is going to transform it into a Number

    let limit = req.query.limit || 5;
    limit =  Number(limit);
    
                  // You can filter which fields you want
    User.find({status: true}, 'name email role status google img')       // Gets all the users
        .skip(from)     // Skips from when you want the users. ex: {{url}}/user?from=Insert Number
        .limit(limit)   // Brings a limit number of users. ex: {{url}}/user?limit=Insert Number
        .exec((err, users) => { // You can combine the Search using &. ex: {{url}}/user?limit=5&from=10

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.count({status: true}, (err, count) => {
                
                // This is what you return to the JSON
                res.json({
                    ok: true,
                    users,
                    count
                });

            });

        })

})


// POST is use to create new registers
app.post('/user', [verifyToken, verifyAdmin_Role], (req, res) => {

    let body = req.body

    // User Schema
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // Save on the Data Base
    user.save((err, userDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });

    });

})


// PUT is use to update registers
app.put('/user/:id', [verifyToken, verifyAdmin_Role], (req, res) => {

    let id = req.params.id;
    // Using _ you can filter which properties you allow the user to update
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'status']);

    // new: true, returns the modified document
    User.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, userDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            user: userDB
        });

    })

})


// DELETE
app.delete('/user/:id', [verifyToken, verifyAdmin_Role], (req, res) => {

    let id = req.params.id;

    // Physically deleting data from the Data Base is not use anymore
    // User.findByIdAndRemove(id, (err, userDeleted) => {

    let changeStatus = {
        status: false
    }

    // Nowadays we change the status of the object to false if it's deleted, that way we can keep the Data
    User.findByIdAndUpdate(id, changeStatus, {new: true}, (err, userDeleted) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // If it doesn't exist
        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'User not found'
                }
            });
        }

        res.json({
            ok: true,
            user: userDeleted
        });

    });

})


module.exports = app;