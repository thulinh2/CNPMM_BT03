const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    img: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    
    // Tổng tiền thanh toán
    totalAmount: { type: Number, required: true },
    originalAmount: { type: Number, default: 0 }, // Tổng tiền gốc (chưa giảm)
    discountAmount: { type: Number, default: 0 }, // Số tiền được giảm
    voucherCode: { type: String, default: '' },   // Mã giảm giá đã dùng
    // Thông tin nhận hàng
    shippingInfo: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    
    // Phương thức thanh toán (mặc định là COD)
    paymentMethod: { type: String, default: 'COD' },
    isPaid: { type: Boolean, default: false }, 

    status: { 
        type: String, 
        enum: [
            'New',               // 1. Đơn hàng mới 
            'Confirmed',         // 2. Đã xác nhận 
            'Preparing',         // 3. Shop đang chuẩn bị hàng
            'Delivering',        // 4. Đang giao hàng
            'Delivered',         // 5. Đã giao thành công
            'Cancel_Requested',  // Trạng thái chờ: Gửi yêu cầu hủy (khi khách hủy lúc đang ở bước 3)
            'Cancelled'          // 6. Đã hủy (Khách tự hủy trong 30p hoặc Shop duyệt yêu cầu hủy)
        ],
        default: 'New' 
    },
    cancelReason: { type: String, default: '' }, 
    statusHistory: [{
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String }
    }]
}, { 
    // Tự động sinh createdAt và updatedAt (dùng createdAt để làm mốc tính 30 phút)
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);