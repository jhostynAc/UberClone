// AI-assisted: see docs/AI_LOG.md #182
import React from 'react';
import { Modal, View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '../theme';

export default function MercadoPagoModal({ visible, initPoint, onClose, onPaymentSuccess }) {
    
    const handleNavigationStateChange = (navState) => {
        const { url } = navState;
        console.log("🌐 Navegando en WebView a URL:", url);
        
        if (url.includes('success') || url.includes('status=approved') || url.includes('approved')) {
            onPaymentSuccess();
        }
    };

    if (!visible || !initPoint) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#000000" />
                        <Text style={styles.closeText}>Cancelar Pasarela</Text>
                    </Pressable>
                </View>

                <WebView 
                    source={{ uri: initPoint }}
                    onNavigationStateChange={handleNavigationStateChange}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color="#009EE3" />
                        </View>
                    )}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    sharedCookiesEnabled={true}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 40 },
    header: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    closeButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    closeText: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    loader: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    }
});