const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true, // Tự động viết hoa (vd: FREESHIP, SALE10K)
        trim: true 
    },
    discountType: { 
        type: String, 
        enum: ['PERCENT', 'FIXED'], // PERCENT: Giảm theo %, FIXED: Giảm số tiền cố định
        required: true 
    },
    discountValue: { 
        type: Number, 
        required: true // Giá trị giảm (Ví dụ: 10%, hoặc 50000đ)
    },
    minOrderValue: { 
        type: Number, 
        default: 0 // Đơn tối thiểu để được áp dụng
    },
    maxDiscountAmount: { 
        type: Number 
        // Số tiền giảm tối đa (Dành cho loại PERCENT. Vd: Giảm 10% nhưng tối đa 50.000đ)
    },
    startDate: { 
        type: Date, 
        default: Date.now 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    usageLimit: { 
        type: Number, 
        default: 100 // Tổng số lượt sử dụng tối đa của mã này
    },
    usedCount: { 
        type: Number, 
        default: 0 // Số lượt đã được khách hàng sử dụng
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);