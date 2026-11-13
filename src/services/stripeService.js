// AI-assisted: see docs/AI_LOG.md #193
import { Alert } from 'react-native';

export async function solicitarSesionStripe(tripId, monto) {
    try {
        console.log("💳 Creando sesión de Stripe Checkout para el viaje:", tripId);
        
        // ⚠️ Asegúrate de colocar aquí tu llave secreta real que empieza por sk_test_...
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51UauU9LiU1vDpi9VZvgcgW944zeo31ZLriVyTiTcDaO62bpIwrX3k6odRuwulwZVlSAM7BE9HVn2S5arLXWPzNNN000XNLNmN0';

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                // ❌ Eliminado 'payment_method_types[0]': 'card' (ahora lo maneja Stripe automáticamente desde el dashboard)
                'line_items[0][price_data][currency]': 'cop',
                'line_items[0][price_data][unit_amount]': String(Math.round(monto * 100)), // Centavos COP
                'line_items[0][price_data][product_data][name]': `Viaje Urbano - #${tripId}`,
                'line_items[0][quantity]': '1',
                'mode': 'payment',
                'success_url': 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url': 'https://example.com/cancel',
            }).toString()
        });

        const data = await response.json();
        console.log("📥 Respuesta limpia de Stripe:", data);

        if (data && data.url) {
            return data.url; // ¡Devuelve la URL lista para abrir en el WebView!
        } else {
            console.error("Error al generar sesión de Stripe:", data);
            return null;
        }
    } catch (error) {
        console.error('Error de red al conectar con Stripe:', error);
        return null;
    }
}