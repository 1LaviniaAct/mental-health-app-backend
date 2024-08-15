
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const profileSchema = new mongoose.Schema({
    userId: String,
    name: String,
    position: String,
    description: String,
    punctajStima: Number,
    punctajDeznadejde: Number,
    punctajEmotivitate: Number,
});

const Profile = model('Profile', profileSchema);

module.exports = Profile;