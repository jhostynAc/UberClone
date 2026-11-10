// AI-assisted: see docs/AI_LOG.md #75
export const subirACloudinary = async (imageUri) => {
    try {
        if (!imageUri) return null;

        // Si la imagen ya es una URL web de Cloudinary, no la vuelve a subir
        if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
            return imageUri;
        }

        const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

        if (!uploadPreset || !cloudName) {
            console.error("ERROR: Faltan las variables de entorno de Cloudinary en el archivo .env");
            throw new Error("Configuración de Cloudinary incompleta.");
        }

        // Solución para el error [Unsupported FormDataPart implementation] en Expo:
        // Convertimos la URI local en un blob mediante fetch nativo para que el FormData lo acepte
        const responseFile = await fetch(imageUri);
        const blob = await responseFile.blob();

        const data = new FormData();
        data.append('file', blob, 'upload.jpg');
        data.append('upload_preset', uploadPreset);
        data.append('cloud_name', cloudName);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: data,
            }
        );

        const result = await response.json();

        if (result.secure_url) {
            console.log("Imagen subida con éxito a Cloudinary:", result.secure_url);
            return result.secure_url;
        } else {
            console.error("ERROR: Error devuelto por Cloudinary:", result);
            throw new Error(result.error?.message || "No se pudo obtener la URL segura de Cloudinary.");
        }
    } catch (error) {
        console.error("ERROR: Excepción en subirACloudinary:", error);
        throw error;
    }
};