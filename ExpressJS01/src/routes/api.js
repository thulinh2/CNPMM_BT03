const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { updateRole, toggleLockUser, deleteUser } = require('../controllers/userController');
const { getProducts, getProductById, getTopSellers, getCategories } = require('../controllers/productController');
const { addToCart, getCart, updateCartQuantity, deleteCartItem } = require('../controllers/cartController');
const { checkVoucher, placeOrder, getUserOrders, getOrderDetail, cancelOrder, getAllOrdersAdmin, updateOrderStatus, handleCancelRequest } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const delay = require('../middleware/delay');
const Product = require('../models/product');

const routerAPI = express.Router();

// Các route Public
routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
});

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);

routerAPI.get("/products", getProducts);
routerAPI.get("/products/top-sellers", getTopSellers);
routerAPI.get("/products/:id", getProductById);
routerAPI.get("/categories", getCategories);

// API tự động tạo dữ liệu mẫu
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

routerAPI.use(auth); // Các route nào nằm dưới dòng này đều sẽ bị kiểm tra đăng nhập

// Bắt buộc phải đăng nhập
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

routerAPI.post("/cart", addToCart);
routerAPI.get("/cart", getCart); // Sửa lại route này bỏ cái :userEmail đi cho đồng bộ bảo mật qua token luôn nhé
routerAPI.put("/cart", updateCartQuantity); // API cập nhật số lượng
routerAPI.delete("/cart/:productId", deleteCartItem); // API xóa sản phẩm

routerAPI.post("/order", placeOrder);
routerAPI.get("/orders", getUserOrders);    
routerAPI.get("/order/:id", getOrderDetail);      
routerAPI.put("/order/:id/cancel", cancelOrder);
routerAPI.post("/voucher/check", checkVoucher);

// --- CÁC ROUTE CHỈ DÀNH CHO ADMIN QUẢN LÝ USER ---
routerAPI.put("/users/:id/role", adminAuth, updateRole);
routerAPI.put("/users/:id/lock", adminAuth, toggleLockUser);
routerAPI.delete("/users/:id", adminAuth, deleteUser);
// --- CÁC ROUTE CHỈ DÀNH CHO ADMIN QUẢN LÝ ĐƠN HÀNG ---
routerAPI.get("/admin/orders", adminAuth, getAllOrdersAdmin);
routerAPI.put("/admin/orders/:id/status", adminAuth, updateOrderStatus);
routerAPI.put("/admin/orders/:id/cancel-request", adminAuth, handleCancelRequest);



module.exports = routerAPI;