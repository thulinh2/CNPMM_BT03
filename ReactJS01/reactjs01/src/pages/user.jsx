import { notification, Table, Tag, Tooltip, Popconfirm } from "antd";
import { useEffect, useState, useContext } from "react";
import { getUserApi } from "../util/api";
import axios from "../util/axios.customize";
import { AuthContext } from "../components/context/auth.context";
import { EditOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';

const UserPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useContext(AuthContext); 

    const fetchUser = async () => {
        setLoading(true);
        const res = await getUserApi();
        if (!res?.message) {
            setDataSource(res);
        } else {
            notification.error({
                message: "Lỗi truy cập",
                description: res.message || "Bạn không có quyền lấy danh sách người dùng."
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // Gọi API để chỉnh sửa quyền 
    const handleUpdateRole = async (id, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        try {
            const res = await axios.put(`/v1/api/users/${id}/role`, { role: newRole });
            if (res && res.errCode === 0) {
                notification.success({ message: "Thành công", description: res.message });
                fetchUser(); 
            } else {
                notification.error({ message: "Thao tác thất bại", description: res.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: "Không thể cập nhật quyền." });
        }
    };

    // Gọi API Khóa/ Mở khóa tài khoản
    const handleLockUser = async (id) => {
        try {
            const res = await axios.put(`/v1/api/users/${id}/lock`);
            if (res && res.errCode === 0) {
                notification.success({ message: "Thành công", description: res.message });
                fetchUser();
            } else {
                notification.error({ message: "Thao tác thất bại", description: res.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: "Không thể khóa/mở khóa tài khoản." });
        }
    };

    //Gọi API Xóa 
    const handleDeleteUser = async (id) => {
        try {
            const res = await axios.delete(`/v1/api/users/${id}`);
            if (res && res.errCode === 0) {
                notification.success({ message: "Thành công", description: res.message });
                fetchUser();
            } else {
                notification.error({ message: "Thao tác thất bại", description: res.message });
            }
        } catch (error) {
            notification.error({ message: "Lỗi hệ thống", description: "Không thể xóa tài khoản này." });
        }
    };

    const columns = [
        {
            title: <span className="font-bold text-gray-800 text-sm">ID Người dùng</span>,
            dataIndex: '_id',
            key: '_id',
            render: (id) => <span className="text-sm text-gray-700 font-medium">{id}</span>
        },
        {
            title: <span className="font-bold text-gray-800 text-sm">Họ và tên</span>,
            dataIndex: 'name',
            key: 'name',
            render: (name) => <span className="text-sm text-gray-700 font-medium">{name}</span>
        },
        {
            title: <span className="font-bold text-gray-800 text-sm">Email</span>,
            dataIndex: 'email',
            key: 'email',
            render: (email) => <span className="text-sm text-gray-700 font-medium">{email}</span>
        },
        {
            title: <span className="font-bold text-gray-800 text-sm">Quyền (Role)</span>,
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'magenta' : 'blue'} className="font-bold px-3 py-1 rounded-full border-0">
                    {role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                </Tag>
            )
        },
        {
            title: <span className="font-bold text-gray-800 text-sm">Trạng thái</span>,
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive !== false ? 'green' : 'red'} className="font-bold px-3 py-1 rounded-full border-0">
                    {isActive !== false ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                </Tag>
            )
        },
        {
            title: <span className="font-bold text-gray-800 text-sm">Thao tác</span>,
            key: 'action',
            render: (_, record) => {
                if (record.email === auth.user.email) {
                    return <span className="text-xs text-gray-400 font-semibold italic bg-gray-100 px-3 py-1.5 rounded-lg">Tài khoản của bạn</span>;
                }

                return (
                    <div className="flex gap-3">
                        <Popconfirm
                            title={`Bạn muốn đổi quyền người này thành ${record.role === 'ADMIN' ? 'KHÁCH HÀNG' : 'QUẢN TRỊ VIÊN'}?`}
                            onConfirm={() => handleUpdateRole(record._id, record.role)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Tooltip title="Cấp / Hạ quyền" placement="top">
                                <button className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all border border-blue-200 shadow-sm">
                                    <EditOutlined />
                                </button>
                            </Tooltip>
                        </Popconfirm>
                        
                        <Popconfirm
                            title={record.isActive !== false ? "Khóa tài khoản này lại?" : "Mở khóa cho tài khoản này?"}
                            onConfirm={() => handleLockUser(record._id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Tooltip title={record.isActive !== false ? "Khóa tài khoản" : "Mở khóa"} placement="top">
                                <button className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all border shadow-sm ${record.isActive !== false ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border-orange-200' : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white border-green-200'}`}>
                                    {record.isActive !== false ? <LockOutlined /> : <UnlockOutlined />}
                                </button>
                            </Tooltip>
                        </Popconfirm>

                        <Popconfirm
                            title="Xóa vĩnh viễn tài khoản này? Hành động này không thể hoàn tác!"
                            onConfirm={() => handleDeleteUser(record._id)}
                            okText="Xóa ngay"
                            okButtonProps={{ danger: true }}
                            cancelText="Hủy"
                        >
                            <Tooltip title="Xóa tài khoản" placement="top">
                                <button className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-200 shadow-sm">
                                    <DeleteOutlined />
                                </button>
                            </Tooltip>
                        </Popconfirm>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6 flex justify-between items-end pb-4 border-b border-gray-100">
                <div>
                    <p className="text-gray-800 font-bold text-lg tracking-wide">Xem danh sách và phân quyền tài khoản hệ thống.</p>
                </div>
                <div className="bg-pink-50 text-pink-600 px-4 py-2 rounded-xl font-bold text-sm">
                    Tổng số: {dataSource.length} tài khoản
                </div>
            </div>

            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey={"_id"}
                loading={loading}
                pagination={{ pageSize: 8 }}
                className="custom-admin-table"
            />
        </div>
    );
};

export default UserPage;