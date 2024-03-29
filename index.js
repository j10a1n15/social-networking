const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const User = require('./model/User');
const loadEvents = require('./events/loader');
const utils = require('./events/utils');
const flairs = require("./config/flairs.json");

const app = express();
const port = process.env.PORT || 3000;
const salt = parseInt(process.env.SALT) || 10;


loadEvents(app, port);

//Change Username
app.post('/change_username', async (req, res) => {
    const newusername = req.body.newusername;

    if (newusername.length == 0) return res.json({ error: "Username cannot be empty" });

    if (!utils.isValidId(newusername)) return res.json({ error: "Invalid Name" });
    if (utils.containsInvalidCharacters(newusername)) return res.json({ error: "Invalid Name" });

    const user = await User.findOne({ name: newusername }).exec();
    if (user) return res.json({ error: "Username already taken" });

    User.findOneAndUpdate({ uuid: req.session.extra_data.ownProfile.uuid }, { name: newusername }, (err, doc) => {
        if (err) return res.json({ error: "Something went wrong" });
    });

    res.json({ success: "Username changed successfully" });
});

//Change Displayname
app.post('/change_displayname', async (req, res) => {
    const newdisplayname = req.body.newdisplayname;

    if (newdisplayname.length == 0) return res.json({ error: "Displayname cannot be empty" });

    User.findOneAndUpdate({ uuid: req.session.extra_data.ownProfile.uuid }, { displayName: newdisplayname }, (err, doc) => {
        if (err) return res.json({ error: "Something went wrong" });
    });

    res.json({ success: "Displayname changed successfully" });
});

//Change Email
app.post('/change_email', async (req, res) => {
    const oldemail = req.body.oldemail;
    const newemail = req.body.newemail;
    const user = await User.findOne({ uuid: req.session.extra_data.ownProfile.uuid }).exec();

    if (newemail.length == 0) return res.json({ error: "Email cannot be empty" });

    if (!utils.isValidEmail(newemail)) return res.json({ error: "Invalid Email" });

    if (user.email != oldemail) return res.json({ error: "Incorrect email" });

    User.findOneAndUpdate({ uuid: req.session.extra_data.ownProfile.uuid }, { email: newemail }, (err, doc) => {
        if (err) return res.json({ error: "Something went wrong" });
    });

    res.json({ success: "Email changed successfully" });
});

//Change Password
app.post('/change_password', async (req, res) => {
    const oldpw = req.body.oldpw;
    const newpw = req.body.newpw;
    const user = await User.findOne({ uuid: req.session.extra_data.ownProfile.uuid }).exec();

    if (newpw.length == 0) return res.json({ error: "Password cannot be empty" });

    if (!utils.isValidPassword(newpw)) return res.json({ error: "Invalid Password" })

    const match = bcrypt.compareSync(oldpw, user.password);
    if (!match) return res.json({ error: "Incorrect password" });

    const hashedPassword = await bcrypt.hash(newpw, salt);
    User.findOneAndUpdate({ uuid: req.session.extra_data.ownProfile.uuid }, { password: hashedPassword }, (err, doc) => {
        if (err) return res.json({ error: "Something went wrong" });
    });

    res.json({ success: "Password changed successfully" });
});

//Logout
app.post('/logout', (req, res) => {
    res.json({ success: "Logged out successfully" });
    req.session.destroy();
});

//View User Page
app.get('/user/*', async (req, res) => {
    const requestedUser = await User.findOne({ name: req.params[0] }).exec();
    if (!requestedUser) return res.redirect('/404.html');

    req.session.extra_data = req.session.extra_data || {};

    req.session.extra_data.requestedUser = { displayName: requestedUser.displayName, name: requestedUser.name, posts: requestedUser.posts, followers: requestedUser.followers, following: requestedUser.following, creationDate: requestedUser.creationDate, uuid: requestedUser.uuid };

    res.sendFile(__dirname + '/public/user.html');
})

//Login
app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email }).exec();
    if (!user) return res.json({ error: "Incorrect Email or password" });
    const match = await bcrypt.compareSync(password, user.password);
    if (!match) return res.json({ error: "Incorrect Email or password" });

    if (!user.uuid) {
        const uuid = uuidv4();
        User.findOneAndUpdate({ email: email }, { uuid: uuid }, (err, doc) => {
            if (err) return res.json({ error: "Something went wrong" });
        });
        user.uuid = uuid;
    }

    req.session.extra_data = { ownProfile: { displayName: user.displayName, name: user.name, uuid: user.uuid } };
    res.json({ success: "Logged in successfully" });
});

