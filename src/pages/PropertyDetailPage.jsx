import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = '/api';

function PropertyDetailPage({ properties }) {
    const { id } = useParams();
    const [property, setProperty] = useState(null);

    useEffect(() => {
        // Try to find in passed properties first
        const found = properties.find(p => String(p.id) === id);
        if (found) {
            setProperty(found);
        } else {
            // Fallback: fetch single property if needed (uncomment if API supports it)
            // fetch(`${API_URL}/properties/${id}`).then(res => res.json()).then(data => setProperty(data));
        }
        window.scrollTo(0, 0);
    }, [id, properties]);

    if (!property) {
        return (
            <div className="detail-page">
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h2>Cargando propiedad...</h2>
                    <Link to="/propiedades" className="cta-button">Volver al listado</Link>
                </div>
            </div>
        );
    }

    const { title, price, location, description, images, coordinates, ...chars } = property;
    const mapUrl = coordinates?.lat && coordinates?.lng 
        ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&output=embed` 
        : null;

    return (
        <div className="detail-page">
            <div className="detail-container">
                <div className="detail-header">
                    <Link to="/propiedades" style={{ color: 'var(--gold)', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
                        <i className="fas fa-arrow-left"></i> Volver al listado
                    </Link>
                    <h1 className="detail-title">{title || "Propiedad en Querétaro"}</h1>
                    <div className="detail-price">${price?.toLocaleString() || "Consultar"}</div>
                    <p style={{ color: '#666', marginTop: '10px' }}>
                        <i className="fas fa-map-marker-alt"></i> {location}
                    </p>
                </div>

                <div className="detail-gallery">
                    {images?.length > 0 ? (
                        images.map((img, i) => (
                            <img key={i} src={img} alt={`${title} ${i}`} />
                        ))
                    ) : (
                        <img src={property.image} alt={title} />
                    )}
                </div>

                <div className="detail-main">
                    <div className="detail-left">
                        <div className="detail-content">
                            <h3>Sobre esta propiedad</h3>
                            <p style={{ whiteSpace: 'pre-line', marginTop: '20px', lineHeight: '1.8', color: '#444' }}>
                                {description || "Sin descripción disponible."}
                            </p>

                            <div className="detail-features-grid">
                                {chars.m2_lote && <div className="feature-item"><strong>M² Terreno</strong><span>{chars.m2_lote}</span></div>}
                                {chars.m2_construccion && <div className="feature-item"><strong>M² Const</strong><span>{chars.m2_construccion}</span></div>}
                                {chars.bedrooms && <div className="feature-item"><strong>Recámaras</strong><span>{chars.bedrooms}</span></div>}
                                {chars.bathrooms && <div className="feature-item"><strong>Baños</strong><span>{chars.bathrooms}</span></div>}
                                {chars.parking && <div className="feature-item"><strong>Cochera</strong><span>{chars.parking}</span></div>}
                                {chars.floors && <div className="feature-item"><strong>Pisos</strong><span>{chars.floors}</span></div>}
                                {chars.level && <div className="feature-item"><strong>Nivel</strong><span>{chars.level}</span></div>}
                            </div>
                        </div>

                        {mapUrl && (
                            <div className="detail-content" style={{ marginTop: '30px' }}>
                                <h3>Ubicación</h3>
                                <div style={{ marginTop: '20px' }}>
                                    <iframe 
                                        src={mapUrl}
                                        width="100%" 
                                        height="400" 
                                        style={{ border: 0, borderRadius: '12px' }} 
                                        allowFullScreen="" 
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-sidebar">
                        <div className="detail-content" style={{ position: 'sticky', top: '100px' }}>
                            <h4 style={{ marginBottom: '20px' }}>¿Te interesa esta propiedad?</h4>
                            <p style={{ marginBottom: '25px', color: '#666', fontSize: '0.9rem' }}>Agenda una cita o solicita más información por WhatsApp.</p>
                            <a 
                                href={`https://wa.me/524421080739?text=Hola, me interesa la propiedad: ${title || 'Sin Título'}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="cta-button secondary"
                                style={{ width: '100%', textAlign: 'center' }}
                            >
                                <i className="fab fa-whatsapp"></i> Hablar con un asesor
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailPage;
