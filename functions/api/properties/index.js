export async function onRequestGet(context) {
    const { env } = context;
    try {
        const listed = await env.R2_BUCKET.list();
        const properties = listed.objects.map(obj => ({
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
        const formData = await request.formData();
        const file = formData.get('image');

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ error: 'No valid image provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Sanitize filename and add timestamp
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${safeName}`;

        // Put object into R2 bucket
        await env.R2_BUCKET.put(filename, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        return Response.json({
            success: true,
            message: 'Propiedad subida correctamente',
            filename,
            image: `/api/properties/${filename}`
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
