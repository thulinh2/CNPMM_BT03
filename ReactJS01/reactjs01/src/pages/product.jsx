import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../util/axios.customize';
import { AuthContext } from '../components/context/auth.context'; 

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductPage = () => {
    const { id } = useParams(); 
    const { auth } = useContext(AuthContext); 
    
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductDetail = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/v1/api/products/${id}`);
                if (res && res.data) {
                    setProduct(res.data);
                    setSimilarProducts(res.similarProducts || []);
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
            }
            setLoading(false);
        };

        fetchProductDetail();
        setQuantity(1); 
        window.scrollTo(0, 0); 
    }, [id]);

    const handleIncrease = () => {
        if (quantity < product?.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (!auth.isAuthenticated) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }

        try {
            const priceNumber = parseInt(product.price.replace(/\./g, '').replace('đ', ''));

            // Gửi dữ liệu giỏ hàng (Không cần gửi email vì Backend tự lấy từ Token)
            const cartData = {
                productId: product._id,
                name: product.name,
                price: priceNumber,
                quantity: quantity,
                img: product.img
            };

            const res = await axios.post('/v1/api/cart', cartData);

            if (res && res.errCode === 0) {
                alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
            } else {
                alert("Có lỗi xảy ra, không thể thêm vào giỏ.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ:", error);
            alert("Lỗi kết nối đến Server!");
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-pink-600 font-semibold">Đang tải thông tin sản phẩm...</div>;
    }

    if (!product) {
        return <div className="text-center py-20 text-red-500 font-semibold">Sản phẩm không tồn tại!</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen py-10 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <nav className="text-sm text-gray-500 mb-6 flex gap-2">
                    <Link to="/" className="hover:text-pink-600 transition">Trang Chủ</Link> 
                    <span>/</span> 
                    <span className="hover:text-pink-600 transition cursor-pointer">{product.category}</span> 
                    <span>/</span> 
                    <span className="text-gray-800 font-semibold">{product.name}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
                    
                    <div className="w-full md:w-1/2 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
                        {product.stock === 0 && (
                            <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 text-sm font-bold rounded-lg shadow-md">
                                Hết Hàng
                            </div>
                        )}
                        
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            className="w-full h-[400px] md:h-[500px]"
                        >
                            {product.images?.map((imgUrl, index) => (
                                <SwiperSlide key={index}>
                                    <img src={imgUrl} alt={`${product.name} - ảnh ${index + 1}`} className="w-full h-full object-cover" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <span className="text-pink-600 font-bold uppercase text-xs tracking-wider mb-2 bg-pink-50 w-max px-3 py-1 rounded-full">
                            {product.category}
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
                        
                        <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                Đã bán: <strong className="text-gray-900">{product.sold}</strong>
                            </span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                                Tình trạng: 
                                {product.stock > 0 
                                    ? <strong className="text-green-600">Còn {product.stock} sản phẩm</strong> 
                                    : <strong className="text-red-500">Hết hàng</strong>
                                }
                            </span>
                        </div>

                        <div className="text-4xl font-extrabold text-pink-600 mb-6">{product.price}</div>
                        
                        <p className="text-gray-600 leading-relaxed mb-8 border-t border-b border-gray-100 py-6">
                            {product.description}
                        </p>

                        <div className="flex items-center gap-6 mb-8">
                            <span className="font-semibold text-gray-700">Số lượng:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                <button 
                                    onClick={handleDecrease}
                                    disabled={product.stock === 0}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                                >
                                    {/* SVG Icon Trừ */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                    </svg>
                                </button>
                                <span className="px-6 py-2 font-semibold text-gray-800 w-12 text-center border-l border-r border-gray-300">
                                    {product.stock === 0 ? 0 : quantity}
                                </span>
                                <button 
                                    onClick={handleIncrease}
                                    disabled={product.stock === 0 || quantity >= product.stock}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                                >
                                    {/* SVG Icon Cộng */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 bg-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition shadow-lg shadow-pink-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {/* SVG Icon Thêm vào giỏ */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                                {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                            </button>
                        </div>
                    </div>
                </div>

                {similarProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b-2 border-pink-500 inline-block pb-1">
                            Sản Phẩm Tương Tự
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map(item => (
                                <Link to={`/product/${item._id}`} key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100 block group">
                                    <div className="relative overflow-hidden h-56">
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-base font-semibold text-gray-800 mb-1 truncate group-hover:text-pink-600 transition-colors">{item.name}</h3>
                                        <p className="text-pink-600 font-bold">{item.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;