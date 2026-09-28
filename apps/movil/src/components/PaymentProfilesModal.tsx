import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Clipboard,
  Alert,
} from 'react-native';
import { Receipt, Plus, Copy, Trash2, X, Check } from 'lucide-react-native';
import { PaymentProfile } from '../types';
import { storageService } from '../services/storageService';

interface PaymentProfilesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaymentProfilesModal: React.FC<PaymentProfilesModalProps> = ({
  visible,
  onClose,
}) => {
  const [profiles, setProfiles] = useState<PaymentProfile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [tipo, setTipo] = useState<'PAGO_MOVIL' | 'ZELLE' | 'BINANCE_PAY'>('PAGO_MOVIL');
  const [titular, setTitular] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [banco, setBanco] = useState('');
  const [correo, setCorreo] = useState('');
  const [binancePayId, setBinancePayId] = useState('');

  useEffect(() => {
    if (visible) {
      loadProfiles();
    }
  }, [visible]);

  const loadProfiles = async () => {
    const list = await storageService.getPaymentProfiles();
    setProfiles(list);
  };

  const handleSaveProfile = async () => {
    if (!titular.trim()) return;

    const newProfile: PaymentProfile = {
      id: Date.now().toString(),
      tipo,
      titular: titular.trim(),
      identificacion: identificacion.trim(),
      telefono: telefono.trim(),
      banco: banco.trim(),
      correo: correo.trim(),
      binancePayId: binancePayId.trim(),
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    await storageService.savePaymentProfiles(updated);

    // Reset
    setIsAdding(false);
    setTitular('');
    setIdentificacion('');
    setTelefono('');
    setBanco('');
    setCorreo('');
    setBinancePayId('');
  };

  const handleDeleteProfile = async (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    await storageService.savePaymentProfiles(updated);
  };

  const handleCopyProfile = (profile: PaymentProfile) => {
    let text = '';
    if (profile.tipo === 'PAGO_MOVIL') {
      text = `Pago Móvil:\nBanco: ${profile.banco}\nC.I: ${profile.identificacion}\nTeléfono: ${profile.telefono}\nTitular: ${profile.titular}`;
    } else if (profile.tipo === 'ZELLE') {
      text = `Zelle:\nCorreo: ${profile.correo}\nTitular: ${profile.titular}`;
    } else {
      text = `Binance Pay ID: ${profile.binancePayId}\nTitular: ${profile.titular}`;
    }

    Clipboard.setString(text);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Receipt size={22} color="#FFFFFF" />
              <Text style={styles.title}>Perfiles de Pago</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#888888" />
            </TouchableOpacity>
          </View>

          {isAdding ? (
            <ScrollView style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Nuevo Perfil</Text>

              <View style={styles.typeSelector}>
                {(['PAGO_MOVIL', 'ZELLE', 'BINANCE_PAY'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, tipo === t && styles.typeBtnActive]}
                    onPress={() => setTipo(t)}
                  >
                    <Text style={[styles.typeBtnText, tipo === t && styles.typeBtnTextActive]}>
                      {t === 'PAGO_MOVIL' ? 'Pago Móvil' : t === 'ZELLE' ? 'Zelle' : 'Binance Pay'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nombre del Titular"
                placeholderTextColor="#666666"
                value={titular}
                onChangeText={setTitular}
              />

              {tipo === 'PAGO_MOVIL' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Banco (ej. 0102 Banesco, Mercantil, BDV)"
                    placeholderTextColor="#666666"
                    value={banco}
                    onChangeText={setBanco}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Cédula o RIF (ej. V-12345678)"
                    placeholderTextColor="#666666"
                    value={identificacion}
                    onChangeText={setIdentificacion}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Número de Teléfono (ej. 0414-1234567)"
                    placeholderTextColor="#666666"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                  />
                </>
              )}

              {tipo === 'ZELLE' && (
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico Zelle"
                  placeholderTextColor="#666666"
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                />
              )}

              {tipo === 'BINANCE_PAY' && (
                <TextInput
                  style={styles.input}
                  placeholder="Binance Pay ID (ej. 123456789)"
                  placeholderTextColor="#666666"
                  value={binancePayId}
                  onChangeText={setBinancePayId}
                  keyboardType="numeric"
                />
              )}

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAdding(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <>
              <ScrollView style={styles.profilesList} showsVerticalScrollIndicator={false}>
                {profiles.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No tienes perfiles guardados</Text>
                    <Text style={styles.emptyDesc}>
                      Guarda tus datos de Pago Móvil, Zelle o Binance Pay para copiarlos y compartirlos con 1 toque.
                    </Text>
                  </View>
                ) : (
                  profiles.map((profile) => {
                    const isCopied = copiedId === profile.id;
                    return (
                      <View key={profile.id} style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                          <View style={styles.profileTypeBadge}>
                            <Text style={styles.profileTypeText}>
                              {profile.tipo === 'PAGO_MOVIL'
                                ? 'PAGO MÓVIL'
                                : profile.tipo === 'ZELLE'
                                ? 'ZELLE'
                                : 'BINANCE PAY'}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => handleDeleteProfile(profile.id)}
                            style={styles.deleteBtn}
                          >
                            <Trash2 size={16} color="#888888" />
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.profileTitular}>{profile.titular}</Text>

                        {profile.tipo === 'PAGO_MOVIL' && (
                          <Text style={styles.profileDetails}>
                            {profile.banco} • {profile.identificacion} • {profile.telefono}
                          </Text>
                        )}

                        {profile.tipo === 'ZELLE' && (
                          <Text style={styles.profileDetails}>{profile.correo}</Text>
                        )}

                        {profile.tipo === 'BINANCE_PAY' && (
                          <Text style={styles.profileDetails}>Pay ID: {profile.binancePayId}</Text>
                        )}

                        <TouchableOpacity
                          style={[styles.copyBtn, isCopied && styles.copyBtnCopied]}
                          onPress={() => handleCopyProfile(profile)}
                        >
                          {isCopied ? (
                            <>
                              <Check size={16} color="#000000" style={{ marginRight: 6 }} />
                              <Text style={styles.copyBtnTextCopied}>¡Copiado al portapapeles!</Text>
                            </>
                          ) : (
                            <>
                              <Copy size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                              <Text style={styles.copyBtnText}>Copiar Datos</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setIsAdding(true)}
              >
                <Plus size={20} color="#000000" style={{ marginRight: 6 }} />
                <Text style={styles.addBtnText}>Agregar Perfil</Text>
              </TouchableOpacity>
            </>
          )}
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
  sheetContainer: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '88%',
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  profilesList: {
    maxHeight: 380,
  },
  emptyState: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#222222',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#303030',
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileTypeBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  profileTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 4,
  },
  profileTitular: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 14,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2E2E2E',
    borderWidth: 1,
    borderColor: '#404040',
  },
  copyBtnCopied: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  copyBtnTextCopied: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  addBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  addBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  formContainer: {
    maxHeight: 460,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  typeBtnTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  input: {
    height: 48,
    backgroundColor: '#222222',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});
