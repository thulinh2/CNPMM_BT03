const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            name: String,
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Số lượng không được ít hơn 1']
            },
            price: Number,
            img: String
        }
    ]
}, { timestamps: true });

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;