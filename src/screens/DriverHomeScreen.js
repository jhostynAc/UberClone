// AI-assisted: see docs/AI_LOG.md #188
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Alert, Linking, ActivityIndicator, Text, Pressable, Modal } from 'react-native';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Componentes modulares
import UberMap from '../components/MapUber';
import DriverStatusHeader from '../components/DriverStatusHeader';
import TripRequestCard from '../components/TripRequestCard';
import ActiveTripPanel from '../components/ActiveTripPanel';
import TripSummaryModal from '../components/TripSummaryModal';
import EarningsView from '../components/EarningsView';
import TripHistory from '../components/TripHistoryView';
import ProfileSettings from '../components/ProfileSettings';
import MercadoPagoModal from '../components/StripeModal'; // 👈 Reutilizamos este modal WebView para Stripe

// Custom Hooks
import { useTripRequests } from '../hook/useTripRequests';
import { useActiveTrip } from '../hook/useActiveTrip';

// Servicios
import { crearViajePrueba, actualizarEstadoViaje } from '../services/tripService';
import { solicitarSesionStripe } from '../services/stripeService'; // 👈 Servicio de pago digital con Stripe

import { colors, spacing, radius } from '../theme';

export default function DriverHome() {
    const route = useRoute();
    const { conductorId } = route.params || {};

    const [isAvailable, setIsAvailable] = useState(false);
    const [location, setLocation] = useState(null);
    const [aprobado, setAprobado] = useState(false);
    const [loadingAprobacion, setLoadingAprobacion] = useState(true);

    // Estado local para forzar la visualización del resumen de cobro
    const [tripToSummarize, setTripToSummarize] = useState(null);

    // Estados para modales flotantes generales
    const [showEarningsModal, setShowEarningsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Estados para Stripe Checkout Session (WebView)
    const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState(null);
    const [showStripeModal, setShowStripeModal] = useState(false);

    const locationIntervalRef = useRef(null);

    // Hooks personalizados
    const { incomingTrip, setIncomingTrip } = useTripRequests(isAvailable, aprobado);
    const { activeTrip } = useActiveTrip(conductorId, isAvailable);

    // 1. Verificar aprobación del conductor en Firestore
    useEffect(() => {
        const verificarEstadoConductor = async () => {
            if (!conductorId) {
                setLoadingAprobacion(false);
                return;
            }
            try {
                const docRef = doc(db, "Conductores", conductorId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAprobado(docSnap.data().aprobado === true);
                }
            } catch (error) {
                console.error("Error al verificar aprobación:", error);
            } finally {
                setLoadingAprobacion(false);
            }
        };
        verificarEstadoConductor();
    }, [conductorId]);

    // 2. Permisos y ubicación inicial del GPS
    useEffect(() => {
        (async () => {
            let { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                let res = await Location.requestForegroundPermissionsAsync();
                status = res.status;
            }
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso requerido',
                    'Necesitamos acceso al GPS para mostrar tu ubicación en el mapa.',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }
                    ]
                );
                return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
        })();
    }, []);

    // 3. Control de disponibilidad y sincronización de ubicación en Firestore
    useEffect(() => {
        let isMounted = true;
        if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);

        if (isAvailable && aprobado) {
            console.log("🚗 Conductor DISPONIBLE. Transmitiendo ubicación...");
            locationIntervalRef.current = setInterval(async () => {
                if (!isMounted) return;
                try {
                    let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    if (isMounted && isAvailable) {
                        setLocation(currentLocation.coords);
                        if (conductorId) {
                            const driverRef = doc(db, "Conductores", conductorId);
                            await updateDoc(driverRef, {
                                location: {
                                    latitude: currentLocation.coords.latitude,
                                    longitude: currentLocation.coords.longitude
                                },
                                disponible: true,
                                lastUpdated: serverTimestamp()
                            });
                        }
                    }
                } catch (err) {
                    if (isMounted) console.error("Error al actualizar ubicación:", err);
                }
            }, 5000);
        } else {
            console.log("🛑 Conductor NO DISPONIBLE.");
            if (conductorId && isAvailable === false) {
                updateDoc(doc(db, "Conductores", conductorId), { disponible: false }).catch(() => { });
            }
        }

        return () => {
            isMounted = false;
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
        };
    }, [isAvailable, aprobado, conductorId]);

    // 4. Manejador para Aceptar Solicitud Entrante
    const handleAcceptTrip = useCallback(async (tripId) => {
        const idToProcess = typeof tripId === 'object' && tripId !== null ? tripId.id : tripId;
        if (!idToProcess) return;
        try {
            await actualizarEstadoViaje(idToProcess, 'driver_arriving', conductorId);
            setIncomingTrip(null);
        } catch (error) {
            console.error("Error al aceptar el viaje:", error);
            Alert.alert("Error", "No se pudo aceptar el viaje.");
        }
    }, [conductorId, setIncomingTrip]);

    // 5. Manejador para Rechazar Solicitud Entrante
    const handleRejectTrip = useCallback(async (tripId, reason = 'manual') => {
        const idToProcess = typeof tripId === 'object' && tripId !== null ? tripId.id : tripId;
        if (!idToProcess || typeof idToProcess !== 'string') {
            setIncomingTrip(null);
            return;
        }
        try {
            const nuevoEstado = reason === 'timeout' ? 'rejected_by_timeout' : 'rejected';
            await actualizarEstadoViaje(idToProcess, nuevoEstado);
            setIncomingTrip(null);
        } catch (error) {
            console.error("Error al rechazar el viaje:", error);
        }
    }, [setIncomingTrip]);

    // 6. Manejador para actualizar estados del viaje en curso
    const handleUpdateTripStatus = useCallback(async (newStatus) => {
        if (!activeTrip) return;
        try {
            if (newStatus === 'completed' || newStatus === 'finished' || newStatus === 'ended') {
                setTripToSummarize(activeTrip);
            }
            await actualizarEstadoViaje(activeTrip.id, newStatus);
        } catch (error) {
            console.error("Error al actualizar estado del viaje:", error);
        }
    }, [activeTrip]);

    // 7. Confirmar el pago final seleccionado y cerrar el modal
    const handleConfirmPayment = useCallback(async (tripId, finalPaymentStatus) => {
        if (!tripId) return;
        try {
            const tripRef = doc(db, "trips", tripId);
            await updateDoc(tripRef, { 
                status: 'completed', 
                paymentStatus: finalPaymentStatus,
                conductorId: conductorId,
                completedAt: serverTimestamp()
            });
            setTripToSummarize(null); 
        } catch (error) {
            console.error("Error al confirmar el pago del viaje:", error);
            Alert.alert("Error", "No se pudo registrar la confirmación del pago.");
        }
    }, [conductorId]);

    // 8. Iniciar pasarela de pago digital con Stripe Checkout
    const handleIniciarPagoDigital = async (trip) => {
        const montoFinal = Number(trip.fare || trip.price || 18000);
        const checkoutUrl = await solicitarSesionStripe(trip.id, montoFinal);
        
        if (checkoutUrl) {
            setStripeCheckoutUrl(checkoutUrl);
            setShowStripeModal(true);
        } else {
            Alert.alert("Stripe", "No se pudo generar la sesión de pago digital.");
        }
    };

    // Callback cuando el pago digital en el WebView de Stripe es exitoso
    const handleStripePaymentSuccess = async () => {
        setShowStripeModal(false);
        Alert.alert("¡Pago Exitoso!", "La transacción digital con Stripe fue aprobada correctamente.");
        if (tripToSummarize) {
            await handleConfirmPayment(tripToSummarize.id, 'approved');
        }
    };

    // 9. Validación del interruptor de disponibilidad
    const handleToggleAvailability = (value) => {
        if (value && !aprobado) {
            Alert.alert(
                "Cuenta en Verificación",
                "Tu perfil aún no ha sido aprobado por la administración. No puedes conectarte."
            );
            setIsAvailable(false);
            return;
        }
        setIsAvailable(value);
    };

    // 10. Botón manual para centrar el mapa
    const handleCenterMap = async () => {
        try {
            let currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            if (currentLocation && currentLocation.coords) {
                setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo obtener tu ubicación actual.");
        }
    };

    if (loadingAprobacion) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Mapa interactivo */}
            <UberMap location={location} activeTrip={activeTrip || tripToSummarize} />

            {/* 🧪 BOTÓN FLOTANTE: SIMULAR VIAJE RÁPIDO (RAYO) */}
            <Pressable 
                style={styles.jsonTestButton} 
                onPress={() => crearViajePrueba()}
            >
                <Ionicons name="flash" size={24} color="#FFFFFF" />
            </Pressable>

            {/* 📍 BOTÓN FLOTANTE: CENTRAR MAPA */}
            <Pressable style={styles.centerButton} onPress={handleCenterMap}>
                <Ionicons name="locate" size={24} color="#000000" />
            </Pressable>

            {/* ⚙️ BOTÓN FLOTANTE: PERFIL */}
            <Pressable
                style={styles.profileButton}
                onPress={() => setShowProfileModal(true)}
            >
                <Ionicons name="person-outline" size={24} color="#FFFFFF" />
            </Pressable>

            {/* 📜 BOTÓN FLOTANTE: HISTORIAL */}
            <Pressable
                style={styles.historyButton}
                onPress={() => setShowHistoryModal(true)}
            >
                <Ionicons name="time-outline" size={24} color="#FFFFFF" />
            </Pressable>

            {/* 💰 BOTÓN FLOTANTE: GANANCIAS */}
            <Pressable
                style={styles.earningsButton}
                onPress={() => setShowEarningsModal(true)}
            >
                <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Banner de verificación */}
            {!aprobado && (
                <View style={styles.warningBanner}>
                    <Text style={styles.warningTitle}>⚠️ Perfil en Verificación</Text>
                    <Text style={styles.warningText}>
                        No podrás conectarte para recibir viajes hasta que la administración apruebe tus documentos.
                    </Text>
                </View>
            )}

            {/* Cabecera superior */}
            <DriverStatusHeader
                isAvailable={isAvailable}
                onToggleAvailability={handleToggleAvailability}
            />

            {/* MODAL DE RESUMEN DE COBRO */}
            {tripToSummarize && (
                <TripSummaryModal
                    trip={tripToSummarize}
                    onConfirmPayment={handleConfirmPayment}
                    onPayDigital={() => handleIniciarPagoDigital(tripToSummarize)}
                />
            )}

            {/* PANEL DE VIAJE EN CURSO */}
            {!tripToSummarize && activeTrip && activeTrip.status !== 'completed' && activeTrip.status !== 'finished' && activeTrip.status !== 'ended' && (
                <ActiveTripPanel
                    trip={activeTrip}
                    onUpdateStatus={handleUpdateTripStatus}
                />
            )}

            {/* SOLICITUD ENTRANTE */}
            {!tripToSummarize && !activeTrip && incomingTrip && isAvailable && (
                <TripRequestCard
                    trip={incomingTrip}
                    onAccept={(id) => handleAcceptTrip(id || incomingTrip.id)}
                    onReject={(id, reason) => handleRejectTrip(id || incomingTrip.id, reason)}
                />
            )}

            {/* 💳 MODAL DE WEBVIEW DE STRIPE CHECKOUT */}
            <MercadoPagoModal
                visible={showStripeModal}
                initPoint={stripeCheckoutUrl}
                onClose={() => setShowStripeModal(false)}
                onPaymentSuccess={handleStripePaymentSuccess}
            />

            {/* MODAL DE GANANCIAS */}
            <Modal
                visible={showEarningsModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowEarningsModal(false)}
            >
                <View style={styles.modalContainer}>
                    <Pressable style={styles.closeButton} onPress={() => setShowEarningsModal(false)}>
                        <Ionicons name="close" size={24} color="#000000" />
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </Pressable>
                    <EarningsView route={{ params: { conductorId } }} />
                </View>
            </Modal>

            {/* MODAL DE HISTORIAL */}
            <Modal
                visible={showHistoryModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <Pressable style={styles.closeButton} onPress={() => setShowHistoryModal(false)}>
                        <Ionicons name="close" size={24} color="#000000" />
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </Pressable>
                    <TripHistory conductorId={conductorId} />
                </View>
            </Modal>

            {/* MODAL DE PERFIL */}
            <Modal
                visible={showProfileModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowProfileModal(false)}
            >
                <View style={styles.modalContainer}>
                    <Pressable style={styles.closeButton} onPress={() => setShowProfileModal(false)}>
                        <Ionicons name="close" size={24} color="#000000" />
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </Pressable>
                    <ProfileSettings conductorId={conductorId} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    jsonTestButton: {
        position: 'absolute',
        right: 20,
        bottom: 380,
        backgroundColor: '#7C3AED',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 10,
    },
    centerButton: {
        position: 'absolute',
        right: 20,
        bottom: 120,
        backgroundColor: '#FFFFFF',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 10,
    },
    profileButton: {
        position: 'absolute',
        right: 20,
        bottom: 185,
        backgroundColor: '#2563EB',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 10,
    },
    historyButton: {
        position: 'absolute',
        right: 20,
        bottom: 250,
        backgroundColor: '#1F2937',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 10,
    },
    earningsButton: {
        position: 'absolute',
        right: 20,
        bottom: 315,
        backgroundColor: '#059669',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 10,
    },
    warningBanner: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#F87171',
        padding: spacing.md,
        borderRadius: radius.md,
        zIndex: 10,
        elevation: 5,
    },
    warningTitle: {
        color: '#991B1B',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2
    },
    warningText: {
        color: '#B91C1C',
        fontSize: 12,
        lineHeight: 16
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingTop: 40,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#111827',
    },
});