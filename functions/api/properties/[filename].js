export async function onRequestGet(context) {
    const { env, params } = context;
    const filename = params.filename; // filename matches the dynamic segment [filename].js

    try {
        const object = await env.R2_BUCKET.get(filename);

        if (object === null) {
            return new Response('Imagen no encontrada', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Cache the image for performance
        headers.set('Cache-Control', 'public, max-age=31536000');

        return new Response(object.body, { headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const { env, params } = context;
    const id = params.filename;

    try {
        const property = await env.DB.prepare("SELECT images FROM properties WHERE id = ?").bind(id).first();
        
        if (property) {
            if (property.images) {
                const images = JSON.parse(property.images);
                for (const imgUrl of images) {
                    const imgName = imgUrl.split('/').pop();
                    await env.R2_BUCKET.delete(imgName);
                }
            }
            await env.DB.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();
            return Response.json({ success: true, message: 'Propiedad eliminada correctamente' });
        }

        // Fallback for direct image deletion if param is filename
        await env.R2_BUCKET.delete(id);
        return Response.json({ success: true });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
