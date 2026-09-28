import AsyncStorage from '@react-native-async-storage/async-storage';
import { RatesData, PaymentProfile, AppSettings } from '../types';

const STORAGE_KEYS = {
  RATES_CACHE: '@app_monitor_rates_cache',
  CUSTOM_RATE: '@app_monitor_custom_rate',
  PAYMENT_PROFILES: '@app_monitor_payment_profiles',
  SETTINGS: '@app_monitor_settings',
  LAST_CURRENCY: '@app_monitor_last_currency',
};

const DEFAULT_SETTINGS: AppSettings = {
  autoRefresh: true,
  refreshIntervalMinutes: 5,
  hapticFeedback: true,
  showParalelo: true,
  decimalPlaces: 2,
};

export const storageService = {
  async saveRatesCache(data: RatesData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RATES_CACHE, JSON.stringify(data));
    } catch (e) {
      console.warn('Error al guardar caché de tasas:', e);
    }
  },

  async getRatesCache(): Promise<RatesData | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.RATES_CACHE);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.warn('Error al leer caché de tasas:', e);
      return null;
    }
  },

  async saveCustomRate(rate: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_RATE, rate.toString());
    } catch (e) {
      console.warn('Error al guardar tasa personalizada:', e);
    }
  },

  async getCustomRate(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_RATE);
      return val ? parseFloat(val) : 1.0;
    } catch (e) {
      return 1.0;
    }
  },

  async getPaymentProfiles(): Promise<PaymentProfile[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_PROFILES);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      return [];
    }
  },

  async savePaymentProfiles(profiles: PaymentProfile[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.warn('Error al guardar perfiles de pago:', e);
    }
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error al guardar configuraciones:', e);
    }
  },

  async getLastSelectedCurrency(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(STORAGE_KEYS.LAST_CURRENCY)) || 'USD_BCV';
    } catch (e) {
      return 'USD_BCV';
    }
  },

  async saveLastSelectedCurrency(id: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CURRENCY, id);
    } catch (e) {
      console.warn('Error al guardar última moneda:', e);
    }
  },
};
