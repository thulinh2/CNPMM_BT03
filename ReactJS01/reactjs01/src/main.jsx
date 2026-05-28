import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx'; 
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ProductPage from './pages/product.jsx'; 
import CartPage from './pages/cart.jsx';
import OrdersPage from './pages/orders.jsx';
import OrderDetailPage from './pages/orderDetail.jsx';
import AdminLayout from './components/layout/adminLayout';
import CheckoutPage from './pages/checkout.jsx';
import AdminOrdersPage from './pages/adminOrders.jsx';
import CollectionPage from './pages/collection.jsx';
// IMPORT THÊM TRANG QUÊN MẬT KHẨU
import ForgotPasswordPage from './pages/forgotPassword.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
    {
        // KHỐI GIAO DIỆN DÀNH CHO KHÁCH HÀNG 
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "collection",
                element: <CollectionPage />
            },
            {
                path: "product/:id",
                element: <ProductPage />
            },
            {
                path: "cart",
                element: <CartPage />
            },
            {
                path: "checkout",
                element: <CheckoutPage />
            },
            {
                path: "orders",
                element: <OrdersPage />
            },
            {
                path: "order/:id",
                element: <OrderDetailPage />
            }
        ]
    },
    {
        path: "register",
        element: <RegisterPage />
    },
    {
        path: "login",
        element: <LoginPage />
    },
    {
        path: "forgot-password",
        element: <ForgotPasswordPage />
    },
    {
        // KHỐI GIAO DIỆN DÀNH CHO ADMIN
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true, 
                element: <AdminOrdersPage />
            },
            {
                path: "users",
                element: <UserPage /> 
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>
    </React.StrictMode>,
)