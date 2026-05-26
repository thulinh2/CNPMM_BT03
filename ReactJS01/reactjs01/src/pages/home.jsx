import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    
    // Quản lý các bộ lọc đặc biệt
    const [isNewFilter, setIsNewFilter] = useState(false);
    const [isSaleFilter, setIsSaleFilter] = useState(false); // STATE MỚI: Dành cho Khuyến mãi
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const categoryRef = useRef(null);
    const filterRef = useRef(null);
    const location = useLocation();

    // Reset toàn bộ bộ lọc khi ấn Logo/Trang chủ
    useEffect(() => {
        if (location.pathname === '/') {
            setSearchName('');
            setSelectedCategory('');
            setSelectedPrice('');
            setIsNewFilter(false);
            setIsSaleFilter(false); // Reset luôn cả khuyến mãi
            setPage(1);
        }
    }, [location.key]); 

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset trang 1 khi đổi bộ lọc
    useEffect(() => {
        setPage(1);
    }, [searchName, selectedCategory, selectedPrice, isNewFilter, isSaleFilter]);

    // Gọi API lấy Danh Mục
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
                
                if (isNewFilter) params.append('isNewProduct', 'true');
                // Gửi cờ báo đang lọc hàng Khuyến Mãi lên Backend
                if (isSaleFilter) params.append('isSale', 'true'); 
                
                params.append('page', page);
                params.append('limit', 8);

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
    }, [searchName, selectedCategory, selectedPrice, isNewFilter, isSaleFilter, page]);

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

    // Hàm render giá thông minh
    const renderPrice = (priceStr, discount, defaultColorClass = 'text-pink-600') => {
        if (!discount || discount === 0) {
            return <p className={`${defaultColorClass} font-bold mt-auto`}>{priceStr}</p>;
        }
        const priceNumber = parseInt(priceStr.replace(/\./g, '').replace(/,/g, '').replace('đ', '').trim());
        const discountedNumber = priceNumber * (1 - discount / 100);
        const discountedStr = discountedNumber.toLocaleString('vi-VN') + 'đ';

        return (
            <div className="flex items-center gap-2 mt-auto">
                <span className="text-red-500 font-bold text-lg">{discountedStr}</span>
                <span className="text-slate-400 font-medium line-through text-sm">{priceStr}</span>
            </div>
        );
    };

    // Hàm tự động đổi Tiêu đề nội dung
    const getSectionTitle = () => {
        if (isSaleFilter) return 'Sản Phẩm Khuyến Mãi'; // Thêm tiêu đề khi click Khuyến Mãi
        if (isNewFilter) return 'Hàng Mới Về';
        if (searchName) return 'Kết Quả Tìm Kiếm';
        if (selectedCategory) {
            const cat = categories.find(c => c.name === selectedCategory);
            return cat ? cat.displayName : 'Kết Quả Lọc';
        }
        if (selectedPrice) return 'Kết Quả Lọc Giá';
        return 'Tất Cả Sản Phẩm';
    };

    return (
        <div className="bg-rose-50/50 min-h-screen font-sans pb-16">
            
            {/* 1. BANNER CHÍNH */}
            <div className="bg-pink-600 text-white text-center py-16 px-4">
                <h1 className="text-4xl font-bold mb-4">Bộ Sưu Tập Túi Xách Mùa Mới!</h1>
                <p className="text-xl mb-8">Tự tin tỏa sáng. Giảm ngay 10%.</p>
                <Link 
                    to="/collection"
                    className="inline-block bg-white text-pink-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300 shadow-md"
                >
                    Săn Sale Ngay
                </Link>
            </div>

            {/* 2. HEADER PHỤ: DANH MỤC, HÀNG MỚI & KHUYẾN MÃI */}
            <div className="bg-white shadow-sm border-b border-pink-100 sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-8">
                    
                    {/* Danh Mục */}
                    <div className="relative" ref={categoryRef}>
                        <button 
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className={`transition-colors px-2 py-1 text-lg uppercase tracking-wide ${(!isNewFilter && !isSaleFilter && selectedCategory !== '') ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'}`}
                        >
                            DANH MỤC SẢN PHẨM
                        </button>

                        {isCategoryOpen && (
                            <div className="absolute left-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-pink-100 p-2 z-50">
                                {categories.map((cat, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => { 
                                            setSelectedCategory(cat.name); 
                                            setIsNewFilter(false); 
                                            setIsSaleFilter(false); // Xóa lọc khuyến mãi khi chọn danh mục
                                            setIsCategoryOpen(false); 
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${selectedCategory === cat.name && !isNewFilter && !isSaleFilter ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'}`}
                                    >
                                        {cat.displayName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hàng Mới */}
                    <button 
                        onClick={() => {
                            setIsNewFilter(true);
                            setIsSaleFilter(false);  // Xóa lọc khuyến mãi
                            setSelectedCategory(''); 
                            setSearchName('');       
                        }}
                        className={`transition-colors px-2 py-1 text-lg uppercase tracking-wide ${isNewFilter ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'}`}
                    >
                        Hàng Mới
                    </button>

                    {/* NÚT KHUYẾN MÃI MỚI THÊM */}
                    <button 
                        onClick={() => {
                            setIsSaleFilter(true);
                            setIsNewFilter(false);   // Xóa lọc Hàng mới
                            setSelectedCategory(''); // Xóa lọc Danh mục
                            setSearchName('');       // Xóa Tìm kiếm
                        }}
                        className={`transition-colors px-2 py-1 text-lg uppercase tracking-wide ${isSaleFilter ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'}`}
                    >
                        Khuyến Mãi
                    </button>

                </div>
            </div>

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
                
                {/* 3. THANH TÌM KIẾM & LỌC GIÁ */}
                <div className="flex flex-col md:flex-row gap-4 items-center relative z-30">
                    
                    <div className="flex-1 w-full bg-white p-2 rounded-xl shadow-sm border border-pink-200 flex items-center px-4 transition-all focus-within:border-pink-500">
                        <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Nhập tên túi xách bạn muốn tìm kiếm..." 
                            className="w-full p-1.5 text-base outline-none text-gray-800 bg-transparent ml-2 placeholder-gray-400 font-medium"
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                if(isNewFilter) setIsNewFilter(false);
                                if(isSaleFilter) setIsSaleFilter(false);
                            }}
                        />
                        {searchName && (
                            <button onClick={() => setSearchName('')} className="text-gray-400 hover:text-red-500">✖</button>
                        )}
                    </div>

                    <div className="relative w-full md:w-auto" ref={filterRef}>
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full md:w-auto flex items-center justify-between gap-2 bg-white px-5 py-3 rounded-xl shadow-sm border border-pink-200 text-gray-800 font-bold hover:border-pink-500 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-pink-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                                </svg>
                                Lọc Giá
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-pink-100 p-4 z-50">
                                <h4 className="font-bold text-gray-900 mb-3 border-b border-pink-50 pb-2">Chọn mức giá</h4>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { value: '', label: 'Tất cả mức giá' },
                                        { value: 'under500', label: 'Dưới 500.000đ' },
                                        { value: '500to1000', label: '500.000đ - 1.000.000đ' },
                                        { value: 'over1000', label: 'Trên 1.000.000đ' }
                                    ].map((item, index) => (
                                        <label key={index} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="radio" name="price" 
                                                checked={selectedPrice === item.value} 
                                                onChange={() => { setSelectedPrice(item.value); setIsFilterOpen(false); }} 
                                                className="w-4 h-4 text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-600" 
                                            />
                                            <span className={`text-sm font-medium transition-colors cursor-pointer ${selectedPrice === item.value ? 'text-pink-600' : 'text-gray-700 group-hover:text-pink-600'}`}>
                                                {item.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. TOP 10 BÁN CHẠY (SWIPER) - Bổ sung thêm điều kiện !isSaleFilter */}
                {!selectedCategory && !isNewFilter && !isSaleFilter && !searchName && (
                    <section>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="bg-pink-500 w-1.5 h-6 rounded-full inline-block"></span>
                            Top 10 Bán Chạy Nhất
                        </h2>
                        {bestSellers.length === 0 ? <p className="text-gray-500 py-4">Đang tải...</p> : (
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={24}
                                slidesPerView={1}
                                navigation
                                pagination={{ clickable: true, dynamicBullets: true }}
                                autoplay={{ delay: 3500, disableOnInteraction: false }}
                                breakpoints={{
                                    640: { slidesPerView: 2 },
                                    768: { slidesPerView: 3 },
                                    1024: { slidesPerView: 4 }
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
                                                {product.discount > 0 && (
                                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20 shadow-sm">
                                                        -{product.discount}%
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
                                                <h3 className="text-base font-semibold text-gray-800 mb-1 truncate group-hover:text-pink-600 transition-colors">{product.name}</h3>
                                                {renderPrice(product.price, product.discount, 'text-red-500')}
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
                )}

                {/* 5. KHỐI TẤT CẢ SẢN PHẨM / KẾT QUẢ LỌC */}
                <section id="all-products-section">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                        <span className="bg-pink-500 w-1.5 h-6 rounded-full inline-block"></span>
                        {getSectionTitle()}
                    </h2>
                    
                    {loading && page === 1 ? (
                        <p className="text-pink-600 font-bold py-10 text-center bg-white rounded-xl">Đang tải dữ liệu...</p>
                    ) : allProducts.length === 0 ? (
                        <p className="text-gray-500 italic py-10 text-center bg-white rounded-xl border border-pink-100">Không tìm thấy sản phẩm phù hợp.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {allProducts.map(product => (
                                    <Link to={`/product/${product._id}`} key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-pink-50/50 block group flex flex-col overflow-hidden">
                                        <div className="relative w-full h-56 bg-pink-50 flex-shrink-0">
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
                                            <h3 className="text-base font-semibold text-gray-800 mb-1 truncate group-hover:text-pink-600 transition-colors">{product.name}</h3>
                                            {renderPrice(product.price, product.discount, 'text-pink-600')}
                                            <button className="mt-4 w-full bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition duration-200">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            
                            {/* Phân Trang */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-12">
                                    <button 
                                        onClick={() => handlePageChange(Math.max(page - 1, 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 rounded-lg border border-pink-200 text-pink-600 font-semibold hover:bg-pink-50 disabled:opacity-30 transition-all duration-300"
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
                                        className="px-4 py-2 rounded-lg border border-pink-200 text-pink-600 font-semibold hover:bg-pink-50 disabled:opacity-30 transition-all duration-300"
                                    >
                                         &raquo;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default HomePage;