import React from 'react';
import './Footer.css';
import { Heart, Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="brand-logo">
                            <Heart size={24} fill="#1e88e5" color="#1e88e5" />
                            <span>Vow & Verse</span>
                        </div>
                        <p className="brand-mission">
                            Crafting perfect digital invitations for your special day.
                            Elegant, customizable, and instantly shareable.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-icon"><Instagram size={20} /></a>
                            <a href="#" className="social-icon"><Facebook size={20} /></a>
                            <a href="#" className="social-icon"><Twitter size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <div className="link-column">
                            <h4>Product</h4>
                            <ul>
                                <li><Link to="/gallery">Templates</Link></li>
                                <li><Link to="/customize">Pricing</Link></li>
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Showcase</a></li>
                            </ul>
                        </div>
                        <div className="link-column">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Partners</a></li>
                            </ul>
                        </div>
                        <div className="link-column">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Contact Us</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Vow & Verse. All rights reserved.</p>
                    <div className="bottom-links">
                        <a href="#">Privacy</a>
                        <span className="dot">•</span>
                        <a href="#">Terms</a>
                        <span className="dot">•</span>
                        <a href="#">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
