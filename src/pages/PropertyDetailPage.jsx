import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = '/api';

function PropertyDetailPage({ properties, isAdmin, fetchProperties }) {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        const found = properties.find(p => String(p.id) === id);
        if (found) {
            setProperty(found);
            setEditForm(found);
        }
        window.scrollTo(0, 0);
    }, [id, properties]);

    const generatePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const dateStr = new Date().toLocaleDateString('es-MX');

            const addDecorations = (doc) => {
                const totalPages = doc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    // Header
                    doc.setDrawColor(0);
                    doc.setLineWidth(0.4);
                    doc.line(15, 10, pageWidth - 15, 10);
                    
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.text(property.title, 15, 15);
                    
                    const priceStr = `$${property.price?.toLocaleString()}`;
                    const locationStr = property.location;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(80);
                    doc.text(`${priceStr}  •  ${locationStr}`, 15, 20);
                    
                    // Footer
                    doc.setDrawColor(0);
                    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
                    doc.setFontSize(9);
                    doc.setTextColor(100);
                    doc.text(`Ficha generada el ${dateStr}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                    doc.setTextColor(0);
                }
            };

            const captureAndAdd = async (htmlContent, startNewPage = false) => {
                const container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.width = '700px';
                container.style.padding = '20px 0'; // Space for internal flow
                container.style.backgroundColor = '#ffffff';
                container.style.fontFamily = 'Arial, sans-serif';
                container.innerHTML = htmlContent;
                document.body.appendChild(container);

                await new Promise(resolve => setTimeout(resolve, 1500));
                const canvas = await html2canvas(container, { useCORS: true, scale: 3, backgroundColor: '#ffffff' });
                document.body.removeChild(container);

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgWidth = pageWidth - 30; // Margin 15 each side
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                if (startNewPage && pdf.internal.getNumberOfPages() > 0) {
                    pdf.addPage();
                }

                let heightLeft = imgHeight;
                let position = 25; // Adjusted down to avoid multi-line header
                const maxPageHeight = pageHeight - 45; // Space for header/footer

                pdf.addImage(imgData, 'JPEG', 15, position, imgWidth, imgHeight);
                heightLeft -= maxPageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight + 20;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 15, position, imgWidth, imgHeight);
                    heightLeft -= maxPageHeight;
                }
            };

            // Part 1: Main Info
            const images = [...(property.images || [])];
            if (images.length === 0 && property.image) images.push(property.image);
            const mainPhoto = images[0];
            const secondaryPhotos = images.slice(1, 6);

            const infoHtml = `
                <div style="padding-top: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <h2 style="margin: 0; font-size: 18pt; color: #333;">$${property.price?.toLocaleString()}</h2>
                        <span style="font-size: 10pt; color: #666;">${property.location}</span>
                    </div>

                    <div style="display: flex; gap: 30px; margin-bottom: 30px; align-items: flex-start;">
                        <div style="flex: 1;">
                            <h3 style="font-size: 11pt; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 5px; margin-bottom: 15px;">Características</h3>
                            ${([...propertyFeatures, ...serviceFeatures])
                                .filter(f => property[f.key])
                                .map(f => `
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f5f5f5; font-size: 9pt;">
                                        <span style="font-weight: bold;">${f.label}</span>
                                        <span>${property[f.key]}</span>
                                    </div>
                                `).join('')}
                        </div>
                        <div style="flex: 1;">
                            ${mainPhoto ? `<img src="${mainPhoto}" crossorigin="anonymous" style="width: 100%; height: 320px; object-fit: cover; border: 1px solid #eee;" />` : ''}
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="font-size: 11pt; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 5px; margin-bottom: 15px;">Descripción</h3>
                        <p style="text-align: justify; color: #222; margin: 0; font-size: 10pt; line-height: 1.6;">${property.description}</p>
                    </div>
                </div>
            `;
            
            await captureAndAdd(infoHtml);

            // Part 2: Secondary Photos (on a new page)
            if (secondaryPhotos.length > 0) {
                const photosHtml = `
                    <div style="padding-top: 10px;">
                        <h3 style="font-size: 11pt; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 5px; margin-bottom: 25px;">Fotografías Adicionales</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            ${secondaryPhotos.map(img => `
                                <div style="height: 250px; overflow: hidden; border: 1px solid #eee;">
                                    <img src="${img}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" />
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                await captureAndAdd(photosHtml, true);
            }

            addDecorations(pdf);
            pdf.save(`Ficha-${property.title.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error('PDF error:', err);
            alert('Error al generar el PDF.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/properties`, {
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

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedImages = [...(editForm.images || [])];

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

        setEditForm(prev => ({ ...prev, images: uploadedImages }));
        setUploading(false);
    };

    const removeImage = (index) => {
        setEditForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
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

    const propertyFeatures = [
        { key: 'm2_lote', label: 'M² Lote', icon: 'fas fa-expand-arrows-alt' },
        { key: 'm2_construccion', label: 'M² Constr', icon: 'fas fa-ruler-combined' },
        { key: 'bedrooms', label: 'Recámaras', icon: 'fas fa-bed' },
        { key: 'bathrooms', label: 'Baños', icon: 'fas fa-bath' },
        { key: 'parking', label: 'Est.', icon: 'fas fa-car' },
        { key: 'floors', label: 'Pisos', icon: 'fas fa-layer-group' },
        { key: 'level', label: 'Nivel', icon: 'fas fa-building' },
        { key: 'is_private', label: 'Privada', icon: 'fas fa-shield-alt' },
        { key: 'maintenance_fee', label: 'Mantenimiento', icon: 'fas fa-money-bill-alt' }
    ];

    const serviceFeatures = [
        { key: 'water_storage', label: 'Alm. Agua', icon: 'fas fa-faucet' },
        { key: 'gas_storage', label: 'Alm. Gas', icon: 'fas fa-fire' },
        { key: 'service_gas', label: 'Gas', icon: 'fas fa-burn' },
        { key: 'service_light', label: 'Luz', icon: 'fas fa-bolt' },
        { key: 'service_water', label: 'Agua', icon: 'fas fa-tint' },
        { key: 'service_internet', label: 'Internet', icon: 'fas fa-wifi' }
    ];

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
                                    <select
                                        className="edit-input"
                                        value={editForm.status || 'Disponible'}
                                        onChange={e => setEditForm({...editForm, status: e.target.value})}
                                        style={{ marginTop: '10px' }}
                                    >
                                        <option value="Disponible">Disponible</option>
                                        <option value="Vendido">Vendido</option>
                                        <option value="Rentado">Rentado</option>
                                    </select>
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
                            <div className="edit-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {!isEditing ? (
                                    <>
                                        <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                            <i className="fas fa-edit"></i> Modificar
                                        </button>
                                        <button className="save-btn" onClick={generatePDF} disabled={isGeneratingPDF} style={{ background: '#333' }}>
                                            <i className="fas fa-file-pdf"></i> {isGeneratingPDF ? 'Generando...' : 'Generar Ficha'}
                                        </button>
                                    </>
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

                {isEditing ? (
                    <div className="photo-upload-section" style={{ padding: '20px', background: '#f5f5f5', borderRadius: '12px', marginTop: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Editar Fotos de la Propiedad</h3>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                            {(editForm.images || []).map((img, index) => (
                                <div key={index} style={{ position: 'relative', width: '120px', height: '120px' }}>
                                    <img src={img} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(index)}
                                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', fontSize: '14px', zIndex: 10 }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <label className="upload-btn" style={{ width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--white)', border: '2px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                                <input type="file" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                <i className="fas fa-camera" style={{ fontSize: '24px', color: '#666' }}></i>
                            </label>
                        </div>
                        {uploading && <p style={{ color: 'var(--forest-green)', fontWeight: 'bold' }}>Subiendo fotos, por favor espera...</p>}
                    </div>
                ) : (
                    <div className="detail-gallery" style={{ position: 'relative' }}>
                        {property.status && property.status !== 'Disponible' && (
                            <span className={`status-badge ${property.status.toLowerCase()}`}>
                                {property.status}
                            </span>
                        )}
                        {property.images?.length > 0 ? (
                            property.images.map((img, i) => (
                                <img key={i} src={img} alt={`${property.title} ${i}`} />
                            ))
                        ) : (
                            <img src={property.image} alt={property.title} />
                        )}
                    </div>
                )}

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
                                {propertyFeatures.map(feat => (
                                    (property[feat.key] || isEditing) && (
                                        <div className="feature-item" key={feat.key}>
                                            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <i className={feat.icon} style={{ color: 'var(--gold)' }}></i> 
                                                {feat.label}
                                            </strong>
                                            {isEditing ? (
                                                <input 
                                                    className="edit-input" 
                                                    value={editForm[feat.key] || ''} 
                                                    onChange={e => setEditForm({...editForm, [feat.key]: e.target.value})}
                                                />
                                            ) : (
                                                <span>{property[feat.key]}</span>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="services-section" style={{ marginTop: '30px', padding: '20px', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #eee' }}>
                                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Servicios y Equipamiento</h3>
                                <div className="detail-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                    {serviceFeatures.map(feat => (
                                        (property[feat.key] || isEditing) && (
                                            <div className="feature-item" key={feat.key}>
                                                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <i className={feat.icon} style={{ color: 'var(--gold)' }}></i> 
                                                    {feat.label}
                                                </strong>
                                                {isEditing ? (
                                                    <input 
                                                        className="edit-input" 
                                                        value={editForm[feat.key] || ''} 
                                                        onChange={e => setEditForm({...editForm, [feat.key]: e.target.value})}
                                                    />
                                                ) : (
                                                    <span>{property[feat.key]}</span>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
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
