const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now(),
    },
    posts: {
        type: Array,
        required: false
    },
    following: {
        type: Array,
        required: false
    },
    followers: {
        type: Array,
        required: false
    },
})

module.exports = mongoose.model("User", userSchema);