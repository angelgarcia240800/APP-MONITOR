import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Camera, X, Check, ScanLine } from 'lucide-react-native';
import { formatVES } from '../services/ratesService';

interface ScannerModalProps {
  visible: boolean;
  rate: number;
  rateName: string;
  onClose: () => void;
  onApplyScannedValue: (amountUsd: number) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  visible,
  rate,
  rateName,
  onClose,
  onApplyScannedValue,
}) => {
  const [detectedPrice, setDetectedPrice] = useState('5.00');

  const handleApply = () => {
    const val = parseFloat(detectedPrice);
    if (!isNaN(val) && val > 0) {
      onApplyScannedValue(val);
      onClose();
    }
  };

  const bsTotal = (parseFloat(detectedPrice) || 0) * rate;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Camera size={22} color="#FFFFFF" />
              <Text style={styles.title}>Escáner de Precios</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#888888" />
            </TouchableOpacity>
          </View>

          {/* Visor de escáner simulado */}
          <View style={styles.scannerViewport}>
            <ScanLine size={48} color="#FFFFFF" strokeWidth={1.5} />
            <Text style={styles.viewportTip}>
              Apunta la cámara a la etiqueta de precio del producto o ingresa el valor detectado
            </Text>
          </View>

          <View style={styles.quickValuesRow}>
            {['1', '2', '5', '10', '20', '50'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.quickChip,
                  detectedPrice === `${val}.00` && styles.quickChipActive,
                ]}
                onPress={() => setDetectedPrice(`${val}.00`)}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    detectedPrice === `${val}.00` && styles.quickChipTextActive,
                  ]}
                >
                  ${val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Precio en Divisa ($):</Text>
              <TextInput
                style={styles.textInput}
                value={detectedPrice}
                onChangeText={setDetectedPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total en {rateName}:</Text>
              <Text style={styles.resultValue}>{formatVES(bsTotal)} Bs</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Check size={18} color="#000000" style={{ marginRight: 6 }} />
            <Text style={styles.applyBtnText}>Cargar en Calculadora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  scannerViewport: {
    height: 140,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  viewportTip: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
  quickValuesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    flex: 1,
    height: 36,
    backgroundColor: '#222222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#303030',
  },
  quickChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  quickChipText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '700',
  },
  quickChipTextActive: {
    color: '#000000',
  },
  inputCard: {
    backgroundColor: '#222222',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#303030',
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    minWidth: 80,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#303030',
    marginVertical: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    color: '#AAAAAA',
    fontSize: 13,
  },
  resultValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  applyBtn: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});
