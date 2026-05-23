import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../util/axios.customize';
import { AuthContext } from '../components/context/auth.context';
import { notification } from 'antd';

const CheckoutPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 1. Thêm State quản lý Voucher
    const [voucherInput, setVoucherInput] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState({ code: '', discountAmount: 0 });
    
    // State lưu thông tin giao hàng
    const [shippingInfo, setShippingInfo] = useState({
        fullName: auth?.user?.name || '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCartData();
    }, [auth, navigate]);

    const fetchCartData = async () => {
        try {
            const res = await axios.get('/v1/api/cart');
            if (res && res.errCode === 0 && res.data) {
                if (!res.data.items || res.data.items.length === 0) {
                    navigate('/cart');
                } else {
                    setCartItems(res.data.items);
                }
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin giỏ hàng:", error);
        }
        setLoading(false);
    };

    // 2. Tách hàm tính Tạm tính và Tổng thanh toán cuối cùng
    const calculateSubTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateFinalTotal = () => {
        const subTotal = calculateSubTotal();
        const final = subTotal - appliedVoucher.discountAmount;
        return final > 0 ? final : 0; // Không để tổng tiền bị âm
    };

    const formatPrice = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo({ ...shippingInfo, [name]: value });
    };

    // 3. Hàm xử lý nút "Áp dụng" mã giảm giá
    const handleApplyVoucher = async () => {
        if (!voucherInput.trim()) {
            notification.warning({ message: "Thiếu thông tin", description: "Vui lòng nhập mã giảm giá!" });
            return;
        }

        try {
            const res = await axios.post('/v1/api/voucher/check', {
                code: voucherInput,
                orderValue: calculateSubTotal() // Gửi tổng tiền lên để kiểm tra xem có đủ điều kiện áp dụng không
            });
            
            if (res && res.errCode === 0) {
                notification.success({ message: "Áp dụng thành công", description: res.message });
                setAppliedVoucher({
                    code: res.data.voucherCode,
                    discountAmount: res.data.discountAmount
                });
            } else {
                notification.error({ message: "Lỗi mã giảm giá", description: res.message });
                // Reset nếu mã sai
                setAppliedVoucher({ code: '', discountAmount: 0 });
            }
        } catch (error) {
            notification.error({
                message: "Không thành công",
                description: error?.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn."
            });
            setAppliedVoucher({ code: '', discountAmount: 0 });
        }
    };

    // Hủy bỏ mã đã áp dụng
    const handleRemoveVoucher = () => {
        setVoucherInput('');
        setAppliedVoucher({ code: '', discountAmount: 0 });
    };

    // 4. Xử lý khi bấm nút Đặt hàng (Kẹp thêm voucherCode)
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
            notification.warning({
                message: "Thiếu thông tin",
                description: "Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!"
            });
            return;
        }

        try {
            const orderData = {
                shippingInfo,
                paymentMethod: 'COD',
                voucherCode: appliedVoucher.code // Gửi kèm mã Voucher xuống Backend
            };
            
            const res = await axios.post('/v1/api/order', orderData);
            
            if (res && res.errCode === 0) {
                notification.success({
                    message: "Đặt hàng thành công!",
                    description: "Đơn hàng của bạn sẽ được thanh toán khi nhận hàng (COD)."
                });
                navigate('/orders'); // Cập nhật: Đặt xong chuyển sang trang Lịch sử đơn hàng
            } else {
                notification.error({
                    message: "Lỗi đặt hàng",
                    description: res.message || "Có lỗi xảy ra, vui lòng thử lại."
                });
            }
        } catch (error) {
            notification.error({
                message: "Lỗi hệ thống",
                description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
            });
        }
    };

    if (loading) return <div className="text-center py-20 bg-slate-50 min-h-screen text-pink-600 font-semibold">Đang chuẩn bị trang thanh toán...</div>;

    return (
        <div className="bg-slate-50 min-h-screen py-10 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-l-4 border-pink-600 pl-4">
                    Thanh Toán Đơn Hàng
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    
                    {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
                    <div className="lg:col-span-7 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">Thông tin nhận hàng</h3>
                        
                        <form className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input 
                                    type="text" 
                                    name="fullName"
                                    value={shippingInfo.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition" 
                                    placeholder="Nhập họ và tên người nhận"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={shippingInfo.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition" 
                                    placeholder="Nhập số điện thoại liên hệ"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng chi tiết</label>
                                <textarea 
                                    name="address"
                                    value={shippingInfo.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition resize-none" 
                                    placeholder="Ví dụ: Số 1 Võ Văn Ngân, Phường Linh Chiểu, TP Thủ Đức"
                                ></textarea>
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                    Phương thức thanh toán hiện tại chỉ áp dụng Thanh toán khi nhận hàng (COD).
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                    <div className="lg:col-span-5 bg-white px-6 py-8 rounded-2xl shadow-sm border border-pink-200 flex flex-col gap-6 sticky top-24 box-border">
                        <h3 className="text-xl font-bold text-gray-800 pb-4 border-b border-gray-100">
                            Đơn hàng của bạn
                        </h3>
                        
                        <div className="flex flex-col gap-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-200">
                            {cartItems.map(item => (
                                <div key={item.productId} className="flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 overflow-hidden">
                                            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-semibold text-gray-800 truncate mb-0.5">{item.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">Số lượng: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-pink-600 whitespace-nowrap">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* --- GIAO DIỆN MÃ GIẢM GIÁ --- */}
                        <div className="py-4 border-t border-dashed border-gray-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Mã giảm giá / Voucher</label>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={voucherInput}
                                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                                    placeholder="Ví dụ: GIAM50K hoặc SALE10"
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 font-medium uppercase"
                                    disabled={appliedVoucher.code !== ''} // Khóa ô nhập nếu đã áp dụng
                                />
                                {appliedVoucher.code ? (
                                    <button 
                                        onClick={handleRemoveVoucher}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition whitespace-nowrap"
                                    >
                                        Hủy mã
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleApplyVoucher}
                                        className="px-5 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition whitespace-nowrap shadow-sm"
                                    >
                                        Áp dụng
                                    </button>
                                )}
                            </div>
                            
                            {/* Thông báo áp dụng thành công */}
                            {appliedVoucher.code && (
                                <p className="text-green-600 text-sm mt-3 font-semibold flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                    </svg>
                                    Tuyệt vời! Bạn được giảm {formatPrice(appliedVoucher.discountAmount)}
                                </p>
                            )}
                        </div>

                        {/* --- BẢNG TÍNH TIỀN --- */}
                        <div className="border-t border-dashed border-gray-200 pt-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Tạm tính:</span>
                                <span className="font-semibold text-gray-800">{formatPrice(calculateSubTotal())}</span>
                            </div>
                            
                            {appliedVoucher.discountAmount > 0 && (
                                <div className="flex justify-between items-center text-green-600 font-semibold">
                                    <span>Giảm giá:</span>
                                    <span>- {formatPrice(appliedVoucher.discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span className="font-semibold text-gray-800">Miễn phí</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-end gap-2">
                            <span className="font-bold text-gray-800 text-lg whitespace-nowrap">Tổng thanh toán:</span>
                            <span className="text-3xl font-black text-pink-600 text-right">
                                {formatPrice(calculateFinalTotal())}
                            </span>
                        </div>

                        <button 
                            onClick={handlePlaceOrder}
                            className="w-full bg-pink-600 text-white text-center py-4 rounded-xl font-bold text-xl hover:bg-pink-700 transition shadow-lg shadow-pink-100 mt-2 flex justify-center items-center gap-2"
                        >
                            Đặt Hàng (COD)
                        </button>
                        
                        <Link to="/cart" className="text-center text-sm text-gray-500 hover:text-pink-600 font-medium transition flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                            Quay lại giỏ hàng sửa đổi
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;