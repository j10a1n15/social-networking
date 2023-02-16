const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const User = require('./model/User');
const loadEvents = require('./events/loader');
const utils = require('./events/utils');

const app = express();
const port = process.env.PORT || 3000;
const salt = parseInt(process.env.SALT) || 10;

loadEvents(app, port);


app.get('/user/*', async (req, res) => {
    const requestedUser = await User.findOne({ name: req.params[0] }).exec();
    if (!requestedUser) return res.redirect('/404.html');

    req.session.extra_data = req.session.extra_data || {};

    req.session.extra_data.requestedUser = { displayName: requestedUser.displayName, name: requestedUser.name, email: requestedUser.email, posts: requestedUser.posts, followers: requestedUser.followers, following: requestedUser.following };

    res.sendFile(__dirname + '/public/user.html');
})

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email }).exec();
    if (!user) return res.json({ error: "Incorrect Email or password" });
    const match = await bcrypt.compareSync(password, user.password);
    if (!match) return res.json({ error: "Incorrect Email or password" });

    req.session.extra_data = { ownProfile: { displayName: user.displayName, name: user.name, email: user.email, followers: user.followers, following: user.following } };
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
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            displayName: displayName,
            email: email,
            password: hashedPassword,
            name: name,
        });

        req.session.extra_data = { ownProfile: { displayName: user.displayName, name: user.name, email: user.email, followers: user.followers, following: user.following } };
        res.json({ success: "User created successfully" });
    } catch (err) {
        console.error(err)
        res.json({ error: "Something went wrong" });
    }
});

app.post('/searchUser', async (req, res) => {
    const name = req.body.name;

    if (!name) return res.json({ error: "Please enter a name" });

    let users = await User.find({ $or: [{ name: { $regex: name, $options: 'i' } }, { displayName: { $regex: name, $options: 'i' } }] }).exec();

    users = users.map(user => {
        return { name: user.name, displayName: user.displayName }
    });

    res.json({ users, success: "Users found" });
})

app.post('/createPost', async (req, res) => {
    const content = req.body.content;
    const user = await User.findOne({ name: req.session.extra_data.ownProfile.name });

    if (!content) return res.json({ error: "Please enter some content" });
    if (!user) return res.json({ error: "Please login" });

    const filter = { name: req.session.extra_data.ownProfile.name };
    const post = { id: uuidv4(), content: content, creationDate: Date.now(), comments: [], likes: [], dislikes: [] };

    try {
        User.findOneAndUpdate(filter, { $push: { posts: post } }, { new: true }, (err, doc) => {
            if (err) return res.json({ error: "Something went wrong" });
            res.json({ success: "Post created successfully" });
        });
    } catch (err) {
        console.error(err);
        res.json({ error: "Something went wrong" });
    };
});

app.post('/followUser', async (req, res) => {
    const user = await User.findOne({ name: req.session.extra_data.ownProfile.name });
    const userToFollow = await User.findOne({ name: req.session.extra_data.requestedUser.name });
    const type = req.body.type;

    if (!user) return res.json({ error: "Please login" });
    if (!userToFollow) return res.json({ error: "User not found" });
    if (!["follow", "unfollow"].includes(type)) return res.json({ error: "Invalid type" });
    if (user.name === userToFollow.name) return res.json({ error: "You can't follow yourself" });

    if (user.following.includes(userToFollow.name) && type === "follow") return res.json({ error: "You are already following this user" });
    if (!user.following.includes(userToFollow.name) && type === "unfollow") return res.json({ error: "You are not following this user" });

    if (type === "follow") {
        const filterFollowing = { name: req.session.extra_data.ownProfile.name };
        const updateFollowing = { $push: { following: userToFollow.name } };
        const filterFollowers = { name: req.session.extra_data.requestedUser.name };
        const updateFollowers = { $push: { followers: user.name } };

        try {
            User.findOneAndUpdate(filterFollowing, updateFollowing, { new: true }, (err, doc) => {
                if (err) return res.json({ error: "Something went wrong" });
            });

            User.findOneAndUpdate(filterFollowers, updateFollowers, { new: true }, (err, doc) => {
                if (err) return res.json({ error: "Something went wrong" });
            });

            res.json({ success: "User followed successfully" });
        } catch (err) {
            console.error(err);
            res.json({ error: "Something went wrong" });
        };
    } else if (type === "unfollow") {
        const filterFollowing = { name: req.session.extra_data.ownProfile.name };
        const updateFollowing = { $pull: { following: userToFollow.name } };
        const filterFollowers = { name: req.session.extra_data.requestedUser.name };
        const updateFollowers = { $pull: { followers: user.name } };

        try {
            User.findOneAndUpdate(filterFollowing, updateFollowing, { new: true }, (err, doc) => {
                if (err) return res.json({ error: "Something went wrong" });
            });

            User.findOneAndUpdate(filterFollowers, updateFollowers, { new: true }, (err, doc) => {
                if (err) return res.json({ error: "Something went wrong" });
            });

            res.json({ success: "User unfollowed successfully" });
        } catch (err) {
            console.error(err);
            res.json({ error: "Something went wrong" });
        };
    }
});


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