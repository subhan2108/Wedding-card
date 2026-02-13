import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

    // Redirect if already authenticated
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('admin-authenticated') === 'true';
        if (isAuthenticated) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!password) {
            setError('Please enter a password');
            return;
        }

        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('admin-authenticated', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-background">
                <div className="login-circle login-circle-1"></div>
                <div className="login-circle login-circle-2"></div>
                <div className="login-circle login-circle-3"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-icon">
                            <Lock size={40} />
                        </div>
                        <h1>Wedding Admin Panel</h1>
                        <p>Enter your password to access the admin dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="password">Admin Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    className={error ? 'input-error' : ''}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {error && <div className="error-message">{error}</div>}
                        </div>

                        <button type="submit" className="login-button">
                            <Lock size={20} />
                            <span>Login to Admin Panel</span>
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Protected by password authentication</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
