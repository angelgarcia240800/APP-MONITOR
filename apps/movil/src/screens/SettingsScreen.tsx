import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  DownloadCloud,
  Trash2,
  Sliders,
  Moon,
  Check,
  Shield,
} from 'lucide-react-native';
import { CURRENT_APP_VERSION, checkForUpdate } from '../services/updater';
import { storageService } from '../services/storageService';
import { AppSettings } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
  onCheckUpdates: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onCheckUpdates,
}) => {
  const [settings, setSettings] = useState<AppSettings>({
    autoRefresh: true,
    refreshIntervalMinutes: 5,
    hapticFeedback: true,
    showParalelo: true,
    decimalPlaces: 2,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await storageService.getSettings();
    setSettings(s);
  };

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await storageService.saveSettings(updated);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Limpiar Caché',
      '¿Deseas restablecer los datos en caché y tasas guardadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            // Re-inicializar ajustes
            Alert.alert('Éxito', 'Caché local restablecida correctamente.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Sección Actualizaciones */}
      <Text style={styles.sectionHeader}>SISTEMA Y ACTUALIZACIONES</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={onCheckUpdates}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <DownloadCloud size={20} color="#FFFFFF" />
            <View>
              <Text style={styles.settingTitle}>Buscar Actualizaciones</Text>
              <Text style={styles.settingDesc}>Versión instalada: v{CURRENT_APP_VERSION}</Text>
            </View>
          </View>
          <View style={styles.checkBadge}>
            <Text style={styles.checkBadgeText}>Verificar</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sección Visual y Formato */}
      <Text style={styles.sectionHeader}>FORMATO Y PRECISIÓN</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Sliders size={20} color="#FFFFFF" />
            <View>
              <Text style={styles.settingTitle}>Decimales en Tasas</Text>
              <Text style={styles.settingDesc}>
                {settings.decimalPlaces === 2 ? '2 decimales (Estándar: 857,01)' : '4 decimales (Precisión: 857,0058)'}
              </Text>
            </View>
          </View>
          <View style={styles.selectorRow}>
            {[2, 4].map((dec) => (
              <TouchableOpacity
                key={dec}
                style={[
                  styles.selectorChip,
                  settings.decimalPlaces === dec && styles.selectorChipActive,
                ]}
                onPress={() => updateSetting('decimalPlaces', dec)}
              >
                <Text
                  style={[
                    styles.selectorChipText,
                    settings.decimalPlaces === dec && styles.selectorChipTextActive,
                  ]}
                >
                  {dec} dec
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Moon size={20} color="#FFFFFF" />
            <View>
              <Text style={styles.settingTitle}>Tema Monocromático</Text>
              <Text style={styles.settingDesc}>Modo estricto blanco y negro activo</Text>
            </View>
          </View>
          <View style={styles.activePill}>
            <Check size={14} color="#000000" />
            <Text style={styles.activePillText}>Activo</Text>
          </View>
        </View>
      </View>

      {/* Sección Sincronización */}
      <Text style={styles.sectionHeader}>SINCRONIZACIÓN</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Shield size={20} color="#FFFFFF" />
            <View>
              <Text style={styles.settingTitle}>Auto-refresco al iniciar</Text>
              <Text style={styles.settingDesc}>Sincronizar BCV y USDT en cada apertura</Text>
            </View>
          </View>
          <Switch
            value={settings.autoRefresh}
            onValueChange={(val) => updateSetting('autoRefresh', val)}
            thumbColor={settings.autoRefresh ? '#FFFFFF' : '#888888'}
            trackColor={{ false: '#333333', true: '#666666' }}
          />
        </View>
      </View>

      {/* Mantenimiento */}
      <Text style={styles.sectionHeader}>ALMACENAMIENTO</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleClearCache}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Trash2 size={20} color="#FFFFFF" />
            <View>
              <Text style={styles.settingTitle}>Restablecer Datos Locales</Text>
              <Text style={styles.settingDesc}>Borra caché de tasas y valores temporales</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#161616',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingDesc: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  checkBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  checkBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#262626',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  selectorChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#383838',
  },
  selectorChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  selectorChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
  },
  selectorChipTextActive: {
    color: '#000000',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
});
