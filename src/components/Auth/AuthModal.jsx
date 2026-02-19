import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

const AuthModal = () => {
    const { showAuthModal, closeAuthModal, signIn, signUp, user } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!showAuthModal) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error('Invalid email or password. If you just signed up, please verify your email.');
                    }
                    throw error;
                }
                // Success - close modal (handled by context/effect? Or forcibly here)
                closeAuthModal();
            } else {
                const { data, error } = await signUp(email, password);
                if (error) throw error;

                // If the user was created successfully and we have a session, close modal.
                // If we have a user but no session (which shouldn't happen if email confirm is off),
                // we'll show success.
                if (data.session) {
                    closeAuthModal();
                } else if (data.user) {
                    setSuccess(true);
                    // Automatically switch to login mode since account is created
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // Implement OAuth redirect logic here
        // await supabase.auth.signInWithOAuth({ provider: 'google' });
        console.log('Google Sign In Clicked');
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={closeAuthModal}>
                    <X size={24} />
                </button>

                <div className="auth-modal-header">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Log in to continue planning your wedding' : 'Join us to design your dream wedding card'}</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            <CheckCircle size={16} />
                            <span>Account created! You can now log in.</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>

                    <div className="auth-separator">
                        <span>OR</span>
                    </div>

                    <button type="button" className="btn-google" onClick={handleGoogleSignIn}>
                        <svg className="google-icon" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <div className="auth-toggle">
                        <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                        <button type="button" className="text-link" onClick={toggleAuthMode}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
