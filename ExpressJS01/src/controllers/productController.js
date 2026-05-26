const Category = require('../models/category');
const Product = require('../models/product');

const getProducts = async (req, res) => {
    try {
        // Bổ sung thêm biến isSale để nhận yêu cầu từ Frontend
        const { name, category, priceRange, isNewProduct, isSale } = req.query; 
        let query = {};

        if (name) query.name = { $regex: name, $options: 'i' };
        if (category) query.category = category;
        if (isNewProduct === 'true') query.isNewProduct = true;
        
        // THÊM LOGIC: Nếu đang tìm hàng khuyến mãi, lấy sản phẩm có discount lớn hơn 0
        if (isSale === 'true') {
            query.discount = { $gt: 0 };
        }

        let products = await Product.find(query);

        if (priceRange) {
            products = products.filter(item => {
                const priceNumber = parseInt(item.price.replace(/\./g, '').replace('đ', ''));
                if (priceRange === 'under500') return priceNumber < 500000;
                if (priceRange === '500to1000') return priceNumber >= 500000 && priceNumber <= 1000000;
                if (priceRange === 'over1000') return priceNumber > 1000000;
                return true;
            });
        }
        
        // Phân trang
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 8; 
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const paginatedProducts = products.slice(startIndex, endIndex);

        return res.status(200).json({
            errCode: 0,
            message: 'Lấy danh sách sản phẩm thành công',
            data: paginatedProducts,
            totalItems: products.length,
            totalPages: Math.ceil(products.length / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(">>> Lỗi lấy sản phẩm: ", error);
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
}
const getProductById = async (req, res) => {
    try {
        const { id } = req.params; 
        
        // Tìm sản phẩm chính
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ errCode: 1, message: 'Không tìm thấy sản phẩm' });
        }

        // Tìm các sản phẩm tương tự
        const similarProducts = await Product.find({ 
            category: product.category, 
            _id: { $ne: id } 
        }).limit(4); // Lấy tối đa 4 sp

        return res.status(200).json({
            errCode: 0,
            data: product,
            similarProducts: similarProducts
        });

    } catch (error) {
        console.log(">>> Lỗi lấy chi tiết sản phẩm: ", error);
        return res.status(500).json({ errCode: -1, message: 'Lỗi định dạng ID hoặc lỗi server' });
    }
}
const getTopSellers = async (req, res) => {
    try {
        const topSellers = await Product.find({}).sort({ sold: -1 }).limit(10);
        
        return res.status(200).json({
            errCode: 0,
            data: topSellers
        });
    } catch (error) {
        console.log(">>> Lỗi lấy top sellers: ", error);
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
}
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        return res.status(200).json({ errCode: 0, data: categories });
    } catch (error) {
        console.log("Lỗi lấy danh mục: ", error);
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
}
module.exports = {
    getProducts,
    getProductById,
    getTopSellers,
    getCategories
}