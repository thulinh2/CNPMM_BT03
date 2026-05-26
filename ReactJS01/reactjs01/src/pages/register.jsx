import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';

const RegisterPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const { name, email, password } = values;

        const res = await createUserApi(name, email, password);

        if (res) {
            notification.success({
                message: "Thành công",
                description: "Tạo tài khoản thành công! Vui lòng đăng nhập."
            });
            navigate("/login");
        } else {
            notification.error({
                message: "Lỗi đăng ký",
                description: "Có lỗi xảy ra, vui lòng thử lại."
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 font-sans p-4">
            
            {/* THẺ CARD - TỈ LỆ VÀNG 450px */}
            <div 
                className="bg-white shadow-2xl shadow-pink-200/40 border border-pink-100"
                style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '24px' }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Đăng Ký</h1>
                    <p className="text-sm text-gray-600 font-medium">
                        Tạo tài khoản mới tại <span className="text-pink-600 font-bold">TrendyBags</span>
                    </p>
                </div>

                <Form name="basic" onFinish={onFinish} autoComplete="off" layout="vertical" requiredMark={false}>
                    
                    <Form.Item
                        label={<span className="text-sm font-semibold text-gray-800">Tên của bạn</span>}
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        style={{ marginBottom: '20px' }}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />} 
                            placeholder="Nhập họ và tên..."
                            style={{ height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#fdf2f8', padding: '0 16px', border: '1px solid #fce7f3' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-sm font-semibold text-gray-800">Email</span>}
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                        style={{ marginBottom: '20px' }}
                    >
                        <Input 
                            prefix={<MailOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />} 
                            placeholder="Nhập email của bạn..."
                            style={{ height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#fdf2f8', padding: '0 16px', border: '1px solid #fce7f3' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-sm font-semibold text-gray-800">Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng tạo mật khẩu!' }]}
                        style={{ marginBottom: '32px' }}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />}
                            placeholder="Tạo mật khẩu"
                            style={{ height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#fdf2f8', padding: '0 16px', border: '1px solid #fce7f3' }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: '24px' }}>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#db2777', border: 'none', boxShadow: '0 4px 10px rgba(244, 114, 182, 0.4)' }}
                        >
                            Tạo Tài Khoản
                        </Button>
                    </Form.Item>
                </Form>

                <div className="flex flex-col gap-4 text-center text-sm font-medium mt-6">
                    <div className="text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-pink-600 hover:text-pink-700 font-bold underline transition-colors">
                            Đăng nhập
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

export default RegisterPage;