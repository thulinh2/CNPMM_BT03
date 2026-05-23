import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../util/axios.customize';
import { AuthContext } from '../components/context/auth.context';

const CartPage = () => {
    const { auth } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Gọi API lấy thông tin giỏ hàng khi vừa mở trang
    const fetchCartData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/v1/api/cart');
            if (res && res.errCode === 0 && res.data) {
                setCartItems(res.data.items || []);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin giỏ hàng:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchCartData();
        }
    }, [auth]);

    // 2. Xử lý tăng/giảm số lượng món đồ
    const handleUpdateQuantity = async (productId, currentQty, action) => {
        let newQty = action === 'increase' ? currentQty + 1 : currentQty - 1;
        
        if (newQty < 1) return; 

        try {
            const res = await axios.put('/v1/api/cart', { productId, quantity: newQty });
            if (res && res.errCode === 0) {
                setCartItems(prev => prev.map(item => 
                    item.productId === productId ? { ...item, quantity: newQty } : item
                ));
            }
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
        }
    };

    // 3. Xử lý xóa sản phẩm ra khỏi giỏ
    const handleDeleteItem = async (productId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            try {
                const res = await axios.delete(`/v1/api/cart/${productId}`);
                if (res && res.errCode === 0) {
                    setCartItems(prev => prev.filter(item => item.productId !== productId));
                }
            } catch (error) {
                console.error("Lỗi khi xóa sản phẩm:", error);
            }
        }
    };

    // 4. Hàm tự động tính tổng tiền
    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const formatPrice = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    };

    if (!auth.isAuthenticated) {
        return (
            <div className="text-center py-20 bg-rose-50/30 min-h-screen flex flex-col justify-center items-center gap-4">
                <p className="text-gray-500 font-medium text-lg">Vui lòng đăng nhập để xem giỏ hàng của bạn!</p>
                <Link to="/login" className="bg-pink-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-pink-700 transition">Đăng Nhập Ngay</Link>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-20 text-pink-600 font-semibold bg-rose-50/30 min-h-screen">Đang tải giỏ hàng của bạn...</div>;
    }

    return (
        <div className="bg-rose-50/30 min-h-screen py-12 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-l-4 border-pink-600 pl-4">
                    Giỏ Hàng Của Bạn
                </h2>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-12 text-center flex flex-col items-center gap-5">
                        <div className="text-gray-300 text-6xl">🛒</div>
                        <p className="text-gray-500 font-medium text-lg">Giỏ hàng của bạn đang trống rỗng.</p>
                        <Link to="/" className="bg-pink-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-pink-700 transition shadow-md shadow-pink-100">
                            Tiếp Tục Mua Sắm
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* DANH SÁCH MÓN ĐỒ */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-4">
                            {cartItems.map((item) => (
                                <div key={item.productId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group transition-all duration-300 hover:shadow-md">
                                    
                                    {/* 1. ĐÃ BỌC LINK VÀO HÌNH ẢNH SẢN PHẨM */}
                                    <Link 
                                        to={`/product/${item.productId}`} 
                                        className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 block hover:opacity-80 transition-opacity"
                                    >
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                    </Link>
                                    
                                    <div className="flex-1 min-w-0">
                                        {/* 2. ĐÃ BỌC LINK VÀO TÊN SẢN PHẨM */}
                                        <Link to={`/product/${item.productId}`} className="block w-max max-w-full">
                                            <h3 className="font-bold text-gray-800 truncate text-base mb-1 hover:text-pink-600 transition-colors">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <p className="text-pink-600 font-bold text-sm">{formatPrice(item.price)}</p>
                                    </div>

                                    {/* Nút bấm tăng giảm số lượng */}
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, 'decrease')}
                                            className="px-3 py-2 hover:bg-gray-100 text-gray-500 transition"
                                        >
                                            {/* SVG Icon Trừ */}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                            </svg>
                                        </button>
                                        <span className="px-3 font-semibold text-gray-700 text-sm w-8 text-center bg-white border-l border-r border-gray-200 h-full py-1.5">
                                            {item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, 'increase')}
                                            className="px-3 py-2 hover:bg-gray-100 text-gray-500 transition"
                                        >
                                            {/* SVG Icon Cộng */}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Nút xóa món đồ */}
                                    <button 
                                        onClick={() => handleDeleteItem(item.productId)}
                                        className="text-gray-400 hover:text-red-500 p-2.5 rounded-lg hover:bg-red-50 transition duration-300 flex-shrink-0 ml-2"
                                        title="Xóa khỏi giỏ"
                                    >
                                        {/* SVG Icon Thùng Rác */}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* KHUNG TỔNG TIỀN (Giữ nguyên y hệt file bạn cung cấp) */}
                        <div className="w-full lg:w-[35%] bg-white px-6 py-8 rounded-2xl shadow-sm border border-pink-200 flex flex-col gap-6 sticky top-24 box-border">
                            
                            <h3 className="text-xl font-bold text-gray-800 pb-4 border-b border-gray-100">
                                Tóm tắt đơn hàng
                            </h3>
                            
                            <div className="flex justify-between items-center text-base text-gray-600">
                                <span>Số lượng sản phẩm:</span>
                                <span className="font-semibold text-gray-800">
                                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} cái
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-base text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span className="text-green-600 font-medium">
                                    Miễn phí
                                </span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-6 mt-2 flex justify-between items-center gap-2">
                                <span className="font-bold text-gray-800 text-lg whitespace-nowrap">Tổng tiền dự kiến:</span>
                                <span className="text-2xl font-black text-pink-600 text-right">
                                    {formatPrice(calculateTotal())}
                                </span>
                            </div>

                            <Link 
                                to="/checkout" 
                                className="w-full bg-pink-600 text-white text-center py-4 rounded-xl font-bold text-xl hover:bg-pink-700 transition shadow-lg shadow-pink-100 block mt-2"
                            >
                                Thanh Toán
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;