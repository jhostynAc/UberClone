import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const COLLECTION = "Conductores";

export const guardarRegistroCompleto = async (datosGlobales, ubicacionInicial = null) => {
    try {
        const { personales, vehiculo, documentos } = datosGlobales;

        if (!personales?.documento) {
            throw new Error("El documento de identidad es obligatorio para generar el registro.");
        }

        const conductorRef = doc(db, COLLECTION, personales.documento);
        
        await setDoc(conductorRef, {
            personales: {
                ...personales, // Incluye nombre, documento, teléfono, correo, género y la nueva contraseña
                fechaNacimiento: personales.fechaNacimiento ? new Date(personales.fechaNacimiento).toISOString() : null
            },
            vehiculo: {
                ...vehiculo
            },
            documentos: {
                ...documentos,
                licenciaVencimiento: documentos.licenciaVencimiento ? new Date(documentos.licenciaVencimiento).toISOString() : null,
                soatVencimiento: documentos.soatVencimiento ? new Date(documentos.soatVencimiento).toISOString() : null,
                tecnoVencimiento: documentos.tecnoVencimiento ? new Date(documentos.tecnoVencimiento).toISOString() : null,
            },
            ubicacionActual: {
                latitude: ubicacionInicial ? ubicacionInicial.latitude : 6.2442, 
                longitude: ubicacionInicial ? ubicacionInicial.longitude : -75.5812,
                timestamp: new Date().toISOString()
            },
            aprobado: false,         // Bloqueado hasta que la administración lo apruebe
            isAvailable: false,      // Desconectado por defecto
            estadoRegistro: 'completado',
            fechaActualizacion: new Date().toISOString()
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error al guardar en Firebase Firestore:", error);
        return { success: false, error: error.message };
    }
};