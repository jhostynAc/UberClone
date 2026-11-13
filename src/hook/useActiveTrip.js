// AI-assisted: see docs/AI_LOG.md #111
import { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

export function useActiveTrip(conductorId, isAvailable) {
    const [activeTrip, setActiveTrip] = useState(null);
    const [loadingActiveTrip, setLoadingActiveTrip] = useState(true);

    useEffect(() => {
        if (!conductorId) {
            setLoadingActiveTrip(false);
            return;
        }

        console.log("👂 Escuchando viaje activo del conductor en Firestore...");

        // Buscamos si el conductor tiene un viaje asignado en curso (accepted, driver_arriving, in_progress)
        const q = query(
            collection(db, "trips"),
            where("driverId", "==", conductorId),
            where("status", "in", ["accepted", "driver_arriving", "in_progress"]),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.empty) {
                setActiveTrip(null);
            } else {
                const docSnap = querySnapshot.docs[0];
                const tripData = { id: docSnap.id, ...docSnap.data() };
                console.log("🚗 Viaje activo encontrado en estado:", tripData.status);
                setActiveTrip(tripData);
            }
            setLoadingActiveTrip(false);
        }, (error) => {
            console.error("Error al escuchar el viaje activo:", error);
            setLoadingActiveTrip(false);
        });

        return () => {
            console.log("🧹 Deteniendo la escucha del viaje activo.");
            unsubscribe();
        };
    }, [conductorId]);

    return { activeTrip, setActiveTrip, loadingActiveTrip };
}