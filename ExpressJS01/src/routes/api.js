const express = require('express');
const rateLimit = require('express-rate-limit');
const { createUser, verifyOtp, resendOtp, handleLogin, forgotPassword, resendForgotPasswordOtp, resetPassword, getUser, getAccount } = require('../controllers/userController');
const { updateRole, toggleLockUser, deleteUser } = require('../controllers/userController');
const { getProducts, getProductById, getTopSellers, getCategories } = require('../controllers/productController');
const { addToCart, getCart, updateCartQuantity, deleteCartItem } = require('../controllers/cartController');
const { checkVoucher, placeOrder, getUserOrders, getOrderDetail, cancelOrder, getAllOrdersAdmin, updateOrderStatus, handleCancelRequest } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const delay = require('../middleware/delay');
const Product = require('../models/product');

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { EC: -1, EM: "Bạn đã thao tác đăng ký quá nhiều lần, vui lòng thử lại sau 15 phút!" }
});

const resendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 3, 
    message: { EC: -1, EM: "Bạn đã yêu cầu cấp lại mã quá nhiều lần, vui lòng thử lại sau 15 phút!" }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { EC: -1, EM: "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút để bảo vệ tài khoản!" }
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 3, 
    message: { EC: -1, EM: "Bạn đã yêu cầu gửi mã quá nhiều lần, vui lòng thử lại sau 15 phút!" }
});

const routerAPI = express.Router();

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
});

routerAPI.post("/register", registerLimiter, createUser);
routerAPI.post("/verify-otp", verifyOtp);
routerAPI.post("/resend-otp", resendOtpLimiter, resendOtp);
routerAPI.post("/login", loginLimiter, handleLogin);

// ROUTES QUÊN MẬT KHẨU MỚI NÂNG CẤP
routerAPI.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
routerAPI.post("/resend-forgot-password-otp", resendOtpLimiter, resendForgotPasswordOtp);
routerAPI.post("/reset-password", resetPassword);

routerAPI.get("/products", getProducts);
routerAPI.get("/products/top-sellers", getTopSellers);
routerAPI.get("/products/:id", getProductById);
routerAPI.get("/categories", getCategories);

routerAPI.get("/seed-products", async (req, res) => {
    try {
        const mockData = [
            { name: 'Túi Xách Da Thật Cao Cấp', price: '1.250.000đ', img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=500&auto=format&fit=crop', category: 'Túi Xách Da Thật', isNewProduct: true, isBestSeller: false },
            { name: 'Túi Công Sở Thanh Lịch', price: '1.800.000đ', img: 'https://images.unsplash.com/photo-1605733556294-9642e6bc8da2?q=80&w=500&auto=format&fit=crop', category: 'Túi Công Sở', isNewProduct: false, isBestSeller: true },
            { name: 'Túi Đeo Chéo Dạo Phố', price: '650.000đ', img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=500&auto=format&fit=crop', category: 'Túi Đeo Chéo', isNewProduct: true, isBestSeller: false },
            { name: 'Ví Cầm Tay Dự Tiệc', price: '1.100.000đ', img: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?q=80&w=500&auto=format&fit=crop', category: 'Ví Cầm Tay', isNewProduct: false, isBestSeller: true }
        ];
        await Product.insertMany(mockData); 
        return res.json("Đã tạo collection và thêm dữ liệu thành công!");
    } catch (error) {
        return res.json("Lỗi: " + error.message);
    }
});

routerAPI.use(auth); 

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

routerAPI.post("/cart", addToCart);
routerAPI.get("/cart", getCart); 
routerAPI.put("/cart", updateCartQuantity); 
routerAPI.delete("/cart/:productId", deleteCartItem); 

routerAPI.post("/order", placeOrder);
routerAPI.get("/orders", getUserOrders);    
routerAPI.get("/order/:id", getOrderDetail);      
routerAPI.put("/order/:id/cancel", cancelOrder);
routerAPI.post("/voucher/check", checkVoucher);

routerAPI.put("/users/:id/role", adminAuth, updateRole);
routerAPI.put("/users/:id/lock", adminAuth, toggleLockUser);
routerAPI.delete("/users/:id", adminAuth, deleteUser);

routerAPI.get("/admin/orders", adminAuth, getAllOrdersAdmin);
routerAPI.put("/admin/orders/:id/status", adminAuth, updateOrderStatus);
routerAPI.put("/admin/orders/:id/cancel-request", adminAuth, handleCancelRequest);

module.exports = routerAPI;