const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');
const Voucher = require('../models/voucher');

// Kiểm tra mã giảm giá 
const checkVoucher = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        if (!code) return res.status(400).json({ errCode: 1, message: "Vui lòng nhập mã giảm giá!" });

        // Lấy thông tin userId của tài khoản đang đăng nhập
        let userId = req.user.id || req.user._id;
        if (!userId) {
            const user = await User.findOne({ email: req.user.email });
            if (user) userId = user._id;
        }

        // Kiểm tra xem tài khoản này đã từng tạo đơn hàng nào sử dụng mã này chưa
        const isVoucherUsed = await Order.findOne({ userId, voucherCode: code.toUpperCase() });
        if (isVoucherUsed) {
            return res.status(400).json({ 
                errCode: 1, 
                message: "Bạn đã dùng mã này rồi!" 
            });
        }

        // Kiểm tra các điều kiện cơ bản của Voucher trong hệ thống
        const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
        if (!voucher) return res.status(404).json({ errCode: 1, message: "Mã giảm giá không tồn tại!" });

        const now = new Date();
        if (now < voucher.startDate) return res.status(400).json({ errCode: 1, message: "Mã giảm giá chưa đến thời gian sử dụng!" });
        if (now > voucher.endDate) return res.status(400).json({ errCode: 1, message: "Mã giảm giá đã hết hạn!" });
        if (voucher.usedCount >= voucher.usageLimit) return res.status(400).json({ errCode: 1, message: "Mã giảm giá đã hết lượt sử dụng!" });
        if (orderValue < voucher.minOrderValue) return res.status(400).json({ errCode: 1, message: `Đơn hàng chưa đạt mức tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để áp dụng!` });

        // Tính toán số tiền giảm
        let discountAmount = 0;
        if (voucher.discountType === 'PERCENT') {
            discountAmount = (orderValue * voucher.discountValue) / 100;
            if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
                discountAmount = voucher.maxDiscountAmount;
            }
        } else if (voucher.discountType === 'FIXED') {
            discountAmount = voucher.discountValue;
        }

        return res.status(200).json({
            errCode: 0,
            message: "Áp dụng mã thành công!",
            data: { discountAmount, voucherCode: voucher.code }
        });
    } catch (error) {
        console.error("Lỗi kiểm tra voucher:", error);
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};

// Đặt hàng 
const placeOrder = async (req, res) => {
    try {
        const { shippingInfo, paymentMethod, voucherCode } = req.body;
        const userEmail = req.user.email; 

        const cart = await Cart.findOne({ userEmail });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ errCode: 1, message: "Giỏ hàng trống, không thể đặt hàng!" });
        }

        let userId = req.user.id || req.user._id;
        if (!userId) {
            const user = await User.findOne({ email: userEmail });
            if (!user) return res.status(404).json({ errCode: 1, message: "Không tìm thấy tài khoản!" });
            userId = user._id;
        }

        // Kiểm tra lại xem tài khoản đã dùng mã này trước đó chưa khi gửi lệnh tạo đơn
        if (voucherCode) {
            const isVoucherUsed = await Order.findOne({ userId, voucherCode: voucherCode.toUpperCase() });
            if (isVoucherUsed) {
                return res.status(400).json({ 
                    errCode: 1, 
                    message: "Bạn đã dùng mã này rồi!" 
                });
            }
        }

        let originalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            originalAmount += (item.price * item.quantity);
            orderItems.push({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                img: item.img
            });
        }

        let finalAmount = originalAmount;
        let discountAmount = 0;
        let appliedVoucherCode = '';

        if (voucherCode) {
            const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
            if (voucher) {
                const now = new Date();
                if (now >= voucher.startDate && now <= voucher.endDate && voucher.usedCount < voucher.usageLimit && originalAmount >= voucher.minOrderValue) {
                    if (voucher.discountType === 'PERCENT') {
                        discountAmount = (originalAmount * voucher.discountValue) / 100;
                        if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) discountAmount = voucher.maxDiscountAmount;
                    } else {
                        discountAmount = voucher.discountValue;
                    }

                    finalAmount = originalAmount - discountAmount;
                    if (finalAmount < 0) finalAmount = 0;
                    appliedVoucherCode = voucher.code;

                    voucher.usedCount += 1;
                    await voucher.save();
                }
            }
        }

        const newOrder = new Order({
            userId: userId,
            items: orderItems,
            originalAmount: originalAmount,
            discountAmount: discountAmount,
            totalAmount: finalAmount,
            voucherCode: appliedVoucherCode,
            shippingInfo: shippingInfo,
            paymentMethod: paymentMethod || 'COD',
            status: 'New', 
            statusHistory: [{ status: 'New', note: 'Khách hàng đặt đơn thành công' }]
        });

        await newOrder.save();

        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({ errCode: 0, message: "Đặt hàng thành công!", data: newOrder });

    } catch (error) {
        console.error("Lỗi Controller Đặt hàng:", error);
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};

