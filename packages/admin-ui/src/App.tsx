import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import {useEffect} from 'react';
import {APIService} from './services/APIService.ts';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import {Login} from "./pages/Login.tsx";
import {Register} from "./pages/Register.tsx";
import {Dashboard} from "./pages/Dashboard.tsx";

function App() {
    useEffect(() => {
        APIService.checkAuth();
    }, []);

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/admin/login" element={<Login/>}/>
                    <Route path="/admin/register" element={<Register/>}/>
                    <Route path="/admin/dashboard" element={<Dashboard/>}/>
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace/>}/>
                </Routes>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        </Router>
    );
}

export default App;
