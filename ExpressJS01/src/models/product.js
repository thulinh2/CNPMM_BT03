const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: String, 
    img: String, // Ảnh chính hiển thị ở trang chủ
    images: [String], // Danh sách nhiều ảnh trong trang chi tiết
    category: String,
    isNewProduct: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    stock: { type: Number, default: 50 }, 
    sold: { type: Number, default: 0 },   
    description: String 
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;