// Lấy danh sách lịch sử đơn hàng
const getUserOrders = async (req, res) => {
    try {
        const userEmail = req.user.email;
        let userId = req.user.id || req.user._id;
        if (!userId) {
            const user = await User.findOne({ email: userEmail });
            userId = user._id;
        }
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ errCode: 0, data: orders });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};

// Lấy chi tiết đơn hàng
const getOrderDetail = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ errCode: 1, message: "Không tìm thấy đơn hàng!" });
        return res.status(200).json({ errCode: 0, data: order });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};

// Hủy đơn hàng 
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { cancelReason } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ errCode: 1, message: "Không tìm thấy đơn hàng!" });

        const diffInMinutes = (new Date() - new Date(order.createdAt)) / (1000 * 60);

        //Khách tự hủy trực tiếp (Chỉ áp dụng khi đơn Mới / Đã xác nhận)
        if (order.status === 'New' || order.status === 'Confirmed') {
            if (diffInMinutes > 30) {
                return res.status(400).json({ 
                    errCode: 1, 
                    message: "Đã quá 30 phút kể từ lúc đặt, không thể tự hủy. Vui lòng liên hệ Shop!" 
                });
            }

            order.status = 'Cancelled';
            order.cancelReason = cancelReason || 'Khách hàng tự hủy';
            order.statusHistory.push({ status: 'Cancelled', note: `Khách hàng hủy đơn (${cancelReason})` });

            // Hoàn lại số lượng sản phẩm về kho hàng
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, sold: -item.quantity } });
            }

            await order.save();
            return res.status(200).json({ errCode: 0, message: "Hủy đơn hàng thành công!", data: order });
            
        } 
        // Khách gửi yêu cầu hủy (Áp dụng khi shop đang đóng gói - Bỏ qua thời gian 30p)
        else if (order.status === 'Preparing') {
            order.status = 'Cancel_Requested';
            order.cancelReason = cancelReason || 'Khách hàng yêu cầu hủy';
            order.statusHistory.push({ status: 'Cancel_Requested', note: `Yêu cầu hủy (${cancelReason})` });
            
            await order.save();
            return res.status(200).json({ errCode: 0, message: "Đã gửi yêu cầu hủy đơn thành công!", data: order });
            
        } 
        // Đang giao hoặc đã giao thì cấm hủy
        else {
            return res.status(400).json({ errCode: 1, message: "Đơn hàng đang giao, không thể hủy." });
        }
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};
// Các hàm dành cho Admin quản lý đơn hàng

// Lấy toàn bộ danh sách đơn hàng
const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email') 
            .sort({ createdAt: -1 });
        return res.status(200).json({ errCode: 0, data: orders });
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng Admin:", error);
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};

// Cập nhật trạng thái đơn hàng 
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ errCode: 1, message: "Không tìm thấy đơn hàng!" });
        if (status === 'Cancelled' && order.status !== 'Cancelled' && order.status !== 'Cancel_Requested') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, sold: -item.quantity } });
            }
        }

        order.status = status;
        order.statusHistory.push({ status: status, note: note || `Admin cập nhật trạng thái thành: ${status}` });
        await order.save();

        return res.status(200).json({ errCode: 0, message: "Cập nhật trạng thái thành công!", data: order });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};

// Xử lý yêu cầu hủy đơn từ khách hàng
const handleCancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved, note } = req.body; 

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ errCode: 1, message: "Không tìm thấy đơn hàng!" });

        if (order.status !== 'Cancel_Requested') {
            return res.status(400).json({ errCode: 1, message: "Đơn hàng không có yêu cầu hủy!" });
        }

        if (isApproved) {
            order.status = 'Cancelled';
            order.statusHistory.push({ status: 'Cancelled', note: note || 'Shop đã đồng ý yêu cầu hủy đơn' });
            
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, sold: -item.quantity } });
            }
        } else {
            order.status = 'Preparing';
            order.cancelReason = ''; 
            order.statusHistory.push({ status: 'Preparing', note: note || 'Shop từ chối hủy, đơn hàng đang được đóng gói' });
        }

        await order.save();
        return res.status(200).json({ errCode: 0, message: "Xử lý yêu cầu thành công!", data: order });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
};

module.exports = {
    checkVoucher,
    placeOrder,
    getUserOrders,
    getOrderDetail,
    cancelOrder,
    getAllOrdersAdmin, 
    updateOrderStatus, 
    handleCancelRequest
};