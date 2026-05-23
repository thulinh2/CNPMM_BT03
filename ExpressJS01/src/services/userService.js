require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> user exist, chọn 1 email khác: ${email}`);
            return null;
        }

        const hashPassword = await bcrypt.hash(password, saltRounds);
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "USER",
            isActive: true // Mặc định tạo mới là được hoạt động
        })
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const loginService = async (email1, password) => {
    try {
        const user = await User.findOne({ email: email1 });
        if (user) {
            // CHỐT CHẶN: Kiểm tra xem tài khoản có đang bị khóa không
            if (user.isActive === false) {
                return {
                    EC: 3,
                    EM: "Tài khoản của bạn đã bị khóa bởi Quản trị viên!"
                }
            }

            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return { EC: 2, EM: "Email/Password không hợp lệ" }
            } else {
                const payload = { email: user.email, name: user.name, role: user.role }
                const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
                return {
                    EC: 0, access_token,
                    user: { email: user.email, name: user.name, role: user.role }
                }
            }
        } else {
            return { EC: 1, EM: "Email/Password không hợp lệ" }
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

// ================= CÁC HÀM MỚI CHO ADMIN =================

const updateRoleService = async (userId, newRole) => {
    try {
        // Cập nhật quyền và trả về dữ liệu mới nhất (không lấy password)
        let result = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select("-password");
        return result;
    } catch (error) { console.log(error); return null; }
}

const toggleLockUserService = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.isActive = !user.isActive; // Nếu đang true thì thành false và ngược lại
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
    createUserService, loginService, getUserService,
    updateRoleService, toggleLockUserService, deleteUserService
}