const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'USER' },
    isActive: { type: Boolean, default: true },
    
    // CÁC TRƯỜNG MỚI ĐỂ LÀM TÍNH NĂNG OTP
    isVerified: { type: Boolean, default: false }, // Trạng thái đã kích hoạt email chưa
    otp: { type: String }, // Lưu mã OTP 6 số
    otpExpires: { type: Date } // Thời gian hết hạn của OTP
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;