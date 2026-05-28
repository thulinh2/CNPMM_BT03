import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    }

    return axios.post(URL_API, data)
}
const verifyOtpApi = (email, otp) => {
    const URL_API = "/v1/api/verify-otp";
    const data = { email, otp };
    return axios.post(URL_API, data); 
}
const resendOtpApi = (email) => {
    const URL_API = "/v1/api/resend-otp";
    const data = { email };
    return axios.post(URL_API, data); 
}
const forgotPasswordApi = (email) => {
    const URL_API = "/v1/api/forgot-password";
    return axios.post(URL_API, { email });
}

const resetPasswordApi = (email, otp, newPassword) => {
    const URL_API = "/v1/api/reset-password";
    return axios.post(URL_API, { email, otp, newPassword });
}
const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }

    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}
// API cho Admin quản lý đơn hàng

const getOrdersAdminApi = () => {
    const URL_API = "/v1/api/admin/orders";
    return axios.get(URL_API);
};

const updateOrderStatusApi = (orderId, status, note) => {
    const URL_API = `/v1/api/admin/orders/${orderId}/status`;
    return axios.put(URL_API, { status, note });
};

const handleCancelRequestApi = (orderId, isApproved, note) => {
    const URL_API = `/v1/api/admin/orders/${orderId}/cancel-request`;
    return axios.put(URL_API, { isApproved, note });
};


export {
    createUserApi, loginApi, getUserApi, getOrdersAdminApi,
    updateOrderStatusApi, handleCancelRequestApi, verifyOtpApi, resendOtpApi, forgotPasswordApi, resetPasswordApi
}