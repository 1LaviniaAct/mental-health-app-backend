
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ResultSchema = new Schema({
    punctajStima: Number,
    punctajDeznadejde: Number,
    punctajEmotivitate: Number,
    userId: String,
    data: { type: Date, default: Date.now } 

});

const Result = model('Result', ResultSchema);

module.exports = Result;