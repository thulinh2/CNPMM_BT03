import React, { useState, useEffect } from 'react';
import { Button, Form, Input, notification } from 'antd';
import axios from '../util/axios.customize'; 
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [savedEmail, setSavedEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // STATE ĐẾM NGƯỢC THỜI GIAN GỬI LẠI MÃ OTP (60 GIÂY)
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Tự động quản lý đồng hồ đếm ngược khi chuyển qua bước OTP
    useEffect(() => {
        let timer;
        if (isOtpStep && countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else if (countdown === 0) {
            setCanResend(true); 
        }
        return () => clearInterval(timer);
    }, [isOtpStep, countdown]);

    // Gửi yêu cầu kiểm tra email hệ thống và cấp mã OTP
    const onFinishEmail = async (values) => {
        const { email } = values;
        setLoading(true);
        try {
            const res = await axios.post("/v1/api/forgot-password", { email });
            if (res && res.EC === 0) {
                notification.success({
                    message: "Thành công",
                    description: res.EM || "Mã xác nhận đã được gửi đến email của bạn!"
                });
                setSavedEmail(email);
                setIsOtpStep(true); 
                setCountdown(60); 
                setCanResend(false);
            } else {
                notification.error({
                    message: "Lỗi",
                    description: res?.EM || res?.response?.data?.EM || "Có lỗi xảy ra, vui lòng thử lại."
                });
            }
        } catch (error) {
            notification.error({
                message: "Lỗi khôi phục",
                description: error?.response?.data?.EM || "Email này chưa được đăng ký trong hệ thống!"
            });
        }
        setLoading(false);
    };

    // GỬI YÊU CẦU CẤP LẠI MÃ OTP KHÔI PHỤC MẬT KHẨU
    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            const res = await axios.post("/v1/api/resend-forgot-password-otp", { email: savedEmail });
            if (res && res.EC === 0) {
                notification.success({
                    message: "Thành công",
                    description: res.EM
                });
                setCountdown(60); 
                setCanResend(false);
            } else {
                notification.error({
                    message: "Lỗi gửi lại",
                    description: res?.EM || res?.response?.data?.EM || "Thao tác không thành công."
                });
            }
        } catch (error) {
            notification.error({
                message: "Lỗi hệ thống",
                description: error?.response?.data?.EM || "Không thể kết nối đến máy chủ."
            });
        }
        setLoading(false);
    };

    // Gửi OTP kèm mật khẩu mới để đặt lại thông tin
    const onFinishReset = async (values) => {
        const { otp, newPassword } = values;
        setLoading(true);
        try {
            const res = await axios.post("/v1/api/reset-password", { email: savedEmail, otp, newPassword });
            if (res && res.EC === 0) {
                notification.success({
                    message: "Đổi mật khẩu thành công!",
                    description: "Mật khẩu của bạn đã được cập nhật mới. Vui lòng đăng nhập lại."
                });
                navigate("/login"); 
            } else {
                notification.error({
                    message: "Lỗi đặt lại",
                    description: res?.EM || res?.response?.data?.EM || "Mã OTP không đúng hoặc hết hạn."
                });
            }
        } catch (error) {
            notification.error({
                message: "Lỗi xác thực",
                description: error?.response?.data?.EM || "Mã xác thực không hợp lệ."
            });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 font-sans p-4">
            <div 
                className="bg-white shadow-2xl shadow-pink-200/40 border border-pink-100 transition-all duration-500"
                style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '24px' }}
            >
                {!isOtpStep ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Quên Mật Khẩu</h1>
                            <p className="text-sm text-gray-600 font-medium">
                                Hãy nhập email bạn đã dùng đăng ký tài khoản <span className="text-pink-600 font-bold">TrendyBags</span>
                            </p>
                        </div>

                        <Form name="email-form" onFinish={onFinishEmail} layout="vertical" requiredMark={false}>
                            <Form.Item
                                label={<span className="text-sm font-semibold text-gray-800">Email của bạn</span>}
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không đúng định dạng!' }
                                ]}
                                style={{ marginBottom: '32px' }}
                            >
                                <Input 
                                    prefix={<MailOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />} 
                                    placeholder="Nhập email..."
                                    style={{ height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3' }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: '24px' }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#db2777', border: 'none', boxShadow: '0 4px 10px rgba(244, 114, 182, 0.4)' }}
                                >
                                    Gửi Mã Xác Nhận
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SafetyCertificateOutlined style={{ fontSize: '32px' }} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Đặt Lại Mật Khẩu</h1>
                            <p className="text-sm text-gray-600 font-medium">
                                Mã OTP đã được gửi đến email <br/>
                                <span className="text-pink-600 font-bold">{savedEmail}</span>
                            </p>
                        </div>

                        <Form name="reset-form" onFinish={onFinishReset} layout="vertical" requiredMark={false}>
                            <Form.Item
                                label={<span className="text-sm font-semibold text-gray-800">Mã xác nhận (OTP)</span>}
                                name="otp"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã OTP!' },
                                    { len: 6, message: 'Mã OTP gồm đúng 6 chữ số!' }
                                ]}
                                style={{ marginBottom: '16px' }}
                            >
                                <Input 
                                    prefix={<LockOutlined style={{ color: '#f472b6', marginRight: '8px' }} />} 
                                    placeholder="Nhập 6 số khôi phục"
                                    maxLength={6}
                                    style={{ height: '48px', borderRadius: '12px', fontSize: '18px', letterSpacing: '2px', textAlign: 'center', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3' }}
                                />
                            </Form.Item>

                            {/* ĐỒNG HỒ ĐẾM NGƯỢC VÀ NÚT GỬI LẠI MÃ KHÔI PHỤC */}
                            <div className="text-center mb-6 mt-2">
                                <span className="text-sm text-gray-500 font-medium">Chưa nhận được mã? </span>
                                {canResend ? (
                                    <button type="button" onClick={handleResendOtp} disabled={loading} className="text-sm text-pink-600 font-bold bg-transparent border-none cursor-pointer hover:underline p-0 outline-none">
                                        Gửi lại mã
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-400 font-bold">Gửi lại sau {countdown}s</span>
                                )}
                            </div>

                            <Form.Item
                                label={<span className="text-sm font-semibold text-gray-800">Mật khẩu mới</span>}
                                name="newPassword"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                                style={{ marginBottom: '32px' }}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#f472b6', marginRight: '8px', fontSize: '18px' }} />}
                                    placeholder="Tạo mật khẩu mới"
                                    style={{ height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3' }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: '24px' }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#db2777', border: 'none', boxShadow: '0 4px 10px rgba(244, 114, 182, 0.4)' }}
                                >
                                    Đổi Mật Khẩu & Đăng Nhập
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                )}

                <div style={{ height: '1px', backgroundColor: '#fce7f3', margin: '16px 0', width: '100%' }}></div>
                <div className="text-center">
                    <Link to="/login" className="text-gray-500 hover:text-pink-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <ArrowLeftOutlined style={{ fontSize: '14px' }} /> Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;