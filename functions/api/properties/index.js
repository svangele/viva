export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM properties ORDER BY uploadedAt DESC"
        ).all();

        return Response.json(results.map(row => ({
            ...row,
            coordinates: row.coordinates ? JSON.parse(row.coordinates) : null,
            images: row.images ? JSON.parse(row.images) : [],
            image: row.images ? JSON.parse(row.images)[0] : null
        })));
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const contentType = request.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
            const property = await request.json();
            const id = property.id || Date.now().toString();
            const uploadedAt = property.uploadedAt || new Date().toISOString();

            await env.DB.prepare(`
                INSERT INTO properties (
                    id, title, price, type, status, location, m2_lote, m2_construccion, 
                    bathrooms, parking, bedrooms, floors, level, description, 
                    coordinates, images, water_storage, gas_storage, is_private, 
                    maintenance_fee, service_gas, service_light, service_water, 
                    service_internet, uploadedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title=excluded.title, price=excluded.price, type=excluded.type, status=excluded.status,
                    location=excluded.location, m2_lote=excluded.m2_lote,
                    m2_construccion=excluded.m2_construccion, bathrooms=excluded.bathrooms,
                    parking=excluded.parking, bedrooms=excluded.bedrooms,
                    floors=excluded.floors, level=excluded.level,
                    description=excluded.description, coordinates=excluded.coordinates,
                    images=excluded.images, water_storage=excluded.water_storage,
                    gas_storage=excluded.gas_storage, is_private=excluded.is_private,
                    maintenance_fee=excluded.maintenance_fee, service_gas=excluded.service_gas,
                    service_light=excluded.service_light, service_water=excluded.service_water,
                    service_internet=excluded.service_internet
            `).bind(
                id,
                property.title,
                property.price,
                property.type,
                property.status || 'Disponible',
                property.location,
                property.m2_lote,
                property.m2_construccion,
                property.bathrooms,
                property.parking,
                property.bedrooms,
                property.floors,
                property.level,
                property.description,
                JSON.stringify(property.coordinates),
                JSON.stringify(property.images),
                property.water_storage,
                property.gas_storage,
                property.is_private,
                property.maintenance_fee,
                property.service_gas,
                property.service_light,
                property.service_water,
                property.service_internet,
                uploadedAt
            ).run();

            return Response.json({ success: true, property: { ...property, id, uploadedAt } });
        } else {
            const formData = await request.formData();
            const file = formData.get('image');

            if (!file || !(file instanceof File)) {
                return new Response(JSON.stringify({ error: 'No valid image provided' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `${Date.now()}-${safeName}`;

            await env.R2_BUCKET.put(filename, file.stream(), {
                httpMetadata: { contentType: file.type }
            });

            return Response.json({
                success: true,
                filename,
                image: `/api/properties/${filename}`
            });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;
    try {
        const property = await request.json();
        const id = property.id;

        if (!id) {
            return new Response(JSON.stringify({ error: 'Property ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await env.DB.prepare(`
            UPDATE properties SET
                title=?, price=?, type=?, status=?, location=?, m2_lote=?, m2_construccion=?, 
                bathrooms=?, parking=?, bedrooms=?, floors=?, level=?, description=?, 
                coordinates=?, images=?, water_storage=?, gas_storage=?, is_private=?, 
                maintenance_fee=?, service_gas=?, service_light=?, service_water=?, 
                service_internet=?
            WHERE id = ?
        `).bind(
            property.title,
            property.price,
            property.type,
            property.status || 'Disponible',
            property.location,
            property.m2_lote,
            property.m2_construccion,
            property.bathrooms,
            property.parking,
            property.bedrooms,
            property.floors,
            property.level,
            property.description,
            JSON.stringify(property.coordinates),
            JSON.stringify(property.images || []),
            property.water_storage,
            property.gas_storage,
            property.is_private,
            property.maintenance_fee,
            property.service_gas,
            property.service_light,
            property.service_water,
            property.service_internet,
            id
        ).run();

        return Response.json({ success: true, property });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


