import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { BcvRatesScreen } from './src/screens/BcvRatesScreen';
import { UsdtRatesScreen } from './src/screens/UsdtRatesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { RatesModal, CalculatorState } from './src/components/RatesModal';
import { SideDrawer, DrawerScreenType } from './src/components/SideDrawer';
import { UpdateModal } from './src/components/UpdateModal';
import { CustomRateModal } from './src/components/CustomRateModal';
import { DatePickerModal } from './src/components/DatePickerModal';
import { FloatingToast } from './src/components/FloatingToast';
import { InfoModal } from './src/components/InfoModal';
import { RatesData, CurrencyType } from './src/types';
import { fetchAllRates } from './src/services/ratesService';
import { storageService } from './src/services/storageService';
import { checkForUpdate, UpdateInfo } from './src/services/updater';
import { DARK_THEME, LIGHT_THEME, ThemeMode, ThemeColors } from './src/constants/theme';

const INITIAL_RATES: RatesData = {
  bcvUsd: {
    id: 'USD_BCV',
    title: 'Dólar BCV',
    symbol: '$',
    rate: 857.01,
    variationAmount: 1.34,
    variationPercentage: 0.16,
    lastUpdated: 'Hoy',
    sourceName: 'Banco Central de Venezuela',
    sourceUrl: 'https://bcv.org.ve',
  },
  bcvEur: {
    id: 'EUR_BCV',
    title: 'Euro',
    symbol: '€',
    rate: 976.90,
    variationAmount: 4.25,
    variationPercentage: 0.44,
    lastUpdated: 'Hoy',
    sourceName: 'Banco Central de Venezuela',
    sourceUrl: 'https://bcv.org.ve',
  },
  usdt: {
    id: 'USDT',
    title: 'USDT',
    symbol: '₮',
    rate: 967.73,
    variationAmount: 1.45,
    variationPercentage: 0.15,
    lastUpdated: 'En vivo',
    sourceName: 'Binance P2P',
    sourceUrl: 'https://p2p.binance.com',
  },
  paralelo: {
    id: 'PARALELO',
    title: 'Paralelo',
    symbol: '$',
    rate: 952.25,
    variationAmount: 0.85,
    variationPercentage: 0.09,
    lastUpdated: 'Hoy',
    sourceName: 'Monitor Paralelo',
  },
  promedio: {
    id: 'PROMEDIO',
    title: 'Promedio',
    symbol: '$',
    rate: 912.37,
    variationAmount: 0.73,
    variationPercentage: 0.08,
    lastUpdated: 'Hoy',
    sourceName: 'Promedio Ponderado',
  },
  custom: {
    id: 'CUSTOM',
    title: 'Personalizada',
    symbol: '$',
    rate: 1.0,
    lastUpdated: 'Manual',
    sourceName: 'Tasa propia del usuario',
  },
  brechaUsdtVsBcv: 12.92,
  lastSyncTimestamp: Date.now(),
};

