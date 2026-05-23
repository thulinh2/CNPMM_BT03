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
// Import trang Checkout mới
import CheckoutPage from './pages/checkout.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "user",
                element: <UserPage />
            },
            {
                path: "product/:id",
                element: <ProductPage />
            },
            {
                path: "cart",
                element: <CartPage />
            },
            // Thêm đường dẫn cho trang Thanh toán
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
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>
    </React.StrictMode>,
)