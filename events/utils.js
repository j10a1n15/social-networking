function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return password.length >= 8 && password.length <= 32 && /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/.test(password);
}

function isValidId(name) {
    return name.length >= 3 && name.length <= 32 && /^[a-z0-9]+$/.test(name)
}

module.exports.isValidEmail = isValidEmail;
module.exports.isValidPassword = isValidPassword;
module.exports.isValidId = isValidId;