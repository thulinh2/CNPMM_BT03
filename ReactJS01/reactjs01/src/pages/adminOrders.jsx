import React, { useEffect, useState } from 'react';
import { Table, notification, Popconfirm, Select, Tag, Popover } from 'antd';
import { getOrdersAdminApi, updateOrderStatusApi, handleCancelRequestApi } from '../util/api';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getOrdersAdminApi();
            if (res && res.errCode === 0) {
                setOrders(res.data);
            } else {
                notification.error({ message: "Lỗi tải dữ liệu", description: res.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: "Không thể lấy danh sách đơn hàng" });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await updateOrderStatusApi(orderId, newStatus, `Admin cập nhật thành: ${newStatus}`);
            if (res && res.errCode === 0) {
                notification.success({ message: "Thành công", description: "Đã cập nhật trạng thái đơn hàng." });
                fetchOrders();
            } else {
                notification.error({ message: "Lỗi cập nhật", description: res.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: "Không thể cập nhật trạng thái." });
        }
    };

    const handleCancelRequest = async (orderId, isApproved) => {
        try {
            const res = await handleCancelRequestApi(orderId, isApproved, isApproved ? "Admin đồng ý hủy đơn" : "Admin từ chối hủy đơn");
            if (res && res.errCode === 0) {
                notification.success({ message: "Thành công", description: res.message });
                fetchOrders();
            } else {
                notification.error({ message: "Lỗi", description: res.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: "Lỗi xử lý yêu cầu hủy." });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Hàm render trạng thái có màu sắc
    const renderStatus = (record) => {
        const { status, cancelReason } = record;
        const statusConfig = {
            'New': { label: 'Đơn mới', color: 'blue' },
            'Confirmed': { label: 'Đã xác nhận', color: 'cyan' },
            'Preparing': { label: 'Đang chuẩn bị', color: 'gold' },
            'Delivering': { label: 'Đang giao', color: 'orange' },
            'Delivered': { label: 'Đã giao', color: 'green' },
            'Cancel_Requested': { label: 'YÊU CẦU HỦY', color: 'magenta' },
            'Cancelled': { label: 'Đã hủy', color: 'red' }
        };

        const config = statusConfig[status] || { label: status, color: 'default' };

        // Nếu là yêu cầu hủy, bọc trong Popover để nhấn vào xem lý do
        if (status === 'Cancel_Requested') {
            return (
                <Popover content={<div className="max-w-xs">{cancelReason || "Không có lý do cụ thể"}</div>} title="Lý do hủy" trigger="click">
                    <Tag color={config.color} className="cursor-pointer font-bold px-3 py-1 rounded-lg">
                        {config.label}
                    </Tag>
                </Popover>
            );
        }

        return <Tag color={config.color} className="px-3 py-1 font-semibold rounded-lg">{config.label}</Tag>;
    };

    const columns = [
        { title: 'Mã đơn', dataIndex: '_id', key: '_id', render: (id) => <span className="font-mono text-gray-500 text-xs">{id.substring(id.length - 6).toUpperCase()}</span> },
        { title: 'Khách hàng', key: 'user', render: (_, record) => <div><p className="font-bold text-gray-800 text-sm">{record.shippingInfo?.fullName}</p><p className="text-xs text-gray-400">{record.shippingInfo?.phone}</p></div> },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (amt) => <span className="font-bold text-gray-800">{amt.toLocaleString()}đ</span> },
        { 
            title: 'Trạng thái', 
            render: (_, record) => renderStatus(record),
            // Thêm các thuộc tính lọc ở đây:
            filters: [
                { text: 'Đơn mới', value: 'New' },
                { text: 'Đã xác nhận', value: 'Confirmed' },
                { text: 'Đang chuẩn bị', value: 'Preparing' },
                { text: 'Đang giao', value: 'Delivering' },
                { text: 'Đã giao', value: 'Delivered' },
                { text: 'Yêu cầu hủy', value: 'Cancel_Requested' },
                { text: 'Đã hủy', value: 'Cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        { title: 'Thời gian đặt', dataIndex: 'createdAt', render: (date) => <span className="text-gray-600 text-sm">{formatDate(date)}</span> },
        {
            title: 'Cập nhật',
            key: 'action',
            render: (_, record) => {
                const { status, _id } = record;
                if (status === 'Delivered' || status === 'Cancelled') return <span className="text-gray-400 italic text-sm">Đã đóng</span>;
                
                if (status === 'Cancel_Requested') {
                    return (
                        <div className="flex gap-2">
                            <Popconfirm title="Đồng ý hủy đơn hàng này?" onConfirm={() => handleCancelRequest(_id, true)} okText="Đồng ý" cancelText="Hủy">
                                <button className="px-3 py-1.5 bg-gray-800 text-white font-semibold text-xs rounded-lg hover:bg-black transition-colors">Đồng ý</button>
                            </Popconfirm>
                            <Popconfirm title="Từ chối hủy đơn?" onConfirm={() => handleCancelRequest(_id, false)} okText="Từ chối" cancelText="Hủy">
                                <button className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 font-semibold text-xs rounded-lg hover:bg-gray-50 transition-colors">Từ chối</button>
                            </Popconfirm>
                        </div>
                    );
                }

                return (
                    <Select defaultValue={status} style={{ width: 140 }} onChange={(value) => handleUpdateStatus(_id, value)} 
                        options={[
                            { value: 'New', label: 'Đơn mới', disabled: status !== 'New' },
                            { value: 'Confirmed', label: 'Đã xác nhận', disabled: status === 'Delivering' || status === 'Preparing' },
                            { value: 'Preparing', label: 'Đang chuẩn bị', disabled: status === 'Delivering' },
                            { value: 'Delivering', label: 'Đang giao' },
                            { value: 'Delivered', label: 'Đã giao' },
                            { value: 'Cancelled', label: 'Hủy đơn' }
                        ]} 
                    />
                );
            }
        }
    ];

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6 flex justify-between items-end pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-1">Quản lý Đơn hàng</h2>
                </div>
                <div className="bg-gray-50 text-gray-800 border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm">Tổng đơn: {orders.length}</div>
            </div>
            <Table dataSource={orders} columns={columns} rowKey={"_id"} loading={loading} pagination={{ pageSize: 8 }} className="custom-admin-table" />
        </div>
    );
};

export default AdminOrdersPage;