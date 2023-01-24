const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./model/User');
const loadEvents = require('./events/loader');
const utils = require('./events/utils');

const app = express();
const port = process.env.PORT || 3000;

loadEvents(app, port);


app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email }).exec();
    if (!user) return res.json({ error: "Incorrect Email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ error: "Incorrect Email or password" });

    req.session.extra_data = { displayName: user.displayName, name: user.name, email: user.email };
    res.json({ success: "Logged in successfully" });
});

app.post("/signup", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const displayName = req.body.displayName;

    if(!utils.isValidId(name)) return res.json({ error: "Invalid Display Name" });
    if (!utils.isValidEmail(email)) return res.json({ error: "Invalid Email" });
    if (!utils.isValidPassword(password)) return res.json({ error: "Invalid Password" })

    const duplicateEmail = await User.findOne({ email: email }).exec();
    if (duplicateEmail) return res.json({ error: "Email already exists" });
    const duplicateName = await User.findOne({ name: name }).exec();
    if (duplicateName) return res.json({ error: "Name already exists" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            displayName: displayName,
            email: email,
            password: hashedPassword,
            name: name,
        });

        req.session.extra_data = { displayName: user.displayName, name: user.name, email: user.email };
        res.json({ success: "User created successfully" });
    } catch (err) {
        console.error(err)
        res.json({ error: "Something went wrong" });
    }
});

app.get('/get_extra_data', (req, res) => {
    res.json(req.session.extra_data);
})