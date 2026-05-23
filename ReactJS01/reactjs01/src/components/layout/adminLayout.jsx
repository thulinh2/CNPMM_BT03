import React, { useContext, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import axios from '../../util/axios.customize';
import { Spin } from 'antd';
import { 
    ShoppingOutlined, 
    TeamOutlined, 
    LogoutOutlined, 
    UserOutlined 
} from '@ant-design/icons';

const AdminLayout = () => {
    const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Gọi lại API khi reload trang ở Admin
    useEffect(() => {
        const fetchAccount = async () => {
            if (!auth.isAuthenticated) {
                setAppLoading(true);
                try {
                    const res = await axios.get(`/v1/api/account`);
                    if (res && !res.message) {
                        setAuth({
                            isAuthenticated: true,
                            user: {
                                email: res.email,
                                name: res.name,
                                role: res.role 
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
                setAppLoading(false);
            }
        };
        fetchAccount();
    }, [auth.isAuthenticated, setAuth, setAppLoading]);

    if (appLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
            </div>
        );
    }

    // Sau khi chờ xong, nếu không phải Admin thì đưa ra ngoài
    if (!auth.isAuthenticated || auth.user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-5xl mb-4">⛔</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Truy cập bị từ chối</h2>
                    <p className="text-gray-600 mb-6 font-medium">Bạn không có quyền truy cập vào khu vực Quản trị.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-6 py-2.5 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setAuth({
            isAuthenticated: false,
            user: { email: "", name: "", role: "" }
        });
        navigate("/login");
    };

    const menuItems = [
        { path: '/admin', label: 'Quản lý Đơn hàng', icon: <ShoppingOutlined /> },
        { path: '/admin/users', label: 'Quản lý Người dùng', icon: <TeamOutlined /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-20">
                <div className="p-6 text-center border-b border-gray-800">
                    <h1 className="text-2xl font-black text-pink-500 tracking-wider">
                        ADMIN<span className="text-white">PANEL</span>
                    </h1>
                </div>
                
                <nav className="flex-1 p-4 flex flex-col gap-2 mt-4">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50' 
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <span className="text-xl flex items-center">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500 hover:text-white font-semibold transition-colors"
                    >
                        <span className="text-xl flex items-center"><LogoutOutlined /></span> 
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {menuItems.find(m => m.path === location.pathname)?.label || 'Bảng điều khiển'}
                    </h2>
                    
                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 text-xl">
                            <UserOutlined />
                        </div>
                        <div className="text-lg font-bold text-gray-800 whitespace-nowrap">
                            Xin chào, <span className="text-pink-600">{auth.user.name}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;