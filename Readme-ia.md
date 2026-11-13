# Bitácora de Desarrollo - Historial Completo de Conversación y Ajustes
### Mirar el link ya que no me da la bitacora completa solo lo mas reciente

-https://share.gemini.google/wc3bpZaBxDdJ

### Entrada #1: Inicio e Intención de Integración
- **Fecha:** 2026-11-13
- **Integrante:** Jhostyn Albira
- **Herramienta:** Gemini
- **Objetivo:** Definir la implementación de una pasarela digital en la app de conductores (React Native/Expo).
- **Prompt:** "debo entonces crear primero la pasarela en mercado pago"
- **Resumen:** Se explicó que no era necesario crear botones estáticos manualmente, sino configurar solicitudes dinámicas de preferencia a través de la API con el Access Token.
- **Archivos y commit:** `src/services/mercadoPagoService.js` – 3f4a1e2

### Entrada #2: Configuración de Credenciales
- **Fecha:** 2026-11-13
- **Integrante:** Jhostyn Albira
- **Herramienta:** Gemini
- **Objetivo:** Obtener las credenciales de prueba (`TEST-`) en Mercado Pago.
- **Prompt:** "como cargo eso" / "ESO ME PIDE UNOS PASOS LOS DEBO HACER SI O SI? O DONDE ENCUENTRO EL ACCES TOKEN" / "no me deja tener las credenciales de prueba"
- **Resumen:** Se detalló la ubicación del Access Token en el panel de desarrolladores y se evaluó el impacto de las políticas de verificación local.
- **Archivos y commit:** `src/services/mercadoPagoService.js` – b8c9d21

### Entrada #3: Migración a Stripe
- **Fecha:** 2026-11-13
- **Integrante:** Jhostyn Albira
- **Herramienta:** Gemini
- **Objetivo:** Cambiar la pasarela de Mercado Pago a Stripe por restricciones de cuenta en Colombia.
- **Prompt:** "ejor cambiemos a stripe" / "como creo la cuenta en stripe" / "donde coloco la clave secreta" / "o lo coloco en un .env"
- **Resumen:** Se adoptó Stripe Checkout Sessions en modo de prueba (`sk_test`) utilizando un archivo `.env` para proteger las llaves de seguridad.
- **Archivos y commit:** `src/services/stripeService.js`, `.env` – c7d4e5f

### Entrada #4: Código de DriverHome y WebView
- **Fecha:** 2026-11-13
- **Integrante:** Jhostyn Albira
- **Herramienta:** Gemini
- **Objetivo:** Integrar el servicio de Stripe en la pantalla principal del conductor y adaptar el modal WebView.
- **Prompt:** "dame todo lo del driver home" / "ahora debo cambiar el modal de pago de ahora?"
- **Resumen:** Se entregó el código completo de `DriverHome.js` conectado a Stripe y se adaptó `StripeModal.jsx` para escuchar redirecciones de éxito (`success`).
- **Archivos y commit:** `src/screens/DriverHome.js`, `src/components/StripeModal.jsx` – 9f8e7d6

### Entrada #5: Resolución de Errores de API y Llaves
- **Fecha:** 2026-11-13
- **Integrante:** Jhostyn Albira
- **Herramienta:** Gemini
- **Objetivo:** Depurar errores de importación (`TypeError`), credenciales inválidas y parámetros obsoletos de Stripe.
- **Prompt:** "ERROR [Error: Uncaught (in promise, id: 0): "TypeError: undefined is not a function"]", "ERROR Error al generar sesión de Stripe: Invalid API Key provided...", "pk_test_...", "ERROR Error al generar sesión de Stripe: The payment_method_types parameter is no longer supported...", "donde estan las tarjetas de pruebas"
- **Resumen:** Se corrigieron las importaciones nombradas en `DriverHome.js`, se indicó el uso de la clave secreta `sk_test` en lugar de la publicable `pk_test`, se eliminó el parámetro deprecado `payment_method_types` y se facilitó la tarjeta de prueba oficial (`4242 4242 4242 4242`).
- **Archivos y commit:** `src/services/stripeService.js` – c4d5e6f