import { Outlet, useNavigate } from "react-router-dom"; 
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import axios from "./util/axios.customize";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";

function App() {
    const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccount = async () => {
            setAppLoading(true);
            const res = await axios.get(`/v1/api/account`);
            if (res && !res.message) {
                setAuth({
                    isAuthenticated: true,
                    user: {
                        email: res.email,
                        name: res.name,
                        role: res.role 
                    }
                })
            }
            setAppLoading(false);
        }

        fetchAccount()
    }, [])

    useEffect(() => {
        if (auth.isAuthenticated && auth.user.role === 'ADMIN') {
            navigate("/admin");
        }
    }, [auth.isAuthenticated, auth.user.role, navigate]);

    return (
        <div className="flex flex-col min-h-screen">
            {appLoading === true ?
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    <Spin />
                </div>
                :
                <>
                    <Header />
                    <main className="flex-grow bg-slate-50">
                        <Outlet />
                    </main>
                    <Footer />
                </>
            }
        </div>
    )
}

export default App;