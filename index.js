const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
});

app.post("signup", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});