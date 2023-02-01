window.onload = function () {
    //Prevent form from submitting so we can use fetch
    document.getElementById("signup-form").addEventListener("submit", async function (event) {
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
        }).then(function (data) {
            if (data.success) {
                window.location.href = "/home";
            } else {
                alert(data.message)
            }
        });
    });

    document.getElementById("login-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        document.getElementById("login-error").style = "display: none;";

        const email = document.getElementById("email-login").value;
        const password = document.getElementById("password-login").value;

        sendAccountData('/login', {
            email: email,
            password: password
        }).then(function (data) {
            if (data.success) {
                window.location.href = "/home";
            } else {
                document.getElementById("login-error").style = "display: block;";
            }
        });
    });


    /*name req*/
    const nameReqInput = document.getElementById("name-signup");
    const nameReqP = document.getElementById("nameReq");

    nameReqInput.onfocus = function () {
        nameReqP.style.display = "block";
    }

    nameReqInput.onblur = async function () {
        nameReqP.style.display = "none";

        sendAccountData('/check_if_duplicate_name', {
            name: nameReqInput.value
        }).then(function (data) {
            if (data.success) {
                nameReqInput.classList.remove("invalidBox");
            } else {
                nameReqInput.classList.add("invalidBox");
            }
        });
    }

    name.onkeyup = function () {
        name.value = name.value.replace(/[A-Z ]/g, "");
    }

    /*email req*/
    const emailReqInput = document.getElementById("email-signup");
    const emailReqText = document.getElementById("emailReq");
    const emailReqP = document.getElementById("emailFormat");

    emailReqInput.onfocus = function () {
        emailReqText.style.display = "block";
    }

    emailReqInput.onblur = function () {
        emailReqText.style.display = "none";
    }

    emailReqInput.onkeyup = function () {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailReqInput.value)) {
            emailReqP.classList.remove("invalid");
            emailReqP.classList.add("valid");
            emailReqInput.classList.remove("invalidBox");
        } else {
            emailReqP.classList.remove("valid");
            emailReqP.classList.add("invalid");
            emailReqInput.classList.add("invalidBox");
        }
    }


    /*password req*/
    const passwordReqInput = document.getElementById("password-signup");
    const passwordReqLower = document.getElementById("lower");
    const passwordReqCapital = document.getElementById("capital");
    const passwordReqNumb = document.getElementById("number");
    const passwordReqLength = document.getElementById("length");
    const passwordReqP = document.getElementById("passwordReq");

    passwordReqInput.onfocus = function () {
        passwordReqP.style.display = "block";
    }

    passwordReqInput.onblur = function () {
        passwordReqP.style.display = "none";
    }

    // When the user starts to type something inside the password field
    passwordReqInput.onkeyup = function () {
        // Validate lowercase letters
        var lowerCaseLetters = /[a-z]/g;
        if (passwordReqInput.value.match(lowerCaseLetters)) {
            passwordReqLower.classList.remove("invalid");
            passwordReqLower.classList.add("valid");
        } else {
            passwordReqLower.classList.remove("valid");
            passwordReqLower.classList.add("invalid");
        }

        // Validate capital letters
        var upperCaseLetters = /[A-Z]/g;
        if (passwordReqInput.value.match(upperCaseLetters)) {
            passwordReqCapital.classList.remove("invalid");
            passwordReqCapital.classList.add("valid");
        } else {
            passwordReqCapital.classList.remove("valid");
            passwordReqCapital.classList.add("invalid");
        }

        // Validate numbers
        var numbers = /[0-9]/g;
        if (passwordReqInput.value.match(numbers)) {
            passwordReqNumb.classList.remove("invalid");
            passwordReqNumb.classList.add("valid");
        } else {
            passwordReqNumb.classList.remove("valid");
            passwordReqNumb.classList.add("invalid");
        }

        // Validate length
        if (passwordReqInput.value.length >= 8) {
            passwordReqLength.classList.remove("invalid");
            passwordReqLength.classList.add("valid");
        } else {
            passwordReqLength.classList.remove("valid");
            passwordReqLength.classList.add("invalid");
        }

        if (passwordReqInput.value.length >= 8 && passwordReqInput.value.match(numbers) && passwordReqInput.value.match(upperCaseLetters) && passwordReqInput.value.match(lowerCaseLetters)) {
            passwordReqInput.classList.remove("invalidBox");
        } else {
            passwordReqInput.classList.add("invalidBox");
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
    return new Promise((resolve, reject) => {
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

                resolve(data);
            });
    });
}