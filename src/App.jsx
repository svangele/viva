import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyListPage from './pages/PropertyListPage';
import PropertyDetailPage from './pages/PropertyDetailPage';

function App() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [properties, setProperties] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [uploading, setUploading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const API_URL = '/api';

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch(`${API_URL}/properties`);
            const data = await res.json();
            
            if (Array.isArray(data)) {
                setProperties(data.map((item, index) => ({
                    id: item.id || index,
                    image: item.images?.[0] || item.image || `/propiedades/${item.filename || item}`,
                    filename: item.filename || item,
                    ...item
                })));
            } else {
                console.error('API did not return an array:', data);
                setProperties([]);
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
            setProperties([]);
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
            const res = await fetch(`${API_URL}/properties`, {
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
                alert('Propiedad eliminada con éxito');
            } else {
                const data = await res.json();
                alert('Error al eliminar: ' + (data.error || res.statusText));
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error de red al intentar eliminar');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 4); // Fixed to 4 carousel images
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Router>
            <div className="app-container">
                <Navbar setShowAdminLogin={setShowAdminLogin} />

                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <Home 
                                currentSlide={currentSlide} 
                                setCurrentSlide={setCurrentSlide}
                                properties={properties}
                                isAdmin={isAdmin}
                                handleDelete={handleDelete}
                            />
                        } 
                    />
                    <Route 
                        path="/propiedades" 
                        element={
                            <PropertyListPage 
                                properties={properties}
                                isAdmin={isAdmin}
                                handleUpload={handleUpload}
                                handleDelete={handleDelete}
                                uploading={uploading}
                                fetchProperties={fetchProperties}
                            />
                        } 
                    />
                    <Route 
                        path="/propiedad/:id" 
                        element={
                            <PropertyDetailPage 
                                properties={properties} 
                                isAdmin={isAdmin} 
                                fetchProperties={fetchProperties} 
                            />
                        } 
                    />
                </Routes>

                <footer className="footer">
                    <div className="container-full">
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
                                <p>Email: contacto@vivahomeinmuebles.com</p>
                            </div>
                            <div className="footer-links">
                                <h4>Enlaces</h4>
                                <ul>
                                    <li><a href="/propiedades?type=Venta">Venta</a></li>
                                    <li><a href="/propiedades?type=Renta">Renta</a></li>
                                    <li><a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>Aviso de Privacidad</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            &copy; 2026 Viva Home Inmuebles. Todos los derechos reservados.
                        </div>
                    </div>
                </footer>

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
                                {isAdmin && (
                                    <button 
                                        className="logout-btn" 
                                        onClick={() => { setIsAdmin(false); setShowAdminLogin(false); }}
                                        style={{ marginTop: '1rem', width: '100%' }}
                                    >
                                        Cerrar Sesión
                                    </button>
                                )}
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
                                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--gold)' }}>ViVa Home Inmuebles</h3>
                                <p className="privacy-intro">En cumplimiento con lo establecido por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, se informa a los usuarios del sitio web que ViVa Home Inmuebles, representada por Patricia Vargas, con domicilio en Querétaro, México, es responsable del uso y protección de sus datos personales.</p>

                                <div className="privacy-section">
                                    <h3>Datos personales que se recaban</h3>
                                    <p>A través de nuestro sitio web, formularios de contacto, llamadas telefónicas o medios digitales, podremos recabar los siguientes datos:</p>
                                    <ul>
                                        <li>Nombre completo</li>
                                        <li>Número telefónico</li>
                                        <li>Correo electrónico</li>
                                        <li>Información relacionada con compra, venta o renta de inmuebles</li>
                                        <li>Datos necesarios para la gestión de trámites inmobiliarios o financieros</li>
                                    </ul>
                                </div>

                                <div className="privacy-section">
                                    <h3>Finalidad del uso de los datos</h3>
                                    <p>Los datos personales recabados serán utilizados para las siguientes finalidades:</p>
                                    <ul>
                                        <li>Brindar información sobre propiedades en venta o renta</li>
                                        <li>Dar seguimiento a solicitudes de clientes potenciales</li>
                                        <li>Contactar a los interesados para ofrecer asesoría inmobiliaria</li>
                                        <li>Integrar expedientes para operaciones de compra, venta o arrendamiento</li>
                                        <li>Enviar información sobre nuevos desarrollos, promociones o servicios inmobiliarios</li>
                                    </ul>
                                </div>

                                <div className="privacy-section">
                                    <h3>Protección de la información</h3>
                                    <p>ViVa Home Inmuebles implementa medidas de seguridad administrativas, técnicas y físicas para proteger los datos personales contra daño, pérdida, alteración o acceso no autorizado.</p>
                                </div>

                                <div className="privacy-section">
                                    <h3>Transferencia de datos</h3>
                                    <p>Sus datos podrán ser compartidos únicamente cuando sea necesario con:</p>
                                    <ul>
                                        <li>Instituciones financieras o bancarias</li>
                                        <li>Notarías públicas</li>
                                        <li>Desarrolladores o propietarios de inmuebles</li>
                                        <li>Autoridades competentes cuando la ley lo requiera</li>
                                    </ul>
                                </div>

                                <div className="privacy-section">
                                    <h3>Derechos ARCO</h3>
                                    <p>El titular de los datos personales tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (Derechos ARCO) al tratamiento de sus datos.</p>
                                    <p>Para ejercer estos derechos puede enviar una solicitud al correo electrónico: <strong>vivahomeinmuebles@gmail.com</strong></p>
                                    <p>Incluyendo:</p>
                                    <ul>
                                        <li>Nombre completo</li>
                                        <li>Medio de contacto</li>
                                        <li>Descripción clara de la solicitud</li>
                                    </ul>
                                </div>

                                <div className="privacy-section">
                                    <h3>Modificaciones al aviso de privacidad</h3>
                                    <p>ViVa Home Inmuebles se reserva el derecho de realizar modificaciones al presente aviso de privacidad, las cuales serán publicadas en este mismo sitio web.</p>
                                </div>

                                <div className="privacy-section">
                                    <h3>Contacto</h3>
                                    <p>Para cualquier duda relacionada con este aviso de privacidad, puede comunicarse a:</p>
                                    <p>📧 vivahomeinmuebles@gmail.com</p>
                                    <p>📞 442 108 0739 / 442 202 4850</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <a href="https://wa.me/524421080739" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
                    <i className="fab fa-whatsapp"></i>
                    <span>¿Cómo podemos ayudarte?</span>
                </a>
            </div>
        </Router>
    );
}

export default App;