//Signup
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
        const uuid = uuidv4();
        const user = await User.create({
            uuid: uuid,
            displayName: displayName,
            email: email,
            password: hashedPassword,
            name: name,
        });

        req.session.extra_data = { ownProfile: { displayName: user.displayName, name: user.name, uuid: uuid } };
        res.json({ success: "User created successfully" });
    } catch (err) {
        console.error(err)
        res.json({ error: "Something went wrong" });
    }
});

//Search User
app.post('/searchUser', async (req, res) => {
    const name = req.body.name;

    if (!name) return res.json({ error: "Please enter a name" });

    let users = await User.find({ $or: [{ name: { $regex: name, $options: 'i' } }, { displayName: { $regex: name, $options: 'i' } }] }).exec();

    users = users.map(user => {
        return { name: user.name, displayName: user.displayName }
    });

    res.json({ users, success: "Users found" });
})

//Create Post
app.post('/createPost', async (req, res) => {
    const content = req.body.content;
    const flair = req.body.flair || null;
    const user = await User.findOne({ name: req.session.extra_data.ownProfile.name });

    if (!content) return res.json({ error: "Please enter some content" });
    if (!user) return res.json({ error: "Please login" });

    const filter = { name: req.session.extra_data.ownProfile.name };
    const post = { id: uuidv4(), content: content, flair: flair || null, creationDate: Date.now(), comments: [], likes: [], dislikes: [] };

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

//Follow
app.post('/followUser', async (req, res) => {
    const user = await User.findOne({ uuid: req.session.extra_data.ownProfile.uuid });
    const userToFollow = await User.findOne({ uuid: req.session.extra_data.requestedUser.uuid });
    const type = req.body.type;

    if (!user) return res.json({ error: "Please login" });
    if (!userToFollow) return res.json({ error: "User not found" });
    if (!["follow", "unfollow"].includes(type)) return res.json({ error: "Invalid type" });
    if (user.name === userToFollow.name) return res.json({ error: "You can't follow yourself" });

    if (user.following.includes(userToFollow.uuid) && type === "follow") return res.json({ error: "You are already following this user" });
    if (!user.following.includes(userToFollow.uuid) && type === "unfollow") return res.json({ error: "You are not following this user" });

    if (type === "follow") {
        const filterFollowing = { uuid: req.session.extra_data.ownProfile.uuid };
        const updateFollowing = { $push: { following: userToFollow.uuid } };
        const filterFollowers = { uuid: req.session.extra_data.requestedUser.uuid };
        const updateFollowers = { $push: { followers: user.uuid } };

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
        const filterFollowing = { uuid: req.session.extra_data.ownProfile.uuid };
        const updateFollowing = { $pull: { following: userToFollow.uuid } };
        const filterFollowers = { uuid: req.session.extra_data.requestedUser.uuid };
        const updateFollowers = { $pull: { followers: user.uuid } };

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

//Like Post
app.post('/likePost', async (req, res) => {
    const user = await User.findOne({ uuid: req.session.extra_data.ownProfile.uuid });
    const userOfPost = await User.findOne({ uuid: req.session.extra_data.requestedUser.uuid });

    const postId = req.body.id;
    const type = req.body.type;
    const post = userOfPost.posts.find(post => post.id === postId);

    if (!user) return res.json({ error: "Please login" });
    if (!userOfPost) return res.json({ error: "User not found" });
    if (!post) return res.json({ error: "Post not found" });
    if (!["like", "unlike"].includes(type)) return res.json({ error: "Invalid type" });

    if (post.likes.includes(user.uuid) && type === "like") return res.json({ error: "You already liked this post" });
    if (post.dislikes.includes(user.uuid) && type === "unlike") return res.json({ error: "You already unliked this post" });

    if (type === "like") {
        const filter = { uuid: req.session.extra_data.requestedUser.uuid, "posts.id": postId };
        const update = { $push: { "posts.$.likes": user.uuid } };
        User.findOneAndUpdate(filter, update, { new: true }, (err, doc) => {
            if (err) return res.json({ error: "Something went wrong" });
            res.json({ success: "Post liked successfully" });
        });
    } else if (type === "unlike") {
        const filter = { uuid: req.session.extra_data.requestedUser.uuid, "posts.id": postId };
        const update = { $pull: { "posts.$.likes": user.uuid } };
        User.findOneAndUpdate(filter, update, { new: true }, (err, doc) => {
            if (err) return res.json({ error: "Something went wrong" });
            res.json({ success: "Post unliked successfully" });
        });
    }
});

//Flairs
app.get('/getFlairs', async (req, res) => {
    res.json(flairs)
});

//Check if duplicate name
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