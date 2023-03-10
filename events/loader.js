const express = require('express');
const session = require('express-session');
const mongoose = require("mongoose");
require('dotenv').config();

const secret = process.env.SESSION_SECRET || "keyboard_cat";

module.exports = function (app, port) {
    const connectDB = async () => {
        try {
            console.log("Connecting to database...");
            mongoose.connect(process.env.DATABASE_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                family: 4
            });
        } catch (err) {
            console.log(err.message);
        }
    }
    mongoose.set('strictQuery', false);
    connectDB();

    app.use(express.static('public', { extensions: ['html'] }));
    app.use(express.static('assets'));
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    }))

    mongoose.connection.once("open", () => {
        console.log("MongoDB database connection established successfully");
        app.listen(port, () => console.log(`Server listening on port ${port}`));
    });
}