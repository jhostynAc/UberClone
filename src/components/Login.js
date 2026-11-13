// AI-assisted: see docs/AI_LOG.md #102
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    Pressable, 
    ActivityIndicator, 
    Alert, 
    KeyboardAvoidingView, 
    ScrollView, 
    Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, spacing, radius, typography } from '../theme';

import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginForm({ onLoginSuccess, onNavigateRegister }) {
    const { t } = useTranslation();
    const [documento, setDocumento] = useState('');
    const [password, setPassword] = useState('');
    
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const marcarTocado = (campo) => {
        setTouched(prev => ({ ...prev, [campo]: true }));
        validarCampos(documento, password);
    };

    const validarCampos = (docVal, passVal) => {
        let nuevosErrores = {};

        if (!docVal.trim()) {
            nuevosErrores.documento = "El documento es obligatorio.";
        } else if (!/^\d{6,10}$/.test(docVal.trim())) {
            nuevosErrores.documento = "Debe ser numérico, entre 6 y 10 dígitos.";
        }

        if (!passVal) {
            nuevosErrores.password = "La contraseña es obligatoria.";
        } else if (passVal.length < 6) {
            nuevosErrores.password = "Debe tener al menos 6 caracteres.";
        }

        setErrors(nuevosErrores);
    };

    const handleLogin = async () => {
        setTouched({ documento: true, password: true });
        validarCampos(documento, password);

        if (!documento.trim() || !password || Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            const docId = documento.trim();
            console.log("🔍 Buscando en colección 'Conductores' el ID exacto:", docId);

            // Promesa de timeout para evitar que se quede cargando indefinidamente (6 segundos)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Tiempo de espera agotado (Timeout)")), 6000)
            );

            const conductorRef = doc(db, "Conductores", docId);
            const docSnap = await Promise.race([
                getDoc(conductorRef),
                timeoutPromise
            ]);

            console.log("📄 ¿Existe el documento en Firestore?", docSnap.exists());

            if (!docSnap.exists()) {
                Alert.alert(
                    "Usuario no encontrado", 
                    `No existe un registro con el documento "${docId}" en la colección Conductores.`
                );
                setLoading(false);
                return;
            }

            const data = docSnap.data();
            console.log("📦 Datos recuperados del conductor:", data);

            // Validar contraseña si fue guardada en el registro
            if (data.personales?.password && data.personales.password !== password) {
                Alert.alert("Contraseña incorrecta", "La contraseña ingresada no coincide.");
                setLoading(false);
                return;
            }

            console.log("🚀 Validación exitosa. Redirigiendo a DriverHome...");
            
            // Éxito: detenemos la carga y ejecutamos la navegación
            setLoading(false);
            if (onLoginSuccess) {
                onLoginSuccess(docId);
            }

        } catch (error) {
            console.error("❌ Error detallado en el login:", error);
            Alert.alert(
                "Error de Acceso", 
                error.message.includes("Timeout") 
                    ? "La base de datos tardó demasiado en responder. Revisa tu conexión a internet." 
                    : "No se pudo verificar la información. Revisa la consola."
            );
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.headerContainer}>
                    <Ionicons name="car-sport" size={60} color="#000000" />
                    <Text style={styles.headerTitle}>Iniciar Sesión</Text>
                    <Text style={styles.subtitle}>Ingresa tus credenciales de conductor</Text>
                </View>

                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Número de Documento</Text>
                        <TextInput
                            style={[styles.input, touched.documento && errors.documento && styles.inputError]}
                            placeholder="Ej. 1020304050"
                            keyboardType='numeric'
                            maxLength={10}
                            placeholderTextColor={colors?.placeholder || '#9CA3AF'}
                            value={documento}
                            onChangeText={(val) => {
                                setDocumento(val);
                                marcarTocado('documento');
                            }}
                        />
                        {touched.documento && errors.documento && (
                            <Text style={styles.errorText}>{errors.documento}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t ? t('password') : "Contraseña"}</Text>
                        <TextInput
                            style={[styles.input, touched.password && errors.password && styles.inputError]}
                            placeholder="Mínimo 6 caracteres"
                            secureTextEntry={true}
                            placeholderTextColor={colors?.placeholder || '#9CA3AF'}
                            value={password}
                            onChangeText={(val) => {
                                setPassword(val);
                                marcarTocado('password');
                            }}
                        />
                        {touched.password && errors.password && (
                            <Text style={styles.errorText}>{errors.password}</Text>
                        )}
                    </View>

                    <Pressable 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Ingresar</Text>
                        )}
                    </Pressable>

                    {onNavigateRegister && (
                        <Pressable style={styles.registerLink} onPress={onNavigateRegister}>
                            <Text style={styles.registerLinkText}>
                                ¿No tienes cuenta? <Text style={styles.registerBold}>Regístrate aquí</Text>
                            </Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: { flex: 1, width: '100%' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 20 },
    headerContainer: { alignItems: 'center', marginBottom: 24 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginTop: 10, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },
    formSection: { marginTop: spacing?.sm || 10, width: '100%' },
    inputGroup: { marginBottom: spacing?.md || 16 },
    label: { fontSize: 16, marginBottom: spacing?.sm || 8, fontWeight: '600', color: '#000000' },
    input: { 
        backgroundColor: '#F9FAFB', 
        borderWidth: 1, 
        borderColor: '#D1D5DB', 
        borderRadius: radius?.md || 10, 
        padding: spacing?.md || 14, 
        color: '#000000', 
        fontSize: 16 
    },
    inputError: {
        borderColor: '#E11900',
        backgroundColor: '#FEF2F2'
    },
    errorText: {
        color: '#E11900',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500'
    },
    button: {
        backgroundColor: '#050505',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    registerLinkText: {
        fontSize: 14,
        color: '#6B7280',
    },
    registerBold: {
        color: '#030303',
        fontWeight: 'bold',
    },
});