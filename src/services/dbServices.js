// AI-assisted: see docs/AI_LOG.md #62
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const COLLECTION = "Conductores"; // Colección principal en Firestore

export const guardarRegistroCompleto = async (datosGlobales) => {
    try {
        const { personales, vehiculo } = datosGlobales;

        // Validamos que exista un documento de identidad para usarlo como ID único
        if (!personales.documento) {
            throw new Error("El documento de identidad es obligatorio para registrar al conductor.");
        }

        // Usamos el número de documento como ID del documento en Firestore
        const conductorRef = doc(db, COLLECTION, personales.documento);
        
        // Consolidamos toda la información en un solo documento estructurado
        await setDoc(conductorRef, {
            personales: {
                ...personales,
                fechaNacimiento: personales.fechaNacimiento ? personales.fechaNacimiento.toISOString() : null
            },
            vehiculo: {
                ...vehiculo
            },
            estadoRegistro: 'completado',
            fechaActualizacion: new Date().toISOString()
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        return { success: false, error: error.message };
    }
};