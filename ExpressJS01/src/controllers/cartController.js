const Cart = require('../models/cart');

// 1. Hàm thêm sản phẩm vào giỏ hàng (Đã hoàn thiện ở bước trước)
const addToCart = async (req, res) => {
    try {
        const userEmail = req.user.email; 
        const { productId, quantity, name, price, img } = req.body;

        let cart = await Cart.findOne({ userEmail });

        if (cart) {
            const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, name, quantity, price, img });
            }
            cart = await cart.save();
        } else {
            cart = await Cart.create({
                userEmail,
                items: [{ productId, name, quantity, price, img }]
            });
        }
        return res.status(200).json({ errCode: 0, message: 'Đã thêm vào giỏ hàng', data: cart });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
};

// 2. Hàm lấy thông tin giỏ hàng dựa theo Token đăng nhập
const getCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // Lấy trực tiếp từ token giải mã cho an toàn
        const cart = await Cart.findOne({ userEmail });
        return res.status(200).json({
            errCode: 0,
            data: cart || { items: [] }
        });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
};

// 3. HÀM MỚI: Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartQuantity = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId, quantity } = req.body; // Nhận id sản phẩm và số lượng mới từ FE

        let cart = await Cart.findOne({ userEmail });
        if (!cart) return res.status(404).json({ errCode: 1, message: 'Không tìm thấy giỏ hàng' });

        const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity; // Gán số lượng mới
            cart = await cart.save();
            return res.status(200).json({ errCode: 0, message: 'Cập nhật số lượng thành công', data: cart });
        } else {
            return res.status(404).json({ errCode: 2, message: 'Sản phẩm không có trong giỏ hàng' });
        }
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
};

// 4. HÀM MỚI: Xóa hẳn một sản phẩm ra khỏi giỏ hàng
const deleteCartItem = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId } = req.params; // Nhận mã sản phẩm cần xóa trên đường dẫn url

        let cart = await Cart.findOne({ userEmail });
        if (!cart) return res.status(404).json({ errCode: 1, message: 'Không tìm thấy giỏ hàng' });

        // Lọc bỏ sản phẩm được chọn ra khỏi mảng items
        cart.items = cart.items.filter(p => p.productId.toString() !== productId);
        cart = await cart.save();

        return res.status(200).json({ errCode: 0, message: 'Xóa sản phẩm thành công', data: cart });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
};

module.exports = { addToCart, getCart, updateCartQuantity, deleteCartItem };