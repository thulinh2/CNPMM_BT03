const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: String,
    displayName: String,
    count: { type: Number, default: 0 }
});

const Category = mongoose.model('category', categorySchema);

module.exports = Category;