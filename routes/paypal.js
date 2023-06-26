"use strict";

const express = require('express');
const router = express.Router();
const ipn = require('paypal-ipn');
const EntriesModel = require("../models/entries");
const ClassesModel = require('../models/classes');
const ShowModel = require('../models/shows');
const nodemailer = require('nodemailer');
const sendmailTransport = require('nodemailer-sendmail-transport');

const transporter = nodemailer.createTransport({
    host: '176.58.104.35',
    secure: false,
    auth: {
        user: 'registrations@hedgehogregistry.co.uk',
        pass: 'ukclubregistry1'
    },
    tls: {
        rejectUnauthorized: false
    }
});

router.post('/ipn', (req, res) => {
    console.log("test22");
   res.sendStatus(200);

    console.log("test66");
    

    const { 
        payment_status: paymentStatus = "failed",
        custom: entryID = null
    } = req.body;

    const entries = new EntriesModel(res.db);
    const classes = new ClassesModel(res.db);
    const shows = new ShowModel(res.db);

    classes.get()

    new Promise((resolve, reject) => { // Promisify ipn.verify
        ipn.verify(req.body, (err, msg) => {
            if(err) {
                return reject(err);
            }

            return resolve(msg);
        });
    }).then(() =>  // Get entry
        new Promise((resolve, reject) => {
            entries.update(entryID, {paymentStatus}, (err, body) => { // Update entry with payment status
                if(err) {
                    return reject(err);
                }
                
                return resolve(body);
            });
        })
    ).then((entry) => // Get class
        new Promise((resolve, reject) => {
            classes.get(entry.classID, (err, body) => {
                if(err) {
                    return reject(err);
                }

                return resolve({
                    entry,
                    class: body
                });
            });
        })
    ).then(({entry, class: clas}) =>  // Get show
        new Promise((resolve, reject) => {
            shows.get(clas.showID, (err, body) => {
                if(err){
                    return reject(err);
                }

                return resolve({
                    entry,
                    clas,
                    show: body
                });
            });
        })
    ).then(({
        entry: {
            hog: { name: hogName },
            owner: {
                name: ownerName,
                email
            }
        },
        clas: {
            className
        },
        show: {
            location,
            time
        }
    }) => {
        if(paymentStatus == "Complete") {
            let emailText = `Dear ${ownerName},\n\nThankyou for entering ${hogName} in ${className} class in the show. It will be held at ${location} at ${time}\n\nThankyou,\nAfrican Pygmy Hedgehog Club`;

            return new Promise((resolve, reject) => { // Wrap sendmail in Promise api
                transporter.sendMail({
                    from: `"${ownerName}"<${email}>`,
                    to: 'registrations@hedgehogregistry.co.uk',
                    subject: 'Hedgehog Registration',
                    text: emailText,
                }, (err) => {
                    if(err){
                        return reject(new Error(err));
                    }

                    return resolve(true);
                });
            });
        }
    }).catch((err) => console.error(err));
});

module.exports = router;
