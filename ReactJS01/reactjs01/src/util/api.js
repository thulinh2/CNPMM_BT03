import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    }

    return axios.post(URL_API, data)
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
    createUserApi, loginApi, getUserApi, getOrdersAdminApi, updateOrderStatusApi, handleCancelRequestApi
}