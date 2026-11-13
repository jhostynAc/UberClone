// AI-assisted: see docs/AI_LOG.md #139
import { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

export function useTripRequests(isAvailable, aprobado) {
    const [incomingTrip, setIncomingTrip] = useState(null);
    const [loadingTrip, setLoadingTrip] = useState(false);

    useEffect(() => {
        // 🔒 Si el conductor no está disponible o no está aprobado, no escuchamos solicitudes
        // 💡 Nota para desarrollo: Si quieres probar sin encender el switch, puedes comentar temporalmente: "if (!isAvailable)"
        if (!isAvailable || !aprobado) {
            setIncomingTrip(null);
            return;
        }

        console.log("👂 Escuchando solicitudes de viaje en tiempo real desde Firestore...");
        setLoadingTrip(true);

        // Consulta en tiempo real: Buscamos viajes con status 'requested'
        const q = query(
            collection(db, "trips"),
            where("status", "==", "requested"),
            limit(1) // Tomamos la primera solicitud disponible
        );

        // Suscripción en tiempo real con onSnapshot
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.empty) {
                setIncomingTrip(null);
            } else {
                const docSnap = querySnapshot.docs[0];
                const tripData = { id: docSnap.id, ...docSnap.data() };
                
                console.log("🚗 ¡Nueva solicitud de viaje recibida en el Hook!", tripData);
                setIncomingTrip(tripData);
            }
            setLoadingTrip(false);
        }, (error) => {
            console.error("Error al escuchar solicitudes de viaje:", error);
            setLoadingTrip(false);
        });

        // 🧹 Función de limpieza: Se ejecuta al apagar la disponibilidad o desmontar
        return () => {
            console.log("🧹 Deteniendo la escucha de solicitudes de viaje.");
            unsubscribe();
            setIncomingTrip(null);
        };
    }, [isAvailable, aprobado]);

    return { incomingTrip, setIncomingTrip, loadingTrip };
}