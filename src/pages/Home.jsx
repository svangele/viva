import React from 'react';
import { Link } from 'react-router-dom';

const carouselImages = [
    { id: 1, url: "/images/carrusel1.png", title: "Encuentra tu Hogar", subtitle: "Expertos en Ventas y Rentas" },
    { id: 2, url: "/images/carrusel2.png", title: "Asesoría Profesional", subtitle: "Tomamos las mejores decisiones contigo" },
    { id: 3, url: "/images/carrusel3.png", title: "Propiedades Exclusivas", subtitle: "Calidad y Plusvalía Garantizada" },
    { id: 4, url: "/images/carrusel4.png", title: "Tu Próximo Paso", subtitle: "Acompañandote en cada trámite" }
];

const WHATSAPP_URL = "https://wa.me/524421080739";

function Home({ currentSlide, setCurrentSlide, properties, isAdmin, handleDelete }) {
    return (
        <main>
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
                                    <Link to="/propiedades" className="cta-button">Ver Más</Link>
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
                        {properties.slice(0, 6).map((prop) => (
                            <Link key={prop.id} to={`/propiedad/${prop.id}`} className="property-card gallery-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="property-image">
                                    <img src={prop.image} alt="Propiedad" />
                                    {isAdmin && (
                                        <button className="delete-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(prop.filename); }}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link to="/propiedades" className="cta-button black">Ver Todas las Propiedades</Link>
                    </div>
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
        </main>
    );
}

export default Home;
