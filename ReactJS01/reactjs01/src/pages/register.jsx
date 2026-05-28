import React, { useState, useEffect } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { createUserApi, verifyOtpApi, resendOtpApi } from '../util/api'; 
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LockOutlined, UserOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const RegisterPage = () => {
    const navigate = useNavigate();
    
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    // STATE MỚI: Quản lý đếm ngược thời gian gửi lại mã (60 giây)
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Xử lý logic đếm ngược tự động giảm
    useEffect(() => {
        let timer;
        if (isOtpStep && countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else if (countdown === 0) {
            setCanResend(true); // Khi đếm về 0 thì cho phép bấm nút "Gửi lại"
        }
        return () => clearInterval(timer);
    }, [isOtpStep, countdown]);

    const onFinishRegister = async (values) => {
        const { name, email, password } = values;
        setLoading(true);
        try {
            const res = await createUserApi(name, email, password);
            if (res && res.EC === 0) {
                notification.success({ message: "Thành công", description: res.EM });
                setRegisteredEmail(email); 
                setIsOtpStep(true);   
                setCountdown(60); // Bắt đầu đếm 60s
                setCanResend(false);
            } else {
                notification.error({ message: "Lỗi đăng ký", description: res?.EM || res?.response?.data?.EM });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: error?.response?.data?.EM || "Lỗi kết nối máy chủ." });
        }
        setLoading(false);
    };

    const onFinishOtp = async (values) => {
        const { otp } = values;
        setLoading(true);
        try {
            const res = await verifyOtpApi(registeredEmail, otp);
            if (res && res.EC === 0) {
                notification.success({ message: "Kích hoạt thành công", description: "Tài khoản đã sẵn sàng! Vui lòng đăng nhập." });
                navigate("/login"); 
            } else {
                notification.error({ message: "Lỗi xác thực", description: res?.EM || res?.response?.data?.EM });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: error?.response?.data?.EM || "Lỗi kết nối máy chủ." });
        }
        setLoading(false);
    };

    // HÀM MỚI: Xử lý khi người dùng bấm "Gửi lại mã"
    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            const res = await resendOtpApi(registeredEmail);
            if (res && res.EC === 0) {
                notification.success({ message: "Thành công", description: res.EM });
                setCountdown(60); // Đặt lại đồng hồ đếm ngược
                setCanResend(false);
            } else {
                notification.error({ message: "Lỗi", description: res?.EM || res?.response?.data?.EM });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: error?.response?.data?.EM || "Lỗi kết nối máy chủ." });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 font-sans p-4">
            <div className="bg-white shadow-2xl shadow-pink-200/40 border border-pink-100 transition-all duration-500" style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '24px' }}>
                
                {!isOtpStep ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Đăng Ký</h1>
                            <p className="text-sm text-gray-600 font-medium">Tạo tài khoản mới tại <span className="text-pink-600 font-bold">TrendyBags</span></p>
                        </div>
                        <Form name="register-form" onFinish={onFinishRegister} layout="vertical" requiredMark={false}>
                            <Form.Item label={<span className="text-sm font-semibold text-gray-800">Tên của bạn</span>} name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]} style={{ marginBottom: '20px' }}>
                                <Input prefix={<UserOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />} placeholder="Nhập họ và tên..." style={{ height: '48px', borderRadius: '12px', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3' }} />
                            </Form.Item>
                            <Form.Item label={<span className="text-sm font-semibold text-gray-800">Email</span>} name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]} style={{ marginBottom: '20px' }}>
                                <Input prefix={<MailOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />} placeholder="Nhập email của bạn..." style={{ height: '48px', borderRadius: '12px', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3' }} />
                            </Form.Item>
                            <Form.Item label={<span className="text-sm font-semibold text-gray-800">Mật khẩu</span>} name="password" rules={[{ required: true, message: 'Vui lòng tạo mật khẩu!' }]} style={{ marginBottom: '32px' }}>
                                <Input.Password prefix={<LockOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />} placeholder="Tạo mật khẩu" style={{ height: '48px', borderRadius: '12px', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3' }} />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: '24px' }}>
                                <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#db2777', border: 'none' }}>
                                    Tạo Tài Khoản
                                </Button>
                            </Form.Item>
                        </Form>
                        <div className="flex flex-col gap-4 text-center text-sm font-medium mt-6">
                            <div className="text-gray-600">Đã có tài khoản? <Link to="/login" className="text-pink-600 hover:text-pink-700 font-bold underline">Đăng nhập</Link></div>
                            <div style={{ height: '1px', backgroundColor: '#fce7f3', margin: '4px 0', width: '100%' }}></div>
                            <Link to="/" className="text-gray-500 hover:text-pink-600 flex items-center justify-center gap-2"><ArrowLeftOutlined /> Quay lại trang chủ</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SafetyCertificateOutlined style={{ fontSize: '32px' }} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Xác Thực Email</h1>
                            <p className="text-sm text-gray-600 font-medium">Vui lòng nhập mã OTP vừa được gửi đến<br/><span className="text-pink-600 font-bold">{registeredEmail}</span></p>
                        </div>

                        <Form name="otp-form" onFinish={onFinishOtp} layout="vertical" requiredMark={false}>
                            <Form.Item name="otp" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }, { len: 6, message: 'Mã OTP gồm 6 chữ số!' }]} style={{ marginBottom: '16px' }}>
                                <Input prefix={<LockOutlined style={{ color: '#f472b6', marginRight: '8px' }} />} placeholder="Nhập mã OTP 6 số" maxLength={6} style={{ height: '56px', borderRadius: '12px', fontSize: '20px', letterSpacing: '2px', textAlign: 'center', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3' }} />
                            </Form.Item>

                            {/* NÚT GỬI LẠI MÃ ĐẾM NGƯỢC */}
                            <div className="text-center mb-6 mt-2">
                                <span className="text-sm text-gray-500 font-medium">Chưa nhận được mã? </span>
                                {canResend ? (
                                    <button type="button" onClick={handleResendOtp} disabled={loading} className="text-sm text-pink-600 font-bold bg-transparent border-none cursor-pointer hover:underline p-0">
                                        Gửi lại mã
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-400 font-bold">Gửi lại sau {countdown}s</span>
                                )}
                            </div>

                            <Form.Item style={{ marginBottom: '24px' }}>
                                <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#db2777', border: 'none' }}>
                                    Xác Nhận OTP
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="text-center mt-6">
                            <button onClick={() => setIsOtpStep(false)} className="text-gray-500 hover:text-pink-600 flex items-center justify-center gap-2 mx-auto text-sm font-medium bg-transparent border-none cursor-pointer">
                                <ArrowLeftOutlined /> Đăng ký email khác
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;