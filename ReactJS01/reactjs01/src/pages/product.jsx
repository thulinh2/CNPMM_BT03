import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../util/axios.customize';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductPage = () => {
    const { id } = useParams(); // Lấy ID từ URL 
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    // Mỗi khi ID thay đổi, gọi lại API
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
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    }, [id]);

    // xử lý tăng giảm số lượng mua
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

    if (loading) {
        return <div className="text-center py-20 text-pink-600 font-semibold">Đang tải thông tin sản phẩm...</div>;
    }

    if (!product) {
        return <div className="text-center py-20 text-red-500 font-semibold">Sản phẩm không tồn tại!</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen py-10 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Thanh điều hướng Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-6 flex gap-2">
                    <Link to="/" className="hover:text-pink-600 transition">Trang Chủ</Link> 
                    <span>/</span> 
                    <span className="hover:text-pink-600 transition cursor-pointer">{product.category}</span> 
                    <span>/</span> 
                    <span className="text-gray-800 font-semibold">{product.name}</span>
                </nav>

                {/* Chi tiết sản phẩm chính */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
                    
                    {/* Khu vực hình ảnh (SwiperJS) */}
                    <div className="w-full md:w-1/2 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
                        {/* Nếu hết hàng, hiển thị nhãn Hết Hàng đè lên ảnh */}
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
                            {/* Duyệt qua mảng hình ảnh để tạo các Slide */}
                            {product.images?.map((imgUrl, index) => (
                                <SwiperSlide key={index}>
                                    <img src={imgUrl} alt={`${product.name} - ảnh ${index + 1}`} className="w-full h-full object-cover" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Khu vực thông tin sản phẩm */}
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

                        {/* Chọn số lượng */}
                        <div className="flex items-center gap-6 mb-8">
                            <span className="font-semibold text-gray-700">Số lượng:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                <button 
                                    onClick={handleDecrease}
                                    disabled={product.stock === 0}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                                >
                                    <MinusOutlined />
                                </button>
                                <span className="px-6 py-2 font-semibold text-gray-800 w-12 text-center border-l border-r border-gray-300">
                                    {product.stock === 0 ? 0 : quantity}
                                </span>
                                <button 
                                    onClick={handleIncrease}
                                    disabled={product.stock === 0 || quantity >= product.stock}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                                >
                                    <PlusOutlined />
                                </button>
                            </div>
                        </div>

                        {/* Nút thêm vào giỏ */}
                        <div className="flex gap-4">
                            <button 
                                disabled={product.stock === 0}
                                className="flex-1 bg-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition shadow-lg shadow-pink-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCartOutlined className="text-2xl" />
                                {product.stock === 0 ? 'Tạm thời hết hàng' : 'Thêm vào giỏ'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Khu vực Sản Phẩm Tương Tự */}
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