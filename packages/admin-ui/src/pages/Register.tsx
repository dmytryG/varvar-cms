import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {APIService} from "../services/APIService.ts";
import {Header} from "../components/Header.tsx";

export const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name || !confirmPassword) return;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            await APIService.register(email, password, name);
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
            <h2>Register for CMS</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div>
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
                <div>
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
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || !email || !password || !name || !confirmPassword}
                >
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p>
                Already have an account? <Link to="/admin/login">Login here</Link>
            </p>
        </div>
    );
};