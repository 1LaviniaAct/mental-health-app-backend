const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const RecommendationSchema = new Schema({
    category: String,
    categoryRosenberg: String,
    categoryStima: String,
    categoryDeznadejde: String,
    categoryEmotivitate: String,
    name: String,
    description: String,
    image: String 
});

const Recommendation = model('Recommendation', RecommendationSchema);

module.exports = Recommendation;