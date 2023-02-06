const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./model/User');
const loadEvents = require('./events/loader');
const utils = require('./events/utils');

const app = express();
const port = process.env.PORT || 3000;

loadEvents(app, port);


app.get('/user/*', async (req, res) => {
    const requestedUser = await User.findOne({ name: req.params[0] }).exec();
    if (!requestedUser) return res.redirect('/404.html');

    req.session.extra_data = req.session.extra_data || {};

    req.session.extra_data.requestedUser = { displayName: requestedUser.displayName, name: requestedUser.name, email: requestedUser.email };

    res.sendFile(__dirname + '/public/user.html');
})

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email }).exec();
    if (!user) return res.json({ error: "Incorrect Email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ error: "Incorrect Email or password" });

    req.session.extra_data = { ownProfile: { displayName: user.displayName, name: user.name, email: user.email } };
    res.json({ success: "Logged in successfully" });
});

app.post("/signup", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const displayName = req.body.displayName;

    if (!utils.isValidId(name)) return res.json({ error: "Invalid Name" });
    if (!utils.isValidEmail(email)) return res.json({ error: "Invalid Email" });
    if (!utils.isValidPassword(password)) return res.json({ error: "Invalid Password" })
    if (utils.containsInvalidCharacters(name)) return res.json({ error: "Invalid Name" });

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

        req.session.extra_data = { ownProfile: { displayName: user.displayName, name: user.name, email: user.email } };
        res.json({ success: "User created successfully" });
    } catch (err) {
        console.error(err)
        res.json({ error: "Something went wrong" });
    }
});

app.post('/searchUser', async (req, res) => {
    const name = req.body.name;

    if(!name) return res.json({ error: "Please enter a name" });

    let users = await User.find({ $or: [{ name: { $regex: name, $options: 'i' } }, { displayName: { $regex: name, $options: 'i' } }] }).exec();

    users = users.map(user => {
        return { name: user.name, displayName: user.displayName }
    });

    res.json({ users, success: "Users found" });
})

app.post('/check_if_duplicate_name', async (req, res) => {
    const name = req.body.name;

    const user = await User.findOne({ name: name }).exec();
    if (user) return res.json({ error: "Name already exists" });
    res.json({ success: "Name is available" });
});

app.get('/get_extra_data', (req, res) => {
    res.json(req.session.extra_data);
})

//The 404 Route
app.get('*', function (req, res) {
    res.status(404).redirect('/404.html');
});