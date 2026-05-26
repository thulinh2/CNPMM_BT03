import React, { useContext } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);

    const onFinish = async (values) => {
        const { email, password } = values;

        const res = await loginApi(email, password);

        if (res && res.EC === 0) {
            localStorage.setItem("access_token", res.access_token);
            notification.success({
                message: "Đăng nhập thành công",
                description: "Chào mừng bạn quay trở lại!"
            });
            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? "",
                    name: res?.user?.name ?? "",
                    role: res?.user?.role ?? "USER" 
                }
            });

            if (res?.user?.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/");
            }
            
        } else {
            notification.error({
                message: "Lỗi đăng nhập",
                description: res?.EM ?? "Thông tin không chính xác"
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 font-sans p-4">
            
            {/* THẺ CARD - ĐÃ THU GỌN VỀ TỈ LỆ VÀNG 450px VÀ PADDING 40px */}
            <div 
                className="bg-white shadow-2xl shadow-pink-200/40 border border-pink-100"
                style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '24px' }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Đăng Nhập</h1>
                    <p className="text-sm text-gray-600 font-medium">
                        Chào mừng trở lại với <span className="text-pink-600 font-bold">TrendyBags</span>
                    </p>
                </div>

                <Form name="basic" onFinish={onFinish} autoComplete="off" layout="vertical" requiredMark={false}>
                    
                    <Form.Item
                        label={<span className="text-sm font-semibold text-gray-800">Email của bạn</span>}
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' }
                        ]}
                        style={{ marginBottom: '20px' }}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />} 
                            placeholder="Nhập email của bạn..."
                            style={{ height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#fdf2f8', padding: '0 16px', border: '1px solid #fce7f3' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-sm font-semibold text-gray-800">Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        style={{ marginBottom: '32px' }}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />}
                            placeholder="Nhập mật khẩu"
                            style={{ height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#fdf2f8', padding: '0 16px', border: '1px solid #fce7f3' }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: '24px' }}>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#db2777', border: 'none', boxShadow: '0 4px 10px rgba(244, 114, 182, 0.4)' }}
                        >
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>

                <div className="flex flex-col gap-4 text-center text-sm font-medium mt-6">
                    <div className="text-gray-600">
                        Bạn chưa có tài khoản?{' '}
                        <Link to="/register" className="text-pink-600 hover:text-pink-700 font-bold underline transition-colors">
                            Đăng ký ngay
                        </Link>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#fce7f3', margin: '4px 0', width: '100%' }}></div>
                    <Link to="/" className="text-gray-500 hover:text-pink-600 transition-colors flex items-center justify-center gap-2">
                        <ArrowLeftOutlined style={{ fontSize: '14px' }} /> Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;