import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../util/axios.customize';
import { AuthContext } from '../components/context/auth.context';
import { notification } from 'antd';

const OrderDetailPage = () => {
    const { id } = useParams();
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0); 
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    const fetchOrderDetail = async () => {
        try {
            const res = await axios.get(`/v1/api/order/${id}`);
            if (res && res.errCode === 0 && res.data) {
                setOrder(res.data);
                calculateTimeLeft(res.data.createdAt);
            } else {
                notification.error({ message: "Lỗi", description: "Không tìm thấy đơn hàng tương ứng!" });
                navigate('/orders');
            }
        } catch (error) {
            console.error("Lỗi lấy chi tiết đơn hàng:", error);
            notification.error({ message: "Lỗi hệ thống", description: "Không thể tải thông tin đơn hàng." });
        }
        setLoading(false);
    };

    const calculateTimeLeft = (createdAtString) => {
        const createdAt = new Date(createdAtString);
        const expireTime = createdAt.getTime() + 30 * 60 * 1000; 
        const now = new Date().getTime();
        const difference = expireTime - now;

        if (difference > 0) {
            setTimeLeft(Math.floor(difference / 1000));
        } else {
            setTimeLeft(0);
        }
    };

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrderDetail();
    }, [id, auth, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} phút ${secs < 10 ? '0' : ''}${secs} giây`;
    };

    const formatPrice = (num) => {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            notification.warning({
                message: "Thiếu thông tin",
                description: "Vui lòng nhập lý do cụ thể để hệ thống ghi nhận!"
            });
            return;
        }

        try {
            const res = await axios.put(`/v1/api/order/${id}/cancel`, { cancelReason });
            if (res && res.errCode === 0) {
                notification.success({
                    message: "Thành công",
                    description: res.message
                });
                setShowCancelModal(false);
                setCancelReason('');
                fetchOrderDetail(); 
            } else {
                notification.error({ message: "Thao tác thất bại", description: res.message });
            }
        } catch (error) {
            console.error("Lỗi khi gọi API hủy đơn:", error);
            notification.error({ message: "Lỗi kết nối", description: "Có lỗi xảy ra trong quá trình xử lý." });
        }
    };

    if (loading) return <div className="text-center py-20 bg-slate-50 min-h-screen text-pink-600 font-semibold">Đang tải chi tiết đơn hàng...</div>;
    if (!order) return null;

    const steps = [
        { key: 'New', label: 'Đơn hàng mới' },
        { key: 'Confirmed', label: 'Đã xác nhận' },
        { key: 'Preparing', label: 'Đang chuẩn bị' },
        { key: 'Delivering', label: 'Đang giao hàng' },
        { key: 'Delivered', label: 'Giao thành công' }
    ];

    const currentStepIndex = steps.findIndex(s => s.key === order.status);
    const isCancelledFlow = order.status === 'Cancelled' || order.status === 'Cancel_Requested';

    return (
        <div className="bg-slate-50 min-h-screen py-10 font-sans">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Thanh điều hướng */}
                <div className="flex justify-between items-center mb-8">
                    <Link to="/orders" className="text-gray-500 hover:text-pink-600 font-bold flex items-center gap-2 transition text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Quay lại Đơn hàng của tôi
                    </Link>
                    <span className="text-xs text-gray-400 font-semibold bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                        Mã đơn: #{order._id.toUpperCase()}
                    </span>
                </div>

                {/* SƠ ĐỒ TRẠNG THÁI */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    {isCancelledFlow ? (
                        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-center">
                            <p className="text-red-600 font-extrabold text-xl tracking-wide">
                                {order.status === 'Cancel_Requested' ? '⏳ ĐƠN HÀNG ĐANG CHỜ SHOP DUYỆT HỦY' : '❌ ĐƠN HÀNG ĐÃ HỦY THÀNH CÔNG'}
                            </p>
                            {order.cancelReason && (
                                <p className="text-gray-600 text-sm mt-2 font-medium">Lý do: "{order.cancelReason}"</p>
                            )}
                        </div>
                    ) : (
                        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 mt-4 px-4">
                            <div className="absolute hidden md:block left-10 right-10 top-5 h-1 bg-gray-100 z-0"></div>
                            
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                return (
                                    <div key={step.key} className="flex flex-col items-center relative z-10 w-full md:w-auto">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${
                                            isCurrent 
                                                ? 'bg-pink-600 text-white ring-4 ring-pink-100' 
                                                : isCompleted 
                                                    ? 'bg-pink-500 text-white' 
                                                    : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            {isCompleted && !isCurrent ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-xs md:text-sm font-semibold mt-3 text-center transition-colors ${
                                            isCurrent ? 'text-pink-600 font-bold text-base' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* BỐ CỤC CỘT */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* CỘT TRÁI: SẢN PHẨM & ĐỊA CHỈ */}
                    <div className="md:col-span-7 flex flex-col gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">Chi tiết sản phẩm</h3>
                            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center gap-4 border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="truncate">
                                                <h4 className="font-bold text-gray-800 text-sm md:text-base truncate mb-1">{item.name}</h4>
                                                <p className="text-gray-500 text-xs font-semibold">Số lượng: x{item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-800 font-semibold text-base whitespace-nowrap">
                                            {formatPrice(item.price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">Thông tin nhận hàng</h3>
                            <div className="flex flex-col gap-3 text-sm md:text-base text-gray-600 font-medium">
                                <p><span className="text-gray-400">Người nhận:</span> <span className="text-gray-800 font-bold ml-1">{order.shippingInfo.fullName}</span></p>
                                <p><span className="text-gray-400">Điện thoại:</span> <span className="text-gray-800 font-semibold ml-1">{order.shippingInfo.phone}</span></p>
                                <p><span className="text-gray-400">Địa chỉ:</span> <span className="text-gray-800 ml-1 leading-relaxed">{order.shippingInfo.address}</span></p>
                                <p><span className="text-gray-400">Thanh toán:</span> <span className="text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full text-xs font-bold ml-1">{order.paymentMethod}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: HOÁ ĐƠN & LOGIC BUTTON HỦY */}
                    <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-pink-200 flex flex-col gap-5 sticky top-24 box-border">
                        <h3 className="font-bold text-gray-800 text-lg pb-3 border-b border-gray-100">Hóa đơn tóm tắt</h3>
                        
                        {/* Đã cập nhật lại khu vực tính tiền hiển thị Voucher */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm md:text-base text-gray-600 font-medium">
                                <span>Tổng tiền hàng:</span>
                                <span className="font-bold text-gray-800">{formatPrice(order.originalAmount || order.totalAmount)}</span>
                            </div>
                            
                            {/* Chỉ hiển thị dòng này nếu đơn hàng có giảm giá */}
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between items-center text-sm md:text-base text-green-600 font-semibold">
                                    <span>Giảm giá {order.voucherCode ? `(${order.voucherCode})` : ''}:</span>
                                    <span>- {formatPrice(order.discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm md:text-base text-gray-600 font-medium">
                                <span>Phí vận chuyển:</span>
                                <span className="text-green-600 font-bold">Miễn phí</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-base">Thành tiền:</span>
                            <span className="text-2xl font-black text-pink-600">{formatPrice(order.totalAmount)}</span>
                        </div>

                        {/* KIỂM TRA ĐIỀU KIỆN HIỂN THỊ BUTTON (Chỉ xuất hiện ở Bước 1, 2, 3) */}
                        {(order.status === 'New' || order.status === 'Confirmed' || order.status === 'Preparing') && (
                            <div className="mt-2 pt-4 border-t border-gray-100">
                                
                                {/* Kịch bản 1 & 2: Đơn đang ở Bước 1 hoặc Bước 2 */}
                                {(order.status === 'New' || order.status === 'Confirmed') && (
                                    timeLeft > 0 ? (
                                        <div className="flex flex-col gap-3 animate-fade-in">
                                            <div className="bg-red-50 text-red-800 rounded-xl p-3 text-center text-xs font-semibold">
                                                ⏱️ Bạn còn <span className="text-red-600 font-black">{formatTime(timeLeft)}</span> để tự hủy đơn.
                                            </div>
                                            <button 
                                                onClick={() => setShowCancelModal(true)}
                                                className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-red-200"
                                            >
                                                Hủy Đơn Hàng
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 animate-fade-in">
                                            <div className="bg-gray-50 text-gray-500 rounded-xl p-3 text-center text-xs font-semibold border border-gray-200">
                                                🔒 Đã quá 30 phút, hệ thống đã khóa chức năng tự hủy đơn.
                                            </div>
                                            <button 
                                                disabled
                                                className="w-full bg-gray-100 text-gray-400 font-extrabold py-3.5 rounded-xl text-sm border border-gray-200 cursor-not-allowed opacity-70"
                                            >
                                                Hủy Đơn Hàng
                                            </button>
                                        </div>
                                    )
                                )}

                                {/* Kịch bản 3: Đơn đã sang Bước 3 (Đang chuẩn bị) */}
                                {order.status === 'Preparing' && (
                                    <div className="flex flex-col gap-3 animate-fade-in">
                                        <div className="bg-orange-50 text-orange-800 rounded-xl p-3 text-center text-xs font-semibold">
                                            📦 Shop đang đóng gói. Cần xác nhận từ Shop để hủy.
                                        </div>
                                        <button 
                                            onClick={() => setShowCancelModal(true)}
                                            className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 font-extrabold py-3.5 rounded-xl text-sm transition-all"
                                        >
                                            Gửi Yêu Cầu Hủy Đơn
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL NHẬP LÝ DO (Dùng chung cho cả 2 loại Hủy) */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                            <h4 className="text-xl font-bold text-gray-900 mb-3">
                                {order.status === 'Preparing' ? 'Gửi Yêu Cầu Hủy Đơn' : 'Xác Nhận Hủy Đơn'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-5 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                {order.status === 'Preparing' 
                                    ? 'Đơn hàng đang được chuẩn bị. Vui lòng cho Shop biết lý do bạn muốn hủy đơn để Shop hỗ trợ duyệt nhanh nhất nhé.' 
                                    : 'Đơn hàng sẽ được hủy ngay lập tức và số lượng sản phẩm sẽ được hoàn lại vào kho.'}
                            </p>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Lý do hủy đơn <span className="text-red-500">*</span></label>
                                <textarea 
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm resize-none transition-shadow bg-gray-50/50"
                                    placeholder="Ví dụ: Tôi muốn đổi địa chỉ giao hàng..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button 
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                    }}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Đóng Lại
                                </button>
                                <button 
                                    onClick={handleCancelOrder}
                                    className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md ${
                                        order.status === 'Preparing' 
                                            ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' 
                                            : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                    }`}
                                >
                                    {order.status === 'Preparing' ? 'Gửi Yêu Cầu' : 'Chắc Chắn Hủy'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OrderDetailPage;