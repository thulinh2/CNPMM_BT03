require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sendEmail = require("../util/sendEmail"); 
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        if (!name || !email || !password) {
            return { EC: 1, EM: "Vui lòng điền đầy đủ thông tin!" };
        }

        const user = await User.findOne({ email });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); 

        if (user) {
            if (user.isVerified) {
                return { EC: 2, EM: "Email này đã được sử dụng!" };
            }
            const hashPassword = await bcrypt.hash(password, saltRounds);
            user.name = name;
            user.password = hashPassword;
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            const hashPassword = await bcrypt.hash(password, saltRounds);
            await User.create({
                name: name,
                email: email,
                password: hashPassword,
                role: "USER",
                isActive: true,
                isVerified: false, 
                otp: otp,
                otpExpires: otpExpires
            });
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #fbcfe8; border-radius: 10px;">
                <h2 style="color: #e91e63;">Chào mừng đến với TrendyBags!</h2>
                <p>Chào <b>${name}</b>,</p>
                <p>Mã OTP để kích hoạt tài khoản của bạn là:</p>
                <h1 style="color: #e91e63; font-size: 32px; letter-spacing: 5px; text-align: center; background: #fff1f2; padding: 10px; border-radius: 5px;">${otp}</h1>
                <p style="color: #666; font-size: 14px;"><i>*Mã này sẽ hết hạn trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</i></p>
            </div>
        `;
        await sendEmail(email, "Mã OTP kích hoạt tài khoản TrendyBags", htmlContent);

        return { EC: 0, EM: "Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản." };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống server" };
    }
}

const verifyOtpService = async (email, otp) => {
    try {
        if (!email || !otp) return { EC: 1, EM: "Thiếu email hoặc mã OTP" };

        const user = await User.findOne({ email });
        if (!user) return { EC: 2, EM: "Không tìm thấy tài khoản" };
        if (user.isVerified) return { EC: 3, EM: "Tài khoản đã được kích hoạt trước đó" };
        
        if (user.otp !== otp) return { EC: 4, EM: "Mã OTP không chính xác" };
        if (user.otpExpires < Date.now()) return { EC: 5, EM: "Mã OTP đã hết hạn. Vui lòng đăng ký lại để nhận mã mới." };

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return { EC: 0, EM: "Kích hoạt tài khoản thành công! Bạn có thể đăng nhập." };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống server" };
    }
}

const resendOtpService = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return { EC: 1, EM: "Không tìm thấy tài khoản!" };
        if (user.isVerified) return { EC: 2, EM: "Tài khoản này đã được kích hoạt!" };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #fbcfe8; border-radius: 10px;">
                <h2 style="color: #e91e63;">Yêu cầu cấp lại mã OTP</h2>
                <p>Chào <b>${user.name}</b>,</p>
                <p>Mã OTP MỚI để kích hoạt tài khoản của bạn là:</p>
                <h1 style="color: #e91e63; font-size: 32px; letter-spacing: 5px; text-align: center; background: #fff1f2; padding: 10px; border-radius: 5px;">${otp}</h1>
                <p style="color: #666; font-size: 14px;"><i>*Mã này sẽ hết hạn trong vòng 5 phút.</i></p>
            </div>
        `;
        await sendEmail(email, "TrendyBags - Cấp lại mã OTP kích hoạt", htmlContent);

        return { EC: 0, EM: "Đã gửi lại mã OTP. Vui lòng kiểm tra hộp thư!" };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống server" };
    }
}

