import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const WHATSAPP_URL = "https://wa.me/524421080739";

function Navbar({ setShowAdminLogin }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = location.pathname === '/';

    return (
        <nav className={`navbar ${scrolled || !isHome ? 'scrolled' : ''}`}>
            <div className="container">
                <div className="logo-container">
                    <Link to="/">
                        <img src="/images/logo.png" alt="Viva Home Inmuebles" className="navbar-logo" />
                    </Link>
                </div>
                <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </div>
                <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/propiedades?type=Venta" onClick={() => setIsMobileMenuOpen(false)}>Venta</Link></li>
                    <li><Link to="/propiedades?type=Renta" onClick={() => setIsMobileMenuOpen(false)}>Renta</Link></li>
                    <li><a href={isHome ? "#nosotros" : "/#nosotros"} onClick={() => setIsMobileMenuOpen(false)}>Nosotros</a></li>
                    <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="contact-btn" onClick={() => setIsMobileMenuOpen(false)}>Contacto</a></li>
                    <div className="social-nav">
                        <a href="https://www.instagram.com/vivahomeqro/" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://www.facebook.com/viva.home.681197" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook"></i>
                        </a>
                    </div>
                    {/* Admin Link */}
                    <a href="#" className="admin-trigger" onClick={(e) => { e.preventDefault(); setShowAdminLogin(true); setIsMobileMenuOpen(false); }}>
                        <i className="fas fa-user-shield"></i>
                    </a>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
