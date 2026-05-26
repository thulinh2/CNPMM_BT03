const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: String, 
    img: String, 
    images: [String], 
    category: String,
    isNewProduct: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    discount: { type: Number, default: 0 }, // THÊM DÒNG NÀY: Mức giảm giá (Ví dụ: 30 là giảm 30%)
    stock: { type: Number, default: 50 }, 
    sold: { type: Number, default: 0 },   
    description: String 
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;