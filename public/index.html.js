window.onload = function () {
    const passwordPlaceholder = "8-32; Upper/Lowercase; Number";//"Length between 8 and 32 characters, at least one Upper/Lowercase letter and one number";
    document.getElementById("password-signup").placeholder = passwordPlaceholder;
    document.getElementById("password-login").placeholder = passwordPlaceholder;
    document.getElementById("name-signup").placeholder = "Lowercase only";

    //Prevent form from submitting so we can use fetch
    document.getElementById("signup-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const displayName = document.getElementById("displayname-signup").value;
        const name = document.getElementById("name-signup").value;
        const email = document.getElementById("email-signup").value;
        const password = document.getElementById("password-signup").value;

        sendAccountData('/signup', {
            displayName: displayName,
            name: name,
            email: email,
            password: password
        });
    });

    document.getElementById("login-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email-login").value;
        const password = document.getElementById("password-login").value;

        sendAccountData('/login', {
            email: email,
            password: password
        });
    });
}

function showSignup() {
    document.getElementById("login-div").style.display = "none";
    document.getElementById("signup-div").style.display = "block";
    document.querySelector("a[onclick='showSignup()']").style.display = "none";
    document.querySelector("a[onclick='showLogin()']").style.display = "block";
    document.title = "Signup";
}

function showLogin() {
    document.getElementById("signup-div").style.display = "none";
    document.getElementById("login-div").style.display = "block";
    document.querySelector("a[onclick='showLogin()']").style.display = "none";
    document.querySelector("a[onclick='showSignup()']").style.display = "block";
    document.title = "Login";
}

function sendAccountData(url, body) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                window.location.href = "/dashboard";
            } else {
                //Rewrite this to some css magic
                alert(data.error);
            }
        });
}