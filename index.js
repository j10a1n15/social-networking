const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
require('dotenv').config();
const User = require('./model/User');

const app = express();
const port = process.env.PORT || 3000;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log(err.message);
    }
}
mongoose.set('strictQuery', false);
connectDB();

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}))

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

    if(!isValidId(name)) return res.json({ error: "Invalid Display Name" });
    if (!isValidEmail(email)) return res.json({ error: "Invalid Email" });
    if (!isValidPassword(password)) return res.json({ error: "Invalid Password" })

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

mongoose.connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
    app.listen(port, () => console.log(`Server listening on port ${port}`));
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return password.length >= 8 && password.length <= 32 && /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/.test(password);
}

function isValidId(name) {
    return name.length >= 3 && name.length <= 32 && /^[a-z0-9]+$/.test(name)
}