import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const API_URL = '/api';

function PropertyListPage({ properties, isAdmin, handleDelete, fetchProperties }) {
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        minPrice: '',
        maxPrice: '',
        location: ''
    });

    const [newProperty, setNewProperty] = useState({
        title: '',
        price: '',
        type: 'Venta',
        status: 'Disponible',
        location: '',
        m2_lote: '',
        m2_construccion: '',
        bathrooms: '',
        parking: '',
        bedrooms: '',
        floors: '',
        level: '',
        description: '',
        water_storage: '',
        gas_storage: '',
        is_private: '',
        maintenance_fee: '',
        service_gas: '',
        service_light: '',
        service_water: '',
        service_internet: '',
        coordinates: { lat: '', lng: '' },
        images: []
    });

    const query = new URLSearchParams(useLocation().search);
    const typeQuery = query.get('type');

    useEffect(() => {
        if (typeQuery) {
            setFilters(prev => ({ ...prev, type: typeQuery }));
        }
    }, [typeQuery]);

    useEffect(() => {
        let result = properties;

        if (filters.type) {
            result = result.filter(p => p.type === filters.type);
        }
        if (filters.minPrice) {
            result = result.filter(p => !p.price || p.price >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
            result = result.filter(p => !p.price || p.price <= Number(filters.maxPrice));
        }
        if (filters.location) {
            result = result.filter(p => (p.location || '').toLowerCase().includes(filters.location.toLowerCase()));
        }

        setFilteredProperties(result);
    }, [filters, properties]);

    const [selectedProperty, setSelectedProperty] = useState(null);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setNewProperty(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setNewProperty(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedImages = [...newProperty.images];

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch(`${API_URL}/properties`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    uploadedImages.push(data.image);
                }
            } catch (err) {
                console.error('Upload error:', err);
            }
        }

        setNewProperty(prev => ({ ...prev, images: uploadedImages }));
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newProperty,
                    price: Number(newProperty.price),
                    m2_lote: Number(newProperty.m2_lote),
                    m2_construccion: Number(newProperty.m2_construccion),
                    bathrooms: Number(newProperty.bathrooms),
                    parking: Number(newProperty.parking),
                    bedrooms: Number(newProperty.bedrooms),
                    floors: Number(newProperty.floors),
                    level: Number(newProperty.level),
                    coordinates: {
                        lat: Number(newProperty.coordinates.lat),
                        lng: Number(newProperty.coordinates.lng)
                    }
                })
            });
            if (res.ok) {
                alert('Propiedad guardada con éxito');
                setNewProperty({
                    title: '', price: '', type: 'Venta', status: 'Disponible', location: '', m2_lote: '', m2_construccion: '',
                    bathrooms: '', parking: '', bedrooms: '', floors: '', level: '', description: '',
                    water_storage: '', gas_storage: '', is_private: '', maintenance_fee: '',
                    service_gas: '', service_light: '', service_water: '', service_internet: '',
                    coordinates: { lat: '', lng: '' }, images: []
                });
                if (fetchProperties) fetchProperties();
            }
        } catch (err) {
            console.error('Error saving property:', err);
        }
    };

    const removeImage = (index) => {
        setNewProperty(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const PropertyDetailModal = () => {
        if (!selectedProperty) return null;

        const { title, price, location, description, images, coordinates, ...chars } = selectedProperty;
        const mapUrl = coordinates?.lat && coordinates?.lng 
            ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&output=embed` 
            : null;

        return (
            <div className="privacy-overlay" onClick={() => setSelectedProperty(null)}>
                <div className="privacy-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                    <button className="close-privacy" onClick={() => setSelectedProperty(null)}>&times;</button>
                    <div className="privacy-content">
                        <div className="modal-gallery" style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px' }}>
                            {images?.map((img, i) => (
                                <img key={i} src={img} alt={`${title} ${i}`} style={{ height: '300px', borderRadius: '12px' }} />
                            )) || <img src={selectedProperty.image} style={{ height: '300px', borderRadius: '12px' }} />}
                        </div>
                        <h2>{title}</h2>
                        <p className="price" style={{ fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 700, margin: '10px 0' }}>
                            ${price?.toLocaleString()}
                        </p>
                        <p className="location" style={{ marginBottom: '20px', color: '#666' }}>
                            <i className="fas fa-map-marker-alt"></i> {location}
                        </p>
                        
                        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', padding: '20px', background: '#f9f9f9', borderRadius: '12px', marginBottom: '20px' }}>
                            {chars.m2_lote && <div><strong><i className="fas fa-expand-arrows-alt" style={{ color: 'var(--gold)', marginRight: '5px' }}></i> M² Lote:</strong> {chars.m2_lote}</div>}
                            {chars.m2_construccion && <div><strong><i className="fas fa-ruler-combined" style={{ color: 'var(--gold)', marginRight: '5px' }}></i> M² Constr:</strong> {chars.m2_construccion}</div>}
                            {chars.bedrooms && <div><strong><i className="fas fa-bed" style={{ color: 'var(--gold)', marginRight: '5px' }}></i> Recámaras:</strong> {chars.bedrooms}</div>}
                            {chars.bathrooms && <div><strong><i className="fas fa-bath" style={{ color: 'var(--gold)', marginRight: '5px' }}></i> Baños:</strong> {chars.bathrooms}</div>}
                            {chars.parking && <div><strong><i className="fas fa-car" style={{ color: 'var(--gold)', marginRight: '5px' }}></i> Est.:</strong> {chars.parking}</div>}
                            {chars.floors && <div><strong><i className="fas fa-layer-group" style={{ color: 'var(--gold)', marginRight: '5px' }}></i> Pisos:</strong> {chars.floors}</div>}
                            {chars.level && <div><strong><i className="fas fa-building" style={{ color: 'var(--gold)', marginRight: '5px' }}></i> Nivel:</strong> {chars.level}</div>}
                        </div>

                        <div className="description-section" style={{ marginBottom: '30px' }}>
                            <h3>Descripción</h3>
                            <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
                        </div>

                        {mapUrl && (
                            <div className="map-section">
                                <h3>Ubicación</h3>
                                <iframe 
                                    src={mapUrl}
                                    width="100%" 
                                    height="350" 
                                    style={{ border: 0, borderRadius: '12px' }} 
                                    allowFullScreen="" 
                                    loading="lazy"
                                ></iframe>
                            </div>
                        )}
                        
                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <a href={`https://wa.me/524421080739?text=Hola, me interesa la propiedad: ${title}`} target="_blank" rel="noopener noreferrer" className="cta-button secondary">
                                <i className="fab fa-whatsapp"></i> Me Interesa
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="property-list-page">
            <div className="container-full">
                <div className="filters-container">
                    <div className="filter-group">
                        <label>Tipo</label>
                        <select name="type" value={filters.type} onChange={handleFilterChange}>
                            <option value="">Todos</option>
                            <option value="Venta">Venta</option>
                            <option value="Renta">Renta</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Precio Mín</label>
                        <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="0" />
                    </div>
                    <div className="filter-group">
                        <label>Precio Máx</label>
                        <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Sin límite" />
                    </div>
                    <div className="filter-group">
                        <label>Ubicación</label>
                        <input type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="Ciudad o Zona" />
                    </div>
                </div>

                <div className="section-header">
                    <h2>Nuestras Propiedades</h2>
                    <div className="header-line"></div>
                </div>

                <div className="property-grid">
                    {filteredProperties.length > 0 ? (
                        filteredProperties.map((prop) => (
                            <div key={prop.id} className="property-card">
                                <Link to={`/propiedad/${prop.id}`} className="property-image-container" style={{ display: 'block' }}>
                                    <img src={prop.images?.[0] || prop.image} alt={prop.title || "Propiedad"} />
                                    {prop.status && prop.status !== 'Disponible' && (
                                        <span className={`status-badge ${prop.status.toLowerCase()}`}>
                                            {prop.status}
                                        </span>
                                    )}
                                    {isAdmin && (
                                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete(prop.id); }}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </Link>
                                <div className="property-info">
                                    <h3>{prop.title || "Propiedad en Querétaro"}</h3>
                                    <p className="price">{prop.price ? `$${prop.price.toLocaleString()}` : "Contactar para precio"}</p>
                                    <p className="location"><i className="fas fa-map-marker-alt"></i> {prop.location || "Querétaro, Qro."}</p>
                                    <div className="features">
                                        {prop.bedrooms && <span><i className="fas fa-bed"></i> {prop.bedrooms}</span>}
                                        {prop.bathrooms && <span><i className="fas fa-bath"></i> {prop.bathrooms}</span>}
                                        {prop.m2_construccion && <span><i className="fas fa-expand"></i> {prop.m2_construccion}m²</span>}
                                    </div>
                                    <Link to={`/propiedad/${prop.id}`} className="view-details" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Ver Detalles</Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1', opacity: 0.6 }}>No se encontraron propiedades con esos filtros.</p>
                    )}
                </div>

                {isAdmin && (
                    <div className="admin-uploader" id="admin-form">
                        <h3>Añadir Nueva Propiedad</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Título de la Propiedad</label>
                                    <input type="text" name="title" value={newProperty.title} onChange={handleInputChange} required placeholder="Ej. Casa minimalista en Juriquilla" />
                                </div>
                                <div className="form-group">
                                    <label>Precio ($)</label>
                                    <input type="number" name="price" value={newProperty.price} onChange={handleInputChange} required placeholder="Ej. 2500000" />
                                </div>
                                <div className="form-group">
                                    <label>Tipo de Operación</label>
                                    <select name="type" value={newProperty.type} onChange={handleInputChange}>
                                        <option value="Venta">Venta</option>
                                        <option value="Renta">Renta</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estado de la Propiedad</label>
                                    <select name="status" value={newProperty.status} onChange={handleInputChange}>
                                        <option value="Disponible">Disponible</option>
                                        <option value="Vendido">Vendido</option>
                                        <option value="Rentado">Rentado</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ubicación</label>
                                    <input type="text" name="location" value={newProperty.location} onChange={handleInputChange} required placeholder="Ej. Juriquilla, Querétaro" />
                                </div>
                                <div className="form-group">
                                    <label>M² Terreno / Lote</label>
                                    <input type="number" name="m2_lote" value={newProperty.m2_lote} onChange={handleInputChange} placeholder="Ej. 200" />
                                </div>
                                <div className="form-group">
                                    <label>M² Construcción</label>
                                    <input type="number" name="m2_construccion" value={newProperty.m2_construccion} onChange={handleInputChange} placeholder="Ej. 180" />
                                </div>
                                <div className="form-group">
                                    <label>Recámaras</label>
                                    <input type="number" name="bedrooms" value={newProperty.bedrooms} onChange={handleInputChange} placeholder="Ej. 3" />
                                </div>
                                <div className="form-group">
                                    <label>Baños</label>
                                    <input type="number" step="0.5" name="bathrooms" value={newProperty.bathrooms} onChange={handleInputChange} placeholder="Ej. 2.5" />
                                </div>
                                <div className="form-group">
                                    <label>Estacionamientos</label>
                                    <input type="number" name="parking" value={newProperty.parking} onChange={handleInputChange} placeholder="Ej. 2" />
                                </div>
                                <div className="form-group">
                                    <label>Pisos / Plantas</label>
                                    <input type="number" name="floors" value={newProperty.floors} onChange={handleInputChange} placeholder="Ej. 2" />
                                </div>
                                <div className="form-group">
                                    <label>Nivel (si es depto)</label>
                                    <input type="number" name="level" value={newProperty.level} onChange={handleInputChange} placeholder="Ej. 1" />
                                </div>
                                <div className="form-group">
                                    <label>Latitud (Maps)</label>
                                    <input type="text" name="coordinates.lat" value={newProperty.coordinates.lat} onChange={handleInputChange} placeholder="Ej. 20.709" />
                                </div>
                                <div className="form-group">
                                    <label>Longitud (Maps)</label>
                                    <input type="text" name="coordinates.lng" value={newProperty.coordinates.lng} onChange={handleInputChange} placeholder="Ej. -100.445" />
                                </div>
                                <div className="form-group full-width">
                                    <label>Descripción</label>
                                    <textarea name="description" value={newProperty.description} onChange={handleInputChange} placeholder="Describe los detalles de la propiedad..." rows="5"></textarea>
                                </div>
                            </div>

                            <div className="section-divider" style={{ margin: '2rem 0', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                                <h4 style={{ marginBottom: '1.5rem', color: 'var(--gold)' }}>Servicios y Equipamiento</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Almacenamiento de Agua</label>
                                        <input type="text" name="water_storage" value={newProperty.water_storage} onChange={handleInputChange} placeholder="Ej. Cisterna 5000L" />
                                    </div>
                                    <div className="form-group">
                                        <label>Almacenamiento de Gas</label>
                                        <input type="text" name="gas_storage" value={newProperty.gas_storage} onChange={handleInputChange} placeholder="Ej. Tanque estacionario 300L" />
                                    </div>
                                    <div className="form-group">
                                        <label>¿Es Privada Cerrada?</label>
                                        <input type="text" name="is_private" value={newProperty.is_private} onChange={handleInputChange} placeholder="Ej. Sí, con vigilancia 24/7" />
                                    </div>
                                    <div className="form-group">
                                        <label>Pago de Mantenimiento</label>
                                        <input type="text" name="maintenance_fee" value={newProperty.maintenance_fee} onChange={handleInputChange} placeholder="Ej. $1,200 mensuales" />
                                    </div>
                                    <div className="form-group">
                                        <label>Servicio de Gas</label>
                                        <input type="text" name="service_gas" value={newProperty.service_gas} onChange={handleInputChange} placeholder="Ej. Gas natural disponible" />
                                    </div>
                                    <div className="form-group">
                                        <label>Servicio de Luz</label>
                                        <input type="text" name="service_light" value={newProperty.service_light} onChange={handleInputChange} placeholder="Ej. CFE trifásica" />
                                    </div>
                                    <div className="form-group">
                                        <label>Servicio de Agua</label>
                                        <input type="text" name="service_water" value={newProperty.service_water} onChange={handleInputChange} placeholder="Ej. Agua de pozo / CEA" />
                                    </div>
                                    <div className="form-group">
                                        <label>Internet</label>
                                        <input type="text" name="service_internet" value={newProperty.service_internet} onChange={handleInputChange} placeholder="Ej. Fibra óptica Telmex/Totalplay" />
                                    </div>
                                </div>
                            </div>

                            <div className="photo-upload-section" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Fotos de la Propiedad</label>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                    {newProperty.images.map((img, index) => (
                                        <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                            <img src={img} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(index)}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    <label className="upload-btn" style={{ width: '100px', height: '100px', display: 'flex', justifyContent: 'center', padding: 0 }}>
                                        <input type="file" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                        <i className="fas fa-camera"></i>
                                    </label>
                                </div>
                                {uploading && <p className="uploading-text">Subiendo archivos...</p>}
                            </div>

                            <button type="submit" className="submit-btn" disabled={uploading}>Publicar Propiedad</button>
                        </form>
                    </div>
                )}
            </div>
        </section>
    );
}

export default PropertyListPage;
