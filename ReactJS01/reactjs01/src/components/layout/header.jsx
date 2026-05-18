import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { ShoppingOutlined, LogoutOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        localStorage.clear("access_token");
        setAuth({
            isAuthenticated: false,
            user: {
                email: "",
                name: ""
            }
        });
        navigate("/");
    };

    return (
        <header className="bg-white border-b border-pink-100 sticky top-0 z-50 shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/*Logo Cửa Hàng */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-extrabold text-pink-600 flex items-center gap-2 hover:text-pink-700 transition-colors">
                            <ShoppingOutlined className="text-3xl" />
                            <span>TrendyBags</span>
                        </Link>
                    </div>

                    {/* Các Menu Điều Hướng (Navigation) */}
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => isActive ? "text-pink-600 font-bold border-b-2 border-pink-600 py-1" : "text-gray-700 hover:text-pink-600 font-semibold py-1 transition-colors"}
                        >
                            Trang Chủ
                        </NavLink>
                        
                        {/* Chỉ hiển thị menu Users khi đã đăng nhập */}
                        {auth.isAuthenticated && (
                            <NavLink 
                                to="/user" 
                                className={({ isActive }) => isActive ? "text-pink-600 font-bold border-b-2 border-pink-600 py-1 flex items-center gap-2" : "text-gray-700 hover:text-pink-600 font-semibold py-1 transition-colors flex items-center gap-2"}
                            >
                                <UserOutlined />
                                Quản lý Người Dùng
                            </NavLink>
                        )}
                    </nav>

                    {/*Khu vực Đăng nhập / Thông tin User */}
                    <div className="flex items-center space-x-4">
                        {auth.isAuthenticated ? (
                            <div className="flex items-center gap-5">
                                <span className="text-gray-600 text-sm">
                                    Xin chào, <strong className="text-pink-600">{auth?.user?.email || "Bạn"}</strong>
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 bg-pink-50 text-pink-600 px-5 py-2.5 rounded-full font-semibold hover:bg-pink-100 transition-colors text-sm shadow-sm border border-pink-100"
                                >
                                    <LogoutOutlined />
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <Link 
                                to="/login"
                                className="flex items-center gap-2 bg-pink-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-pink-700 transition-colors shadow-md text-sm"
                            >
                                <LoginOutlined />
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;