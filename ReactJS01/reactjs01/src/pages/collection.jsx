import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../util/axios.customize'; 

const CollectionPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gọi API lấy các sản phẩm MỚI về thuộc Bộ Sưu Tập
    useEffect(() => {
        const fetchCollection = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/v1/api/products?isNewProduct=true&limit=20');
                if (res && res.data) {
                    setProducts(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy bộ sưu tập:", error);
            }
            setLoading(false);
        };
        fetchCollection();
    }, []);

    const handleImageError = (e) => {
        e.target.onerror = null; 
        e.target.src = "https://placehold.co/600x400/fbcfe8/be185d?text=Trendy+Bags";
    };

    // HÀM TÍNH TOÁN VÀ HIỂN THỊ GIÁ THÔNG MINH
    const renderPrice = (priceStr, discount) => {
        // Nếu không có giảm giá, hiển thị giá màu hồng bình thường
        if (!discount || discount === 0) {
            return <p className="text-pink-600 font-bold mt-auto text-lg">{priceStr}</p>;
        }

        // Nếu có giảm giá: Chuyển chuỗi "850.000đ" thành số 850000 để tính toán
        const priceNumber = parseInt(priceStr.replace(/\./g, '').replace(/,/g, '').replace('đ', '').trim());
        const discountedNumber = priceNumber * (1 - discount / 100);
        
        // Format lại thành chuỗi "xxx.xxxđ"
        const discountedStr = discountedNumber.toLocaleString('vi-VN') + 'đ';

        // Hiển thị giá mới màu đỏ, giá cũ màu xám gạch ngang giống ảnh mẫu của bạn
        return (
            <div className="flex items-center gap-2 mt-auto">
                <span className="text-red-500 font-bold text-lg">{discountedStr}</span>
                <span className="text-slate-400 font-medium line-through text-sm">{priceStr}</span>
            </div>
        );
    };

    return (
        <div className="bg-rose-50/50 min-h-screen font-sans pb-16">
            
            {/* BANNER CHÍNH */}
            <div className="bg-pink-600 text-white text-center py-16 px-4">
                <h1 className="text-4xl font-bold mb-4">Bộ Sưu Tập Túi Xách Mùa Mới!</h1>
                <p className="text-xl mb-8">Tự tin tỏa sáng. Săn ngay các mẫu thiết kế hot nhất mùa này.</p>
            </div>

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <span className="bg-pink-500 w-1.5 h-6 rounded-full inline-block"></span>
                    Sản Phẩm Mùa Mới
                </h2>

                {loading ? (
                    <p className="text-pink-600 font-bold py-10 text-center bg-white rounded-xl">Đang tải dữ liệu...</p>
                ) : products.length === 0 ? (
                    <p className="text-gray-500 italic py-10 text-center bg-white rounded-xl border border-pink-100">Chưa có sản phẩm nào trong bộ sưu tập này.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <Link to={`/product/${product._id}`} key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-pink-50/50 block group h-full flex flex-col overflow-hidden">
                                <div className="relative w-full h-56 bg-pink-50 flex-shrink-0">
                                    
                                    {/* TAG TỰ ĐỘNG: Hiển thị Giảm X% nếu có, nếu không thì hiện Mới */}
                                    {product.discount > 0 ? (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20 shadow-sm uppercase tracking-wider">
                                            Giảm {product.discount}%
                                        </span>
                                    ) : product.isNewProduct && (
                                        <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20 shadow-sm uppercase tracking-wider">
                                            Mới
                                        </span>
                                    )}
                                    
                                    <img 
                                        src={product.img} 
                                        alt={product.name} 
                                        onError={handleImageError}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 z-10" 
                                    />
                                </div>
                                
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2 truncate group-hover:text-pink-600 transition-colors">{product.name}</h3>
                                    
                                    {/* Gọi hàm renderPrice thông minh đã tạo ở trên */}
                                    {renderPrice(product.price, product.discount)}
                                    
                                    <button className="mt-4 w-full bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition duration-200">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionPage;