window.onload = function () {
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
    

    /*name req*/
    const name = document.getElementById("name-signup");
    const nameReq = document.getElementById("nameReq");

    name.onfocus = function () {
        nameReq.style.display = "block";
    }

    name.onblur = function () {
        nameReq.style.display = "none";
    }

    name.onkeyup = function () {
        name.value = name.value.replace(/[^a-z ]/g, "");
    }

    /*email req*/
    const email = document.getElementById("email-signup");
    const emailReq = document.getElementById("emailReq");
    const emailP = document.getElementById("emailFormat");

    email.onfocus = function () {
        emailReq.style.display = "block";
    }

    email.onblur = function () {
        emailReq.style.display = "none";
    }

    email.onkeyup = function () {
        if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            emailP.classList.remove("invalid");
            emailP.classList.add("valid");
        } else {
            emailP.classList.remove("valid");
            emailP.classList.add("invalid");
        }
    }


    /*password req*/
    const input = document.getElementById("password-signup");
    const letter = document.getElementById("letter");
    const capital = document.getElementById("capital");
    const number = document.getElementById("number");
    const length = document.getElementById("length");
    const message = document.getElementById("passwordReq");

    input.onfocus = function () {
        message.style.display = "block";
    }

    input.onblur = function () {
        message.style.display = "none";
    }

    // When the user starts to type something inside the password field
    input.onkeyup = function () {
        // Validate lowercase letters
        var lowerCaseLetters = /[a-z]/g;
        if (input.value.match(lowerCaseLetters)) {
            letter.classList.remove("invalid");
            letter.classList.add("valid");
        } else {
            letter.classList.remove("valid");
            letter.classList.add("invalid");
        }

        // Validate capital letters
        var upperCaseLetters = /[A-Z]/g;
        if (input.value.match(upperCaseLetters)) {
            capital.classList.remove("invalid");
            capital.classList.add("valid");
        } else {
            capital.classList.remove("valid");
            capital.classList.add("invalid");
        }

        // Validate numbers
        var numbers = /[0-9]/g;
        if (input.value.match(numbers)) {
            number.classList.remove("invalid");
            number.classList.add("valid");
        } else {
            number.classList.remove("valid");
            number.classList.add("invalid");
        }

        // Validate length
        if (input.value.length >= 8) {
            length.classList.remove("invalid");
            length.classList.add("valid");
        } else {
            length.classList.remove("valid");
            length.classList.add("invalid");
        }
    }
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