const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}))

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // do something with the form data, like checking the email and password against a database
    // if the email and password match, set up a session and redirect the user to the dashboard
    // if the email and password don't match, redirect the user back to the login page

    req.session.extra_data = { email: email, password: password };
    res.redirect('/dashboard.html');
});

app.post("/signup", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
});

app.get('/get_extra_data', (req, res) => {
    console.log(req.session.extra_data)
    res.json(req.session.extra_data);
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});