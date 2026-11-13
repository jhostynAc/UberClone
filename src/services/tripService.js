import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// 🚀 Crear viaje de prueba limpio con todos los campos que la tarjeta y el mapa necesitan
export const crearViajePrueba = async () => {
    try {
        const docRef = await addDoc(collection(db, "trips"), {
            status: "requested",
            passengerId: "pasajero_456",
            fare: 24000,
            commission: 3600,
            netEarnings: 20400,
            category: "Económico",
            paymentMethod: "digital",
            origin: {
                latitude: 6.2442,
                longitude: -75.5812,
                address: "Parque Lleras, Medellín"
            },
            destination: {
                latitude: 6.2600,
                longitude: -75.5600,
                address: "Jardín Botánico, Medellín"
            },
            createdAt: serverTimestamp()
        });
        console.log("🚀 ¡Viaje de prueba creado con ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error al crear el viaje de prueba:", error);
    }
};

// 🔄 Actualizar el estado y asignar el conductor al aceptar
export const actualizarEstadoViaje = async (tripId, nuevoEstado, conductorId = null) => {
    try {
        const tripRef = doc(db, "trips", tripId);
        const dataToUpdate = {
            status: nuevoEstado,
            updatedAt: serverTimestamp()
        };
        if (conductorId) {
            dataToUpdate.driverId = conductorId;
        }
        await updateDoc(tripRef, dataToUpdate);
        console.log(`✅ Viaje ${tripId} actualizado a: ${nuevoEstado}`);
    } catch (error) {
        console.error("Error al actualizar el estado del viaje:", error);
    }
};