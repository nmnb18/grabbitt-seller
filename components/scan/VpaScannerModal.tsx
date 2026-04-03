/**
 * VpaScannerModal
 *
 * Opens a full-screen camera modal that scans a UPI QR code and extracts
 * the VPA from the `pa=` parameter of the UPI deep link.
 *
 * UPI QR format: upi://pay?pa=merchant@bank&pn=Name&...
 */
import { useTheme } from '@/hooks/use-theme-color';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

interface VpaScannerModalProps {
    visible: boolean;
    onClose: () => void;
    /** Called with the extracted VPA string when a valid UPI QR is scanned */
    onVpaScanned: (vpa: string) => void;
}

function extractVpaFromUpiQr(raw: string): string | null {
    try {
        // Handle both upi://pay?pa=... and plain VPA strings
        if (raw.startsWith('upi://')) {
            const url = new URL(raw.replace('upi://', 'https://dummy/'));
            const pa = url.searchParams.get('pa');
            return pa && pa.includes('@') ? pa.toLowerCase() : null;
        }
        // Plain VPA like merchant@bank
        if (raw.includes('@') && !raw.includes(' ')) {
            return raw.toLowerCase();
        }
        return null;
    } catch {
        return null;
    }
}

export function VpaScannerModal({ visible, onClose, onVpaScanned }: VpaScannerModalProps) {
    const theme = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBarcode = ({ data }: { data: string }) => {
        if (scanned) return;
        const vpa = extractVpaFromUpiQr(data);
        if (vpa) {
            setScanned(true);
            onVpaScanned(vpa);
            onClose();
        } else {
            setError('Not a valid UPI QR code. Try again.');
            // Reset after 2s so user can try again
            setTimeout(() => setError(null), 2000);
        }
    };

    const handleClose = () => {
        setScanned(false);
        setError(null);
        onClose();
    };

    if (!visible) return null;

    if (!permission?.granted) {
        return (
            <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
                <View style={[styles.permissionContainer, { backgroundColor: theme.colors.background }]}>
                    <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
                        Camera permission is required to scan UPI QR codes
                    </Text>
                    <Button mode="contained" onPress={requestPermission}>
                        Grant Permission
                    </Button>
                    <Button mode="text" onPress={handleClose} style={{ marginTop: 8 }}>
                        Cancel
                    </Button>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarcode}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                />

                {/* Header */}
                <View style={styles.header}>
                    <IconButton
                        icon="close"
                        iconColor="#fff"
                        size={28}
                        onPress={handleClose}
                        style={styles.closeBtn}
                    />
                </View>

                {/* Viewfinder overlay */}
                <View style={styles.overlay}>
                    <View style={styles.scanWindow} />
                    <Text style={styles.instruction}>
                        Point at your UPI QR code
                    </Text>
                    {error && (
                        <View style={styles.errorBadge}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    header: {
        position: 'absolute',
        top: 48,
        right: 16,
        zIndex: 10,
    },
    closeBtn: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanWindow: {
        width: 240,
        height: 240,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    instruction: {
        color: '#fff',
        marginTop: 20,
        fontSize: 15,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    errorBadge: {
        marginTop: 12,
        backgroundColor: 'rgba(220,53,69,0.85)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    errorText: {
        color: '#fff',
        fontSize: 14,
    },
});
