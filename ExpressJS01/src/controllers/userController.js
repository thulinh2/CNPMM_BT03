const { 
    createUserService, verifyOtpService, loginService, getUserService, 
    updateRoleService, toggleLockUserService, deleteUserService, resendOtpService,
    forgotPasswordService, resendForgotPasswordOtpService, resetPasswordService
} = require("../services/userService");

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    if (data && data.EC === 0) return res.status(200).json(data);
    return res.status(400).json(data); 
}

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const data = await verifyOtpService(email, otp);
    if (data && data.EC === 0) return res.status(200).json(data);
    return res.status(400).json(data);
}

const resendOtp = async (req, res) => {
    const { email } = req.body;
    const data = await resendOtpService(email);
    if (data && data.EC === 0) return res.status(200).json(data);
    return res.status(400).json(data);
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data);
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const data = await forgotPasswordService(email);
    if (data && data.EC === 0) return res.status(200).json(data);
    return res.status(400).json(data);
}

const resendForgotPasswordOtp = async (req, res) => {
    const { email } = req.body;
    const data = await resendForgotPasswordOtpService(email);
    if (data && data.EC === 0) return res.status(200).json(data);
    return res.status(400).json(data);
}

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const data = await resetPasswordService(email, otp, newPassword);
    if (data && data.EC === 0) return res.status(200).json(data);
    return res.status(400).json(data);
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}

const getAccount = async (req, res) => {
    return res.status(200).json(req.user);
}

const updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; 
    const data = await updateRoleService(id, role);
    if(data) return res.status(200).json({ errCode: 0, message: "Cập nhật quyền thành công!", data });
    return res.status(500).json({ errCode: -1, message: "Lỗi server" });
}

const toggleLockUser = async (req, res) => {
    const { id } = req.params;
    const data = await toggleLockUserService(id);
    if(data) {
        const message = data.isActive ? "Đã MỞ KHÓA tài khoản thành công!" : "Đã KHÓA tài khoản thành công!";
        return res.status(200).json({ errCode: 0, message, data });
    }
    return res.status(500).json({ errCode: -1, message: "Lỗi server" });
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const data = await deleteUserService(id);
    if(data) return res.status(200).json({ errCode: 0, message: "Đã xóa tài khoản vĩnh viễn!" });
    return res.status(500).json({ errCode: -1, message: "Lỗi server" });
}

module.exports = {
    createUser, verifyOtp, resendOtp, handleLogin, forgotPassword, resendForgotPasswordOtp, resetPassword, getUser, getAccount,
    updateRole, toggleLockUser, deleteUser
}