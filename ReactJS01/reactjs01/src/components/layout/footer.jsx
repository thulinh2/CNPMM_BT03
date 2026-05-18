import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 mt-16 border-t border-gray-800 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Giới thiệu */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">Về Cửa Hàng</h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                        Chuyên cung cấp các mẫu túi xách thời trang xu hướng mới nhất, chất lượng cao cấp và giá cả hợp lý dành riêng cho phái đẹp.
                    </p>
                </div>
                {/* Đường dẫn nhanh */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">Chính Sách Chăm Sóc</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-pink-400 transition duration-200">Chính sách bảo hành</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition duration-200">Chính sách đổi trả trong 7 ngày</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition duration-200">Giao hàng & Kiểm hàng</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition duration-200">Thành viên thân thiết</a></li>
                    </ul>
                </div>
                {/* Thông tin liên hệ */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">Thông Tin Liên Hệ</h3>
                    <p className="text-sm text-gray-400 mb-2">Địa chỉ: Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh</p>
                    <p className="text-sm text-gray-400 mb-2">Email: hotro@tuixachtrendy.com</p>
                    <p className="text-sm text-gray-400">Hotline: 1900 6363</p>
                </div>
            </div>
            {/* Dòng bản quyền dưới cùng */}
            <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t border-gray-800">
                &copy; {new Date().getFullYear()} Trendy Bags Store. Bảo lưu mọi quyền.
            </div>
        </footer>
    );
};

export default Footer;