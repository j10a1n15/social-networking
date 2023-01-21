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

    req.session.extra_data = { email: email, password: password };
    res.redirect('/dashboard.html');
});

app.post("/signup", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const duplicate = await User.findOne({ email: email }).exec();
    if(duplicate) return res.sendStatus(409);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: email,
            password: hashedPassword,
            name: name,
        });

        console.log(user)

        res.sendStatus(201)
    } catch(err) {
        console.error(err)
        res.sendStatus(500)
    }
});

app.get('/get_extra_data', (req, res) => {
    res.json(req.session.extra_data);
})

mongoose.connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
    app.listen(port, () => console.log(`Server listening on port ${port}`));
});