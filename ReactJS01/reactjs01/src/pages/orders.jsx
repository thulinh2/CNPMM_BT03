import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../util/axios.customize';
import { AuthContext } from '../components/context/auth.context';

const OrdersPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [auth, navigate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/v1/api/orders');
            if (res && res.errCode === 0 && res.data) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
        }
        setLoading(false);
    };

    const formatPrice = (num) => {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    };

    // Hàm chuyển đổi tiếng Anh sang tiếng Việt và gán màu sắc cho từng Trạng thái
    const getStatusDisplay = (status) => {
        switch(status) {
            case 'New': return { text: 'Chờ xác nhận', style: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'Confirmed': return { text: 'Đã xác nhận', style: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
            case 'Preparing': return { text: 'Đang chuẩn bị', style: 'text-yellow-600 bg-yellow-50 border-yellow-100' };
            case 'Delivering': return { text: 'Đang giao hàng', style: 'text-orange-600 bg-orange-50 border-orange-100' };
            case 'Delivered': return { text: 'Hoàn thành', style: 'text-green-600 bg-green-50 border-green-100' };
            case 'Cancel_Requested': return { text: 'Yêu cầu hủy', style: 'text-red-500 bg-red-50 border-red-100' };
            case 'Cancelled': return { text: 'Đã hủy', style: 'text-red-600 bg-red-50 border-red-100' };
            default: return { text: status, style: 'text-gray-600 bg-gray-50 border-gray-100' };
        }
    };

    // Lọc đơn hàng theo Tab đang chọn
    const filteredOrders = activeTab === 'All' 
        ? orders 
        : orders.filter(o => {
            // Gom chung "Cancel_Requested" vào tab "Đã hủy" cho gọn UI
            if (activeTab === 'Cancelled') return o.status === 'Cancelled' || o.status === 'Cancel_Requested';
            return o.status === activeTab;
        });

    // Danh sách các Tab
    const tabs = [
        { key: 'All', label: 'Tất cả' },
        { key: 'New', label: 'Chờ xác nhận' },
        { key: 'Preparing', label: 'Đang chuẩn bị' },
        { key: 'Delivering', label: 'Đang giao' },
        { key: 'Delivered', label: 'Hoàn thành' },
        { key: 'Cancelled', label: 'Đã hủy' }
    ];

    if (loading) return <div className="text-center py-20 bg-slate-50 min-h-screen text-pink-600 font-semibold">Đang tải lịch sử đơn hàng...</div>;

    return (
        <div className="bg-slate-50 min-h-screen py-10 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 border-l-4 border-pink-600 pl-4">
                    Đơn hàng của tôi 
                </h2>

                {/* THANH TABS TRẠNG THÁI */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mt-6 mb-10 overflow-x-auto scrollbar-none flex gap-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 ${
                                activeTab === tab.key 
                                    ? 'bg-pink-600 text-white shadow-md shadow-pink-100' 
                                    : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* DANH SÁCH ĐƠN HÀNG */}
                <div className="flex flex-col gap-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center gap-4">
                            <div className="text-gray-300 text-6xl">📦</div>
                            <p className="text-gray-500 font-medium text-lg">Chưa có đơn hàng nào ở trạng thái này.</p>
                            <Link to="/" className="text-pink-600 font-bold hover:underline">Tiếp tục mua sắm</Link>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const statusUI = getStatusDisplay(order.status);
                            const canRepurchase = ['Delivered', 'Cancelled', 'Cancel_Requested'].includes(order.status);

                            return (
                                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300">
                                    
                                    {/* Tiêu đề thẻ đơn hàng */}
                                    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-800">Đơn hàng: #{order._id.slice(-8).toUpperCase()}</span>
                                            <span className="text-sm text-gray-400 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusUI.style} flex items-center gap-1.5`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {statusUI.text.toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Danh sách sản phẩm */}
                                    <div className="p-6 flex flex-col gap-4 max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center gap-4 border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">{item.name}</h4>
                                                        <p className="text-gray-500 text-sm font-medium mt-1">Số lượng: x{item.quantity}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Khu vực chứa Giá tiền & Text Link Mua Lại */}
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className="text-gray-800 font-semibold text-sm md:text-base whitespace-nowrap">
                                                        {formatPrice(item.price)}
                                                    </span>
                                                    
                                                    {canRepurchase && (
                                                        <button 
                                                            onClick={() => navigate(`/product/${item.productId}`)}
                                                            className="text-sm font-semibold text-pink-600 hover:text-pink-800 underline underline-offset-2 transition-colors cursor-pointer"
                                                        >
                                                            Mua lại
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer thẻ đơn hàng */}
                                    <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50/30 flex-wrap gap-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-medium text-gray-500">Thành tiền:</span>
                                            <span className="text-xl font-black text-pink-600">{formatPrice(order.totalAmount)}</span>
                                        </div>
                                        
                                        {/* Cập nhật Button "Xem chi tiết" theo chuẩn thiết kế mới */}
                                        <button 
                                            onClick={() => navigate(`/order/${order._id}`)}
                                            className="px-8 py-2.5 bg-pink-600 text-white font-semibold rounded-full hover:bg-pink-500 transition-colors cursor-pointer shadow-sm"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;