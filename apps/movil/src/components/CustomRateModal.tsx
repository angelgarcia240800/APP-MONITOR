import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Edit3, Check, X } from 'lucide-react-native';

interface CustomRateModalProps {
  visible: boolean;
  currentRate: number;
  onSave: (newRate: number) => void;
  onClose: () => void;
}

export const CustomRateModal: React.FC<CustomRateModalProps> = ({
  visible,
  currentRate,
  onSave,
  onClose,
}) => {
  const [rateText, setRateText] = useState(currentRate.toString());

  const handleSave = () => {
    const val = parseFloat(rateText.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      onSave(val);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Edit3 size={20} color="#FFFFFF" />
              <Text style={styles.title}>Tasa Personalizada</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#888888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Ingresa la cotización en Bolívares (Bs) que deseas utilizar para tus cálculos personales.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>Bs</Text>
            <TextInput
              style={styles.input}
              value={rateText}
              onChangeText={setRateText}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#555555"
              autoFocus
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Check size={18} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#181818',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#303030',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    color: '#999999',
    lineHeight: 18,
    marginBottom: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#383838',
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#888888',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#383838',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});
