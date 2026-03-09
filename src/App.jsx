import React, { useState, useEffect } from 'react';

const carouselImages = [
    { id: 1, url: "/images/carrusel1.png", title: "Encuentra tu Hogar", subtitle: "Expertos en Ventas y Rentas" },
    { id: 2, url: "/images/carrusel2.png", title: "Asesoría Profesional", subtitle: "Tomamos las mejores decisiones contigo" },
    { id: 3, url: "/images/carrusel3.png", title: "Propiedades Exclusivas", subtitle: "Calidad y Plusvalía Garantizada" },
    { id: 4, url: "/images/carrusel4.png", title: "Tu Próximo Paso", subtitle: "Acompañandote en cada trámite" }
];

function App() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    // Backend integration states
    const [properties, setProperties] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [uploading, setUploading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const API_URL = 'http://localhost:3001/api';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        fetchProperties();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch(`${API_URL}/properties`);
            const data = await res.json();
            setProperties(data.map((filename, index) => ({
                id: index,
                image: `/propiedades/${filename}`,
                filename: filename
            })));
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm)
            });
            const data = await res.json();
            if (data.success) {
                setIsAdmin(true);
                setShowAdminLogin(false);
                setLoginForm({ username: '', password: '' });
            } else {
                setLoginError(data.message || 'Error en el login');
            }
        } catch (err) {
            setLoginError('Error de conexión con el servidor');
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                fetchProperties();
            }
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) return;
        try {
            const res = await fetch(`${API_URL}/properties/${filename}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchProperties();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const WHATSAPP_URL = "https://wa.me/524421080739";

    return (
        <div className="app-container">
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="logo-container">
                        <img src="/images/logo.png" alt="Viva Home Inmuebles" className="navbar-logo" />
                    </div>
                    <ul className="nav-links">
                        <li><a href="#proyectos">Venta</a></li>
                        <li><a href="#proyectos">Renta</a></li>
                        <li><a href="#nosotros">Nosotros</a></li>
                        <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="contact-btn">Contacto</a></li>
                        <div className="social-nav">
                            <a href="https://www.instagram.com/vivahomeqro/" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="https://www.facebook.com/viva.home.681197" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-facebook"></i>
                            </a>
                        </div>
                        {/* Admin Link */}
                        <a href="#" className="admin-trigger" onClick={(e) => { e.preventDefault(); setShowAdminLogin(true); }}>
                            <i className="fas fa-user-shield"></i>
                        </a>
                    </ul>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-slider">
                    {carouselImages.map((img, index) => (
                        <div
                            key={index}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${img.url})` }}
                        >
                            <div className="hero-content">
                                <span className="badge">{img.subtitle}</span>
                                <h1>{img.title}</h1>
                                <p className="hero-subtitle">Tu hogar soñado en Querétaro</p>
                                <div className="hero-actions">
                                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="cta-button secondary">Me Interesa</a>
                                    <a href="#proyectos" className="cta-button">Ver Más</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="slider-dots">
                    {carouselImages.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></div>
                    ))}
                </div>
            </section>

            <section id="proyectos" className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Propiedades Destacadas</h2>
                        <div className="header-line"></div>
                        <p>Descubre nuestra exclusiva selección de inmuebles en las mejores zonas de Querétaro.</p>
                    </div>
                    <div className="property-grid">
                        {properties.map((prop) => (
                            <div key={prop.id} className="property-card gallery-item">
                                <div className="property-image">
                                    <img src={prop.image} alt="Propiedad" />
                                    {isAdmin && (
                                        <button className="delete-btn" onClick={() => handleDelete(prop.filename)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isAdmin && (
                        <div className="admin-uploader">
                            <label className="upload-btn">
                                <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
                                <i className="fas fa-plus"></i> Añadir Propiedad
                            </label>
                            {uploading && <p className="uploading-text">Subiendo...</p>}
                            <button className="logout-btn" onClick={() => setIsAdmin(false)}>Cerrar Sesión</button>
                        </div>
                    )}
                </div>
            </section>

            <section id="nosotros" className="nosotros-section">
                <div className="container">
                    <div className="section-header">
                        <h2>¿Por qué elegirnos?</h2>
                        <div className="header-line"></div>
                        <p>Brindamos un servicio integral basado en la confianza y el profesionalismo.</p>
                    </div>

                    <div className="nosotros-grid">
                        <div className="nosotros-card">
                            <div className="nosotros-icon">
                                <i className="fas fa-award"></i>
                            </div>
                            <h3>Experiencia y conocimiento</h3>
                            <p>Contamos con capacitación y experiencia en el mercado inmobiliario, actualizados en tendencias, precios y reglamentaciones del sector. Te orientamos para tomar decisiones informadas.</p>
                        </div>

                        <div className="nosotros-card">
                            <div className="nosotros-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3>Ahorro de tiempo y esfuerzo</h3>
                            <p>Nos encargamos de gestionar todo el proceso de compra, renta o venta, lo que incluye la búsqueda de propiedades, la negociación de precios y la realización de trámites.</p>
                        </div>

                        <div className="nosotros-card">
                            <div className="nosotros-icon">
                                <i className="fas fa-user-shield"></i>
                            </div>
                            <h3>Asesoramiento personalizado</h3>
                            <p>Cada cliente tiene necesidades y objetivos diferentes. Brindamos un asesoramiento personalizado, teniendo en cuenta tus intereses y preferencias para asegurar decisiones acertadas.</p>
                        </div>
                    </div>

                </div>

                <div className="about-cta">
                    <div className="about-cta-content">
                        <h3>¿Listo para dar el siguiente paso?</h3>
                        <p>Contáctanos hoy mismo y recibe asesoría profesional para tu próxima inversión inmobiliaria.</p>
                    </div>
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="cta-button">Hablemos por WhatsApp</a>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-info">
                            <img src="/images/logo.png" alt="Viva Home Logo" className="footer-logo" />
                            <p>Expertos en el mercado inmobiliario, brindando confianza y profesionalismo en cada paso.</p>
                            <div className="footer-social">
                                <a href="https://www.instagram.com/vivahomeqro/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                                <a href="https://www.facebook.com/viva.home.681197" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
                            </div>
                        </div>
                        <div className="footer-contact">
                            <h4>Contacto</h4>
                            <p>Tel: +52 442 108 0739</p>
                            <p>Email: vivahomeinmuebles@gmail.com</p>
                        </div>
                        <div className="footer-links">
                            <h4>Enlaces</h4>
                            <ul>
                                <li><a href="#proyectos">Venta</a></li>
                                <li><a href="#proyectos">Renta</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>Aviso de Privacidad</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        &copy; 2026 Viva Home Inmuebles. Todos los derechos reservados.
                    </div>
                </div>
            </footer>

            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="whatsapp-float">
                <i className="fab fa-whatsapp"></i>
                <span>¿Cómo podemos ayudarte?</span>
            </a>

            {/* Login Modal */}
            {showAdminLogin && (
                <div className="privacy-overlay" onClick={() => setShowAdminLogin(false)}>
                    <div className="privacy-modal admin-login-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-privacy" onClick={() => setShowAdminLogin(false)}>&times;</button>
                        <div className="privacy-content">
                            <h2>Acceso Administrador</h2>
                            <form className="admin-form" onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label>Usuario</label>
                                    <input
                                        type="text"
                                        value={loginForm.username}
                                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contraseña</label>
                                    <input
                                        type="password"
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        required
                                    />
                                </div>
                                {loginError && <p className="error-msg">{loginError}</p>}
                                <button type="submit" className="cta-button secondary">Ingresar</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showPrivacy && (
                <div className="privacy-overlay" onClick={() => setShowPrivacy(false)}>
                    <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-privacy" onClick={() => setShowPrivacy(false)}>&times;</button>
                        <div className="privacy-content">
                            <h2>Aviso de Privacidad</h2>
                            <p className="privacy-intro"><strong>Responsable del tratamiento de sus datos personales:</strong> Viva Home Inmuebles, con domicilio en Querétaro, es responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección.</p>

                            <div className="privacy-section">
                                <h3>1. Datos Personales que Recabamos</h3>
                                <p>Para las finalidades señaladas en el presente aviso, podemos recabar sus datos de forma directa (entrevistas, formularios) o a través de nuestro sitio web:</p>
                                <ul>
                                    <li><strong>Identificación:</strong> Nombre completo.</li>
                                    <li><strong>Contacto:</strong> Correo electrónico, teléfono fijo y móvil.</li>
                                </ul>
                            </div>

                            <div className="privacy-section">
                                <h3>2. Finalidades del Tratamiento</h3>
                                <p>Sus datos serán utilizados para las siguientes finalidades primarias:</p>
                                <ul>
                                    <li>Brindar asesoría inmobiliaria y gestión de compra, venta o renta de inmuebles.</li>
                                    <li>Elaboración de contratos (promesa, compraventa, arrendamiento).</li>
                                    <li>Intermediación ante notarías públicas, instituciones bancarias o de crédito (Infonavit, Fovissste).</li>
                                    <li>Verificar la identidad y la veracidad de la información proporcionada.</li>
                                </ul>
                                <p>De manera secundaria, podremos utilizar su información para:</p>
                                <ul>
                                    <li>Enviarle promociones o nuevos catálogos de propiedades.</li>
                                    <li>Encuestas de satisfacción y calidad en el servicio.</li>
                                </ul>
                                <p className="privacy-note"><em>Nota: Si no desea que sus datos se utilicen para fines secundarios, puede manifestarlo enviando un correo a la dirección de contacto.</em></p>
                            </div>

                            <div className="privacy-section">
                                <h3>3. Transferencia de Datos</h3>
                                <p>Le informamos que sus datos personales pueden ser compartidos dentro y fuera del país con:</p>
                                <ul>
                                    <li><strong>Notarías Públicas:</strong> Para la formalización de escrituras.</li>
                                    <li><strong>Instituciones Financieras:</strong> Para el trámite de créditos hipotecarios.</li>
                                    <li><strong>Autoridades:</strong> Cuando sea necesario para cumplir con leyes fiscales o de prevención de lavado de dinero (Ley Antilavado).</li>
                                </ul>
                            </div>

                            <div className="privacy-section">
                                <h3>4. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h3>
                                <p>Usted tiene derecho a conocer qué datos tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos. Asimismo, es su derecho solicitar la corrección de su información, que la eliminemos de nuestros registros o legalmente oponerse al uso para fines específicos.</p>
                                <p>Para ejercer estos derechos, debe enviar una solicitud al correo: <strong>vivahomeinmuebles@gmail.com</strong>.</p>
                            </div>

                            <div className="privacy-section">
                                <h3>5. Uso de Cookies en el Sitio Web</h3>
                                <p>Nuestro sitio utiliza "cookies" para mejorar su experiencia de navegación. Usted puede deshabilitarlas en la configuración de su navegador, aunque esto podría limitar ciertas funciones de búsqueda de propiedades en nuestra plataforma.</p>
                            </div>

                            <div className="privacy-section">
                                <h3>6. Cambios al Aviso de Privacidad</h3>
                                <p>Viva Home Inmuebles se reserva el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso para la atención de novedades legislativas o políticas internas. Estas estarán disponibles en nuestra página web: <strong>vivahomeinmuebles.com</strong>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
