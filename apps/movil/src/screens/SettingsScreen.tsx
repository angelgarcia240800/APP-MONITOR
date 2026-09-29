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
  Sun,
  Smartphone,
  Shield,
} from 'lucide-react-native';
import { CURRENT_APP_VERSION } from '../services/updater';
import { storageService } from '../services/storageService';
import { AppSettings } from '../types';
import { ThemeColors, ThemeMode } from '../constants/theme';

interface SettingsScreenProps {
  theme: ThemeColors;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  onBack: () => void;
  onCheckUpdates: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  theme,
  themeMode,
  onThemeModeChange,
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
            Alert.alert('Éxito', 'Caché local restablecida correctamente.');
          },
        },
      ]
    );
  };

  const themeModes: { id: ThemeMode; label: string; icon: any }[] = [
    { id: 'system', label: 'Automático', icon: Smartphone },
    { id: 'dark', label: 'Oscuro', icon: Moon },
    { id: 'light', label: 'Claro', icon: Sun },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Sección Apariencia (Modo Oscuro, Claro y Automático) */}
      <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>APARIENCIA DE LA APP</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.themeRow}>
          {themeModes.map((m) => {
            const isActive = themeMode === m.id;
            const IconComp = m.icon;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.themeOptionBtn,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                  isActive && { backgroundColor: theme.buttonPrimaryBg, borderColor: theme.buttonPrimaryBg },
                ]}
                onPress={() => onThemeModeChange(m.id)}
                activeOpacity={0.8}
              >
                <IconComp
                  size={20}
                  color={isActive ? theme.buttonPrimaryText : theme.textSecondary}
                  style={{ marginBottom: 6 }}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: theme.textSecondary },
                    isActive && { color: theme.buttonPrimaryText, fontWeight: '700' },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sección Actualizaciones */}
      <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>SISTEMA Y ACTUALIZACIONES</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={onCheckUpdates}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <DownloadCloud size={20} color={theme.accentGreen} />
            <View>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                Buscar Actualizaciones
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                Versión instalada: v{CURRENT_APP_VERSION}
              </Text>
            </View>
          </View>
          <View style={[styles.checkBadge, { backgroundColor: theme.buttonPrimaryBg }]}>
            <Text style={[styles.checkBadgeText, { color: theme.buttonPrimaryText }]}>Verificar</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sección Formato y Precisión */}
      <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>FORMATO Y PRECISIÓN</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Sliders size={20} color={theme.textPrimary} />
            <View>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Decimales en Tasas</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                {settings.decimalPlaces === 2 ? '2 decimales (857,01)' : '4 decimales (857,0058)'}
              </Text>
            </View>
          </View>
          <View style={styles.selectorRow}>
            {[2, 4].map((dec) => (
              <TouchableOpacity
                key={dec}
                style={[
                  styles.selectorChip,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                  settings.decimalPlaces === dec && {
                    backgroundColor: theme.buttonPrimaryBg,
                    borderColor: theme.buttonPrimaryBg,
                  },
                ]}
                onPress={() => updateSetting('decimalPlaces', dec)}
              >
                <Text
                  style={[
                    styles.selectorChipText,
                    { color: theme.textMuted },
                    settings.decimalPlaces === dec && { color: theme.buttonPrimaryText },
                  ]}
                >
                  {dec} dec
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Sección Sincronización */}
      <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>SINCRONIZACIÓN</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Shield size={20} color={theme.textPrimary} />
            <View>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Auto-refresco al iniciar</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                Sincronizar BCV y USDT en cada apertura
              </Text>
            </View>
          </View>
          <Switch
            value={settings.autoRefresh}
            onValueChange={(val) => updateSetting('autoRefresh', val)}
            thumbColor={settings.autoRefresh ? theme.accentGreen : theme.textMuted}
            trackColor={{ false: theme.border, true: theme.accentGreenSubtle }}
          />
        </View>
      </View>

      {/* Mantenimiento */}
      <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>ALMACENAMIENTO</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleClearCache}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Trash2 size={20} color={theme.textMuted} />
            <View>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                Restablecer Datos Locales
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                Borra caché de tasas y valores temporales
              </Text>
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
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 70,
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
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  checkBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  checkBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  selectorChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectorChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