type ScreenType = 'HOME' | 'BCV_RATES' | 'USDT_RATES' | 'SETTINGS';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [showSplash, setShowSplash] = useState(true);

  // Determinar si el tema activo es oscuro
  const isDark =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const theme: ThemeColors = isDark ? DARK_THEME : LIGHT_THEME;

  const [rates, setRates] = useState<RatesData>(INITIAL_RATES);
  const [liveRates, setLiveRates] = useState<RatesData>(INITIAL_RATES);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD_BCV');
  const [customDateLabel, setCustomDateLabel] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');

  // Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [ratesModalContext, setRatesModalContext] = useState<CalculatorState | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCustomRateOpen, setIsCustomRateOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Auto-updater state (Cloudflare R2)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMandatoryUpdate, setIsMandatoryUpdate] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    // 1. Cargar tema preferido
    const savedTheme = await storageService.getThemeMode();
    if (savedTheme) {
      setThemeMode(savedTheme);
    }

    // 2. Cargar caché de tasas
    const cached = await storageService.getRatesCache();
    if (cached) {
      setRates(cached);
      setLiveRates(cached);
    }

    const lastCur = await storageService.getLastSelectedCurrency();
    if (lastCur) {
      setSelectedCurrency(lastCur as CurrencyType);
    }

    // 3. Sincronizar tasas en vivo
    refreshRates(false);

    // 4. Comprobar actualizaciones en Cloudflare R2
    checkUpdatesBackground(false);
  };

  const refreshRates = useCallback(async (withToast: boolean = true) => {
    setIsRefreshing(true);
    try {
      const fresh = await fetchAllRates();
      setLiveRates(fresh);
      setRates(fresh);
      setCustomDateLabel(undefined);
      if (withToast) {
        setShowToast(true);
      }
    } catch (e: any) {
      console.warn('Error al refrescar tasas:', e.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const checkUpdatesBackground = async (manual: boolean = false) => {
    try {
      const res = await checkForUpdate();
      if (res.hasUpdate && res.updateInfo) {
        setUpdateInfo(res.updateInfo);
        setIsMandatoryUpdate(res.isMandatory || false);
        setIsUpdateModalOpen(true);
      } else if (manual) {
        Alert.alert(
          'Actualización de Software',
          `Tienes la versión más reciente instalada (v${res.currentVersion}).`
        );
      }
    } catch (e: any) {
      if (manual) {
        Alert.alert('Aviso', 'No se pudo conectar al servidor de actualizaciones.');
      }
    }
  };

  const handleSelectCurrency = async (curr: CurrencyType) => {
    setSelectedCurrency(curr);
    await storageService.saveLastSelectedCurrency(curr);
  };

  const handleSaveCustomRate = async (newRate: number) => {
    await storageService.saveCustomRate(newRate);
    setRates((prev) => ({
      ...prev,
      custom: {
        ...prev.custom,
        rate: newRate,
      },
    }));
  };

  const handleThemeModeChange = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await storageService.saveThemeMode(mode);
  };

  const handleDrawerNavigate = (navScreen: DrawerScreenType) => {
    if (navScreen === 'CALCULATOR') {
      setCurrentScreen('HOME');
    } else if (navScreen === 'BCV_RATES') {
      setCurrentScreen('BCV_RATES');
    } else if (navScreen === 'USDT_RATES') {
      setCurrentScreen('USDT_RATES');
    } else if (navScreen === 'SETTINGS') {
      setCurrentScreen('SETTINGS');
    }
  };

  const handleApplyHistoricalRate = (hist: any) => {
    if (hist.isToday) {
      setCustomDateLabel(undefined);
      setRates(liveRates);
      setCurrentScreen('HOME');
      return;
    }

    setCustomDateLabel(hist.dateStr);
    setRates((prev) => ({
      ...prev,
      bcvUsd: {
        ...prev.bcvUsd,
        rate: hist.bcvUsd,
        lastUpdated: hist.dateStr,
      },
      bcvEur: {
        ...prev.bcvEur,
        rate: hist.bcvEur,
        lastUpdated: hist.dateStr,
      },
      usdt: {
        ...prev.usdt,
        rate: hist.usdt,
        lastUpdated: hist.dateStr,
      },
      promedio: {
        ...prev.promedio,
        rate: hist.promedio,
        lastUpdated: hist.dateStr,
      },
      brechaUsdtVsBcv: hist.brecha,
    }));
    setCurrentScreen('HOME');
  };

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <SplashScreen
          theme={theme}
          isDark={isDark}
          onFinish={() => setShowSplash(false)}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />

        {/* Mensaje Flotante Toast de 1 segundo al actualizar */}
        <FloatingToast
          visible={showToast}
          message="✓ Tasas actualizadas"
          theme={theme}
          onHide={() => setShowToast(false)}
        />

        {/* Pantallas */}
        {currentScreen === 'HOME' && (
          <HomeScreen
            rates={rates}
            selectedCurrency={selectedCurrency}
            customDateLabel={customDateLabel}
            theme={theme}
            isDark={isDark}
            onSelectCurrency={handleSelectCurrency}
            onRefresh={() => refreshRates(true)}
            isRefreshing={isRefreshing}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenRatesModal={(ctx) => {
              setRatesModalContext(ctx);
              setIsRatesModalOpen(true);
            }}
            onOpenDatePicker={() => setIsDatePickerOpen(true)}
          />
        )}

        {currentScreen === 'BCV_RATES' && (
          <BcvRatesScreen
            rates={rates}
            theme={theme}
            onBack={() => setCurrentScreen('HOME')}
            onRefresh={() => refreshRates(true)}
            isRefreshing={isRefreshing}
          />
        )}

        {currentScreen === 'USDT_RATES' && (
          <UsdtRatesScreen
            rates={rates}
            theme={theme}
            onBack={() => setCurrentScreen('HOME')}
            onRefresh={() => refreshRates(true)}
            isRefreshing={isRefreshing}
          />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen
            theme={theme}
            themeMode={themeMode}
            onThemeModeChange={handleThemeModeChange}
            onBack={() => setCurrentScreen('HOME')}
            onCheckUpdates={() => checkUpdatesBackground(true)}
          />
        )}

        {/* Modal de Tasas (Monedas) */}
        <RatesModal
          visible={isRatesModalOpen}
          theme={theme}
          onClose={() => {
            setIsRatesModalOpen(false);
            setRatesModalContext(undefined);
          }}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={handleSelectCurrency}
          onRefresh={() => refreshRates(true)}
          isRefreshing={isRefreshing}
          calculatorState={ratesModalContext}
          onOpenCustomRate={() => {
            setIsRatesModalOpen(false);
            setIsCustomRateOpen(true);
          }}
        />

        {/* Modal de Calendario y Fechas Históricas */}
        <DatePickerModal
          visible={isDatePickerOpen}
          theme={theme}
          currentBcvUsd={liveRates.bcvUsd.rate}
          currentBcvEur={liveRates.bcvEur.rate}
          currentUsdt={liveRates.usdt.rate}
          onClose={() => setIsDatePickerOpen(false)}
          onApplyHistoricalRate={handleApplyHistoricalRate}
        />

        {/* Drawer Lateral */}
        <SideDrawer
          visible={isDrawerOpen}
          theme={theme}
          isDark={isDark}
          onClose={() => setIsDrawerOpen(false)}
          activeScreen={
            currentScreen === 'HOME'
              ? 'CALCULATOR'
              : currentScreen === 'BCV_RATES'
              ? 'BCV_RATES'
              : currentScreen === 'USDT_RATES'
              ? 'USDT_RATES'
              : 'SETTINGS'
          }
          onNavigate={handleDrawerNavigate}
          onOpenInfo={() => setIsInfoOpen(true)}
          onCheckUpdates={() => checkUpdatesBackground(true)}
        />

        {/* Modal de Actualización OTA / APK */}
        <UpdateModal
          visible={isUpdateModalOpen}
          updateInfo={updateInfo}
          isMandatory={isMandatoryUpdate}
          onClose={() => setIsUpdateModalOpen(false)}
        />

        {/* Modal de Tasa Personalizada */}
        <CustomRateModal
          visible={isCustomRateOpen}
          currentRate={rates.custom.rate}
          onSave={handleSaveCustomRate}
          onClose={() => setIsCustomRateOpen(false)}
        />

        {/* Modal de Información Institucional */}
        <InfoModal
          visible={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
