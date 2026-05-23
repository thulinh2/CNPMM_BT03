import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../util/axios.customize'; 

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomePage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [searchName, setSearchName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [searchName, selectedCategory, selectedPrice]);

    // Gọi API lấy Danh Mục từ Database
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/v1/api/categories');
                if (res && res.data) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Gọi API lấy dữ liệu Sản Phẩm
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchName) params.append('name', searchName);
                if (selectedCategory) params.append('category', selectedCategory);
                if (selectedPrice) params.append('priceRange', selectedPrice);
                params.append('page', page);
                params.append('limit', 6); 

                const res = await axios.get(`/v1/api/products?${params.toString()}`);
                
                if (res && res.data) {
                    setAllProducts(res.data);
                    setTotalPages(res.totalPages || 1);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
            }
            setLoading(false);
        };

        const delaySearch = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchName, selectedCategory, selectedPrice, page]);

    // Lấy Top 10 Bán Chạy
    useEffect(() => {
        const fetchTopSellers = async () => {
            try {
                const res = await axios.get('/v1/api/products/top-sellers');
                if (res && res.data) {
                    setBestSellers(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy top sellers:", error);
            }
        };
        fetchTopSellers();
    }, []);

    const handleImageError = (e) => {
        e.target.onerror = null; 
        e.target.src = "https://placehold.co/600x400/fbcfe8/be185d?text=Trendy+Bags";
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        document.getElementById('all-products-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-rose-50/50 min-h-screen font-sans">
            <div className="bg-pink-600 text-white text-center py-16 px-4">
                <h1 className="text-4xl font-bold mb-4">Bộ Sưu Tập Túi Xách Mùa Mới!</h1>
                <p className="text-xl mb-8">Tự tin tỏa sáng. Giảm ngay 30% cho các mẫu túi kẹp nách và ví cầm tay.</p>
                <button className="bg-white text-pink-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300 shadow-md">
                    Săn Sale Ngay
                </button>
            </div>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 lg:gap-10">
                
                <aside className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-6">
                    {/* Danh mục sản phẩm */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                            <span className="bg-pink-500 w-1.5 h-5 rounded-full inline-block"></span>
                            Danh Mục Sản Phẩm
                        </h3>
                        <ul className=" space-y-1">
                            {categories.map((cat, index) => (
                                <li key={index}>
                                    <button 
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`w-full flex justify-between items-center group px-3 py-2.5 rounded-lg transition-all duration-300 ${selectedCategory === cat.name ? 'bg-pink-100' : 'hover:bg-pink-50'}`}
                                    >
                                        <span className={`font-medium transition-transform duration-300 ${selectedCategory === cat.name ? 'text-pink-600 translate-x-1' : 'text-gray-600 group-hover:text-pink-600 group-hover:translate-x-1'}`}>
                                            {cat.displayName}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Lọc theo giá */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                            <span className="bg-pink-500 w-1.5 h-5 rounded-full inline-block"></span>
                            Lọc Theo Giá
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600 px-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="radio" name="price" checked={selectedPrice === ''} onChange={() => setSelectedPrice('')} className="w-4 h-4 text-pink-600 focus:ring-pink-500 cursor-pointer" />
                                <span className={`group-hover:text-pink-600 font-medium cursor-pointer transition-colors ${selectedPrice === '' ? 'text-pink-600' : ''}`}>Tất cả mức giá</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="radio" name="price" checked={selectedPrice === 'under500'} onChange={() => setSelectedPrice('under500')} className="w-4 h-4 text-pink-600 focus:ring-pink-500 cursor-pointer" />
                                <span className={`group-hover:text-pink-600 font-medium cursor-pointer transition-colors ${selectedPrice === 'under500' ? 'text-pink-600' : ''}`}>Dưới 500.000đ</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="radio" name="price" checked={selectedPrice === '500to1000'} onChange={() => setSelectedPrice('500to1000')} className="w-4 h-4 text-pink-600 focus:ring-pink-500 cursor-pointer" />
                                <span className={`group-hover:text-pink-600 font-medium cursor-pointer transition-colors ${selectedPrice === '500to1000' ? 'text-pink-600' : ''}`}>500.000đ - 1.000.000đ</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="radio" name="price" checked={selectedPrice === 'over1000'} onChange={() => setSelectedPrice('over1000')} className="w-4 h-4 text-pink-600 focus:ring-pink-500 cursor-pointer" />
                                <span className={`group-hover:text-pink-600 font-medium cursor-pointer transition-colors ${selectedPrice === 'over1000' ? 'text-pink-600' : ''}`}>Trên 1.000.000đ</span>
                            </label>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col gap-10 overflow-hidden">
                    
                    <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm hover:shadow-md border border-pink-200 flex items-center px-4 md:px-6 transition-all duration-300 focus-within:shadow-lg focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-100 relative group">
                        <svg className="w-7 h-7 text-pink-400 group-focus-within:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Nhập tên túi xách bạn muốn tìm kiếm..." 
                            className="w-full p-2 text-base md:text-lg outline-none text-gray-800 bg-transparent ml-3 placeholder-gray-400 font-medium"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        {searchName && (
                            <button onClick={() => setSearchName('')} className="absolute right-6 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                                ✖
                            </button>
                        )}
                    </div>

                    {/* TOP 10 BÁN CHẠY (SWIPER) */}
                    <section>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b-2 border-red-500 inline-block pb-1">
                            Top 10 Bán Chạy Nhất
                        </h2>
                        {bestSellers.length === 0 ? <p className="text-gray-500 italic py-10 text-center bg-white rounded-xl">Đang tải...</p> : (
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={24}
                                slidesPerView={1}
                                navigation
                                pagination={{ clickable: true, dynamicBullets: true }}
                                autoplay={{ delay: 3500, disableOnInteraction: false }}
                                breakpoints={{
                                    640: { slidesPerView: 2 },
                                    1024: { slidesPerView: 3 },
                                }}
                                className="pb-12" 
                            >
                                {bestSellers.map(product => (
                                    <SwiperSlide key={product._id} className="h-auto">
                                        <Link to={`/product/${product._id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 block group h-full flex flex-col overflow-hidden">
                                            <div className="relative w-full h-56 bg-gray-100 flex-shrink-0">
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20 shadow-sm">
                                                    Đã bán: {product.sold}
                                                </span>
                                                <img 
                                                    src={product.img} 
                                                    alt={product.name} 
                                                    onError={handleImageError}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 z-10" 
                                                />
                                            </div>
                                            <div className="p-4 flex flex-col flex-grow">
                                                <h3 className="text-base font-semibold text-gray-800 mb-1 truncate group-hover:text-pink-600 transition-colors">{product.name}</h3>
                                                <p className="text-red-500 font-bold mt-auto">{product.price}</p>
                                                <button className="mt-4 w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition duration-200">
                                                    Mua ngay
                                                </button>
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </section>

                    {/* TẤT CẢ SẢN PHẨM CÓ PHÂN TRANG */}
                    <section id="all-products-section">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b-2 border-pink-500 inline-block pb-1">
                            Tất Cả Sản Phẩm
                        </h2>
                        
                        {loading && page === 1 ? (
                            <p className="text-pink-600 font-bold py-10 text-center bg-white rounded-xl">Đang tải dữ liệu...</p>
                        ) : allProducts.length === 0 ? (
                            <p className="text-gray-500 italic py-10 text-center bg-white rounded-xl">Không tìm thấy sản phẩm phù hợp.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {allProducts.map(product => (
                                        <Link to={`/product/${product._id}`} key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-pink-50/50 block group flex flex-col overflow-hidden">
                                            <div className="relative w-full h-56 bg-pink-50 flex-shrink-0">
                                                <img 
                                                    src={product.img} 
                                                    alt={product.name} 
                                                    onError={handleImageError}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 z-10" 
                                                />
                                            </div>
                                            <div className="p-4 flex flex-col flex-grow">
                                                <h3 className="text-base font-semibold text-gray-800 mb-1 truncate group-hover:text-pink-600 transition-colors">{product.name}</h3>
                                                <p className="text-pink-600 font-bold mt-auto">{product.price}</p>
                                                <button className="mt-4 w-full bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition duration-200">
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-12">
                                        <button 
                                            onClick={() => handlePageChange(Math.max(page - 1, 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 rounded-lg border border-pink-200 text-pink-600 font-semibold hover:bg-pink-50 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-300"
                                        >
                                            &laquo; 
                                        </button>
                                        
                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNumber = index + 1;
                                            return (
                                                <button 
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`w-10 h-10 rounded-lg border font-bold transition-all duration-300 ${page === pageNumber ? 'bg-pink-600 text-white border-pink-600 shadow-md' : 'border-pink-200 text-pink-600 hover:bg-pink-50'}`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            )
                                        })}

                                        <button 
                                            onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 rounded-lg border border-pink-200 text-pink-600 font-semibold hover:bg-pink-50 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-300"
                                        >
                                             &raquo;
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default HomePage;