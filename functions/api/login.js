export async function onRequestPost(context) {
    const { request } = context;
    try {
        const body = await request.json();

        // Check credentials against the requested user/password
        if (body.username === 'AdminV' && body.password === 'Vargas2026#') {
            return Response.json({ success: true, message: 'Login successful' });
        } else {
            return Response.json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Error procesando la solicitud' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
