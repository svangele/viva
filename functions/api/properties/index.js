export async function onRequestGet(context) {
    const { env } = context;
    try {
        // Try to get the properties.json database file
        const dbFile = await env.R2_BUCKET.get('properties.json');
        
        if (dbFile) {
            const properties = await dbFile.json();
            return Response.json(properties);
        }

        // Fallback: list all objects if no database file exists
        const listed = await env.R2_BUCKET.list();
        const properties = listed.objects
            .filter(obj => obj.key !== 'properties.json')
            .map(obj => ({
                id: obj.key,
                filename: obj.key,
                image: `/api/properties/${obj.key}`,
                uploadedAt: obj.uploaded
            }));

        // Sort by uploaded date, newest first
        properties.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        return Response.json(properties);
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
            // Save/Update property metadata
            const property = await request.json();
            
            // Get existing properties
            let properties = [];
            const dbFile = await env.R2_BUCKET.get('properties.json');
            if (dbFile) {
                properties = await dbFile.json();
            }

            if (property.id) {
                // Update existing
                const index = properties.findIndex(p => p.id === property.id);
                if (index !== -1) {
                    properties[index] = { ...properties[index], ...property };
                } else {
                    properties.push(property);
                }
            } else {
                // New property
                property.id = Date.now().toString();
                property.uploadedAt = new Date().toISOString();
                properties.push(property);
            }

            // Save back to R2
            await env.R2_BUCKET.put('properties.json', JSON.stringify(properties), {
                httpMetadata: { contentType: 'application/json' }
            });

            return Response.json({ success: true, property });
        } else {
            // Handle Image Upload (existing logic)
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

export async function onRequestDelete(context) {
    const { env, params } = context;
    const filename = params.filename; // You'll need to update the file structure to support this param if not already

    try {
        // If deleting the whole property from the JSON
        const dbFile = await env.R2_BUCKET.get('properties.json');
        if (dbFile) {
            let properties = await dbFile.json();
            // Check if it's a property ID or a filename
            const propertyIndex = properties.findIndex(p => p.id === filename);
            
            if (propertyIndex !== -1) {
                const property = properties[propertyIndex];
                // Optional: delete associated images from R2
                if (property.images) {
                    for (const imgUrl of property.images) {
                        const imgName = imgUrl.split('/').pop();
                        await env.R2_BUCKET.delete(imgName);
                    }
                }
                properties.splice(propertyIndex, 1);
                await env.R2_BUCKET.put('properties.json', JSON.stringify(properties), {
                    httpMetadata: { contentType: 'application/json' }
                });
                return Response.json({ success: true });
            }
        }

        // Fallback: delete the specific file
        await env.R2_BUCKET.delete(filename);
        return Response.json({ success: true });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
