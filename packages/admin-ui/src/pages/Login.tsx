import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Header} from "../components/Header.tsx";
import {APIService} from "../services/apiService.ts";

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsSubmitting(true);
        try {
            await APIService.login(email, password);
            navigate('/dashboard');
        } catch (error) {
            // Error is handled in AuthAPI with toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Header toDashIfLoggedIn={true}/>
            <div className={'form-container'}>
                <form onSubmit={handleSubmit} className={'form-box width-50'}>
                    <h2>Login to CMS</h2>
                    <div className={'form-input-container'}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className={'form-input-container'}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !email || !password}
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p>
                    Don't have an account? <Link to="/admin/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};