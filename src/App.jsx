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
                                <p>Email: vivahomeinmuebles@gmail.com</p>
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
                
                <a href="https://wa.me/524421080739" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
                    <i className="fab fa-whatsapp"></i>
                    <span>¿Cómo podemos ayudarte?</span>
                </a>
            </div>
        </Router>
    );
}

export default App;