// HÀM KIỂM TRA EMAIL ĐĂNG KÝ VÀ TẠO OTP QUÊN MẬT KHẨU
const forgotPasswordService = async (email) => {
    try {
        if (!email) return { EC: 1, EM: "Vui lòng nhập địa chỉ email!" };
        
        // KIỂM TRA EMAIL CÓ TRONG HỆ THỐNG HAY KHÔNG
        const user = await User.findOne({ email });
        if (!user) return { EC: 2, EM: "Email này không khớp với bất kỳ tài khoản nào đã đăng ký!" };
        if (!user.isVerified) return { EC: 3, EM: "Tài khoản liên kết với email này chưa được kích hoạt!" };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #fbcfe8; border-radius: 10px;">
                <h2 style="color: #e91e63;">Yêu cầu khôi phục mật khẩu</h2>
                <p>Chào <b>${user.name}</b>,</p>
                <p>Mã OTP để đặt lại mật khẩu mới của bạn là:</p>
                <h1 style="color: #e91e63; font-size: 32px; letter-spacing: 5px; text-align: center; background: #fff1f2; padding: 10px; border-radius: 5px;">${otp}</h1>
                <p style="color: #666; font-size: 14px;"><i>*Mã này sẽ hết hạn trong vòng 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua thư.</i></p>
            </div>
        `;
        await sendEmail(email, "TrendyBags - Khôi phục mật khẩu tài khoản", htmlContent);

        return { EC: 0, EM: "Mã OTP khôi phục đã được gửi thành công đến email của bạn!" };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống server" };
    }
}

// HÀM MỚI: Gửi lại OTP khi quên mật khẩu
const resendForgotPasswordOtpService = async (email) => {
    try {
        if (!email) return { EC: 1, EM: "Thiếu thông tin địa chỉ email!" };
        const user = await User.findOne({ email });
        if (!user) return { EC: 2, EM: "Tài khoản không tồn tại!" };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #fbcfe8; border-radius: 10px;">
                <h2 style="color: #e91e63;">Gửi lại mã OTP khôi phục mật khẩu</h2>
                <p>Chào <b>${user.name}</b>,</p>
                <p>Mã OTP MỚI để đặt lại mật khẩu của bạn là:</p>
                <h1 style="color: #e91e63; font-size: 32px; letter-spacing: 5px; text-align: center; background: #fff1f2; padding: 10px; border-radius: 5px;">${otp}</h1>
                <p style="color: #666; font-size: 14px;"><i>*Mã này sẽ hết hạn trong vòng 5 phút.</i></p>
            </div>
        `;
        await sendEmail(email, "TrendyBags - Gửi lại mã OTP khôi phục mật khẩu", htmlContent);

        return { EC: 0, EM: "Đã gửi lại mã OTP khôi phục mới. Vui lòng kiểm tra email!" };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống server" };
    }
}

const resetPasswordService = async (email, otp, newPassword) => {
    try {
        if (!email || !otp || !newPassword) return { EC: 1, EM: "Vui lòng điền đầy đủ thông tin!" };

        const user = await User.findOne({ email });
        if (!user) return { EC: 2, EM: "Không tìm thấy tài khoản" };

        if (user.otp !== otp) return { EC: 3, EM: "Mã OTP không chính xác" };
        if (user.otpExpires < Date.now()) return { EC: 4, EM: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." };

        const hashPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return { EC: 0, EM: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ." };
    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống server" };
    }
}

const loginService = async (email1, password) => {
    try {
        const user = await User.findOne({ email: email1 });
        if (user) {
            if (user.isActive === false) return { EC: 3, EM: "Tài khoản của bạn đã bị khóa bởi Quản trị viên!" };
            if (user.isVerified === false) return { EC: 4, EM: "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email!" };

            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return { EC: 2, EM: "Email/Password không hợp lệ" };
            } else {
                const payload = { email: user.email, name: user.name, role: user.role };
                const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
                return {
                    EC: 0, access_token,
                    user: { email: user.email, name: user.name, role: user.role }
                };
            }
        } else {
            return { EC: 1, EM: "Email/Password không hợp lệ" };
        }
    } catch (error) {
        console.log(error); return null;
    }
}

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password");
        return result;
    } catch (error) { console.log(error); return null; }
}

const updateRoleService = async (userId, newRole) => {
    try {
        let result = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select("-password");
        return result;
    } catch (error) { console.log(error); return null; }
}

const toggleLockUserService = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.isActive = !user.isActive; 
            await user.save();
            return user;
        }
        return null;
    } catch (error) { console.log(error); return null; }
}

const deleteUserService = async (userId) => {
    try {
        let result = await User.findByIdAndDelete(userId);
        return result;
    } catch (error) { console.log(error); return null; }
}

module.exports = {
    createUserService, verifyOtpService, resendOtpService, loginService, getUserService,
    updateRoleService, toggleLockUserService, deleteUserService, 
    forgotPasswordService, resendForgotPasswordOtpService, resetPasswordService
}