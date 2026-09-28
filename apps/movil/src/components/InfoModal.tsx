import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Info, X, ExternalLink, ShieldCheck, Cpu } from 'lucide-react-native';
import { MonochromeLogo } from './MonochromeLogo';
import { CURRENT_APP_VERSION } from '../services/updater';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Info size={20} color="#FFFFFF" />
              <Text style={styles.title}>Acerca de APP-MONITOR</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#888888" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.logoSection}>
              <MonochromeLogo size={70} />
              <Text style={styles.appName}>APP-MONITOR</Text>
              <Text style={styles.appVersion}>Versión {CURRENT_APP_VERSION}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ShieldCheck size={18} color="#FFFFFF" />
                <Text style={styles.cardTitle}>Transparencia de Fuentes</Text>
              </View>
              <Text style={styles.cardText}>
                • <Text style={styles.bold}>Dólar y Euro Oficial:</Text> Extraídos directamente según la cotización del Banco Central de Venezuela (BCV).{'\n'}
                • <Text style={styles.bold}>USDT en Bolívares:</Text> Calculado mediante el promedio en tiempo real de las órdenes comerciales del mercado Binance P2P.{'\n'}
                • <Text style={styles.bold}>Brecha Cambiaria:</Text> Métrica porcentual diferencial entre la divisa oficial BCV y el activo digital USDT.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Cpu size={18} color="#FFFFFF" />
                <Text style={styles.cardTitle}>Arquitectura Frontend Nativa</Text>
              </View>
              <Text style={styles.cardText}>
                La aplicación no depende de servidores intermediarios lentos; se conecta directamente desde el dispositivo a los endpoints oficiales con caché local en AsyncStorage para funcionamiento sin conexión.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL('https://github.com/angelgarcia240800/APP-MONITOR')}
            >
              <Text style={styles.linkText}>Repositorio Oficial en GitHub</Text>
              <ExternalLink size={16} color="#000000" />
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Entendido</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#181818',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#303030',
    maxHeight: '85%',
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
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    marginBottom: 14,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  appVersion: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#222222',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#303030',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardText: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 6,
    gap: 8,
  },
  linkText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    height: 46,
    backgroundColor: '#262626',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#383838',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
