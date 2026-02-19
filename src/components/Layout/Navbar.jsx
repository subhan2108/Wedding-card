import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, ShoppingBag, Menu, X, User } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ cartCount }) => {
    const { user, profile, signOut, openAuthModal } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAuthAction = () => {
        if (user) {
            // If user is logged in, show profile dropdown or just Navigate to profile?
            // For now, simpler: Logout or Admin logic
            // Ideally, clicking "Log In" changes to "Profile" or "Sign Out"
        } else {
            openAuthModal();
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <div className="logo-icon">
                        <Heart size={20} fill="currentColor" />
                    </div>
                    <span className="logo-text">Vow & Verse</span>
                </div>

                {/* Desktop Menu */}
                <div className="navbar-links desktop-only">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
                    <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Gallery</NavLink>
                    <NavLink to="/customize" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Customize</NavLink>
                    {/* Editor link is optional here, usually accessed via gallery */}
                </div>

                {/* Right Actions */}
                <div className="navbar-actions desktop-only">
                    {user ? (
                        <div className="user-menu">
                            <span className="user-greeting">Hi, {profile?.full_name || user.email?.split('@')[0]}</span>
                            <button className="btn-text" onClick={() => navigate('/my-orders')}>My Orders</button>
                            {profile?.role === 'admin' && (
                                <button className="btn-text" onClick={() => navigate('/admin/dashboard')}>Admin</button>
                            )}
                            <button className="btn-text" onClick={signOut}>Sign Out</button>
                        </div>
                    ) : (
                        <button className="btn-text" onClick={() => openAuthModal()}>Log In</button>
                    )}

                    <button className="btn-primary-small" onClick={() => navigate('/gallery')}>
                        Get Started
                    </button>

                    <button className="cart-btn" onClick={() => navigate('/checkout')}>
                        <ShoppingBag size={24} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <NavLink to="/" onClick={toggleMenu} className="mobile-link">Home</NavLink>
                    <NavLink to="/gallery" onClick={toggleMenu} className="mobile-link">Gallery</NavLink>
                    <NavLink to="/customize" onClick={toggleMenu} className="mobile-link">Customize</NavLink>
                    <div className="mobile-divider"></div>
                    {user ? (
                        <>
                            <button className="mobile-link" onClick={() => { navigate('/my-orders'); toggleMenu(); }}>My Orders</button>
                            {profile?.role === 'admin' && (
                                <button className="mobile-link" onClick={() => { navigate('/admin/dashboard'); toggleMenu(); }}>Admin Dashboard</button>
                            )}
                            <button className="mobile-link" onClick={() => { signOut(); toggleMenu(); }}>Sign Out</button>
                        </>
                    ) : (
                        <button className="mobile-link" onClick={() => { openAuthModal(); toggleMenu(); }}>Log In</button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
