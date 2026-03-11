import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = '/api';

function PropertyDetailPage({ properties, isAdmin, fetchProperties }) {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const found = properties.find(p => String(p.id) === id);
        if (found) {
            setProperty(found);
            setEditForm(found);
        }
        window.scrollTo(0, 0);
    }, [id, properties]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                await fetchProperties();
                setIsEditing(false);
            } else {
                alert('Error al guardar los cambios');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

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

    const mapUrl = property.coordinates?.lat && property.coordinates?.lng 
        ? `https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&output=embed` 
        : null;

    return (
        <div className="detail-page">
            <div className="detail-container">
                <div className="detail-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Link to="/propiedades" style={{ color: 'var(--gold)', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
                                <i className="fas fa-arrow-left"></i> Volver al listado
                            </Link>
                            {!isEditing ? (
                                <>
                                    <h1 className="detail-title">{property.title || "Propiedad en Querétaro"}</h1>
                                    <div className="detail-price">${property.price?.toLocaleString() || "Consultar"}</div>
                                </>
                            ) : (
                                <div style={{ marginBottom: '20px' }}>
                                    <input 
                                        className="edit-input" 
                                        value={editForm.title} 
                                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                                        placeholder="Título de la propiedad"
                                        style={{ fontSize: '2rem', fontWeight: 'bold' }}
                                    />
                                    <input 
                                        className="edit-input" 
                                        type="number"
                                        value={editForm.price} 
                                        onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                                        placeholder="Precio"
                                    />
                                </div>
                            )}
                            <p style={{ color: '#666', marginTop: '10px' }}>
                                <i className="fas fa-map-marker-alt"></i> 
                                {isEditing ? (
                                    <input 
                                        className="edit-input" 
                                        value={editForm.location} 
                                        onChange={e => setEditForm({...editForm, location: e.target.value})}
                                        placeholder="Ubicación"
                                    />
                                ) : property.location}
                            </p>
                        </div>

                        {isAdmin && (
                            <div className="edit-actions">
                                {!isEditing ? (
                                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                        <i className="fas fa-edit"></i> Modificar Propiedad
                                    </button>
                                ) : (
                                    <>
                                        <button className="save-btn" onClick={handleSave} disabled={saving}>
                                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                        <button className="cancel-btn" onClick={() => { setIsEditing(false); setEditForm(property); }}>
                                            Cancelar
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-gallery">
                    {property.images?.length > 0 ? (
                        property.images.map((img, i) => (
                            <img key={i} src={img} alt={`${property.title} ${i}`} />
                        ))
                    ) : (
                        <img src={property.image} alt={property.title} />
                    )}
                </div>

                <div className="detail-main">
                    <div className="detail-left">
                        <div className="detail-content">
                            <h3>Sobre esta propiedad</h3>
                            {!isEditing ? (
                                <p style={{ whiteSpace: 'pre-line', marginTop: '20px', lineHeight: '1.8', color: '#444' }}>
                                    {property.description || "Sin descripción disponible."}
                                </p>
                            ) : (
                                <textarea 
                                    className="edit-textarea" 
                                    rows="8"
                                    value={editForm.description} 
                                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                                    placeholder="Descripción de la propiedad"
                                    style={{ marginTop: '20px' }}
                                />
                            )}

                            <div className="detail-features-grid">
                                {['m2_lote', 'm2_construccion', 'bedrooms', 'bathrooms', 'parking', 'floors', 'level'].map(key => (
                                    <div className="feature-item" key={key}>
                                        <strong>{key.replace('_', ' ')}</strong>
                                        {isEditing ? (
                                            <input 
                                                className="edit-input" 
                                                value={editForm[key] || ''} 
                                                onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                                            />
                                        ) : (
                                            <span>{property[key]}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!isEditing && mapUrl && (
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
                        
                        {isEditing && (
                            <div className="detail-content" style={{ marginTop: '30px' }}>
                                <h3>Coordenadas GPS (Google Maps)</h3>
                                <div className="edit-form-grid" style={{ marginTop: '20px' }}>
                                    <input 
                                        className="edit-input" 
                                        placeholder="Latitud"
                                        value={editForm.coordinates?.lat || ''} 
                                        onChange={e => setEditForm({
                                            ...editForm, 
                                            coordinates: { ...editForm.coordinates, lat: e.target.value }
                                        })}
                                    />
                                    <input 
                                        className="edit-input" 
                                        placeholder="Longitud"
                                        value={editForm.coordinates?.lng || ''} 
                                        onChange={e => setEditForm({
                                            ...editForm, 
                                            coordinates: { ...editForm.coordinates, lng: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-sidebar">
                        <div className="detail-content" style={{ position: 'sticky', top: '100px' }}>
                            <h4 style={{ marginBottom: '20px' }}>¿Te interesa esta propiedad?</h4>
                            <p style={{ marginBottom: '25px', color: '#666', fontSize: '0.9rem' }}>Agenda una cita o solicita más información por WhatsApp.</p>
                            <a 
                                href={`https://wa.me/524421080739?text=Hola, me interesa la propiedad: ${property.title || 'Sin Título'}`} 
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
