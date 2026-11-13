// AI-assisted: see docs/AI_LOG.md #118
import { useState, useEffect, useMemo } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function useEarnings(conductorId) {
    const [trips, setTrips] = useState([]);
    const [loadingEarnings, setLoadingEarnings] = useState(true);

    useEffect(() => {
        if (!conductorId) {
            setLoadingEarnings(false);
            return;
        }

        console.log("💰 Sincronizando historial de ganancias desde Firestore...");

        const q = query(
            collection(db, "trips"),
            where("driverId", "==", conductorId),
            where("status", "in", ["completed", "paid"])
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tripList = [];
            querySnapshot.forEach((doc) => {
                tripList.push({ id: doc.id, ...doc.data() });
            });
            setTrips(tripList);
            setLoadingEarnings(false);
        }, (error) => {
            console.error("Error al obtener ganancias:", error);
            setLoadingEarnings(false);
        });

        return () => unsubscribe();
    }, [conductorId]);

    // 📌 Uso obligatorio de useMemo para procesar eficientemente hoy, semana, mes y saldo
    const earningsSummary = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Inicio de la semana (Lunes)
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        // Inicio del mes
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const initMetrics = () => ({ count: 0, fare: 0, commission: 0, tips: 0, netEarnings: 0 });

        const day = initMetrics();
        const week = initMetrics();
        const month = initMetrics();

        let totalGatewayEarnings = 0; // Pagado por pasarela
        let totalCashCommissions = 0;   // Comisiones de viajes en efectivo a descontar

        trips.forEach((trip) => {
            const tripDate = trip.completedAt?.toDate ? trip.completedAt.toDate() : new Date();
            const fare = Number(trip.fare || 0);
            const commission = Number(trip.commission || 0);
            const tips = Number(trip.tip || 0);
            const netEarnings = Number(trip.driverEarnings || (fare - commission + tips));
            const paymentMethod = trip.paymentMethod;

            // Cálculo del saldo general del conductor
            if (paymentMethod === 'cash') {
                totalCashCommissions += commission; // La plataforma descuenta comisión del efectivo
            } else {
                totalGatewayEarnings += netEarnings; // Ingresa a través de la pasarela
            }

            const applyMetrics = (target) => {
                target.count += 1;
                target.fare += fare;
                target.commission += commission;
                target.tips += tips;
                target.netEarnings += netEarnings;
            };

            if (tripDate >= monthStart) {
                applyMetrics(month);
                if (tripDate >= weekStart) {
                    applyMetrics(week);
                    if (tripDate >= todayStart) {
                        applyMetrics(day);
                    }
                }
            }
        });

        const currentBalance = totalGatewayEarnings - totalCashCommissions;

        return {
            day,
            week,
            month,
            currentBalance
        };
    }, [trips]);

    return { earningsSummary, loadingEarnings };
}