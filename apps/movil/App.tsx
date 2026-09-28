import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { BcvRatesScreen } from './src/screens/BcvRatesScreen';
import { UsdtRatesScreen } from './src/screens/UsdtRatesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { RatesModal } from './src/components/RatesModal';
import { SideDrawer, DrawerScreenType } from './src/components/SideDrawer';
import { UpdateModal } from './src/components/UpdateModal';
import { CustomRateModal } from './src/components/CustomRateModal';
import { PaymentProfilesModal } from './src/components/PaymentProfilesModal';
import { ScannerModal } from './src/components/ScannerModal';
import { InfoModal } from './src/components/InfoModal';
import { RatesData, CurrencyType } from './src/types';
import { fetchAllRates } from './src/services/ratesService';
import { storageService } from './src/services/storageService';
import { checkForUpdate, UpdateInfo } from './src/services/updater';

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
  const [rates, setRates] = useState<RatesData>(INITIAL_RATES);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD_BCV');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCustomRateOpen, setIsCustomRateOpen] = useState(false);
  const [isPaymentProfilesOpen, setIsPaymentProfilesOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Auto-updater state (Cloudflare R2)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMandatoryUpdate, setIsMandatoryUpdate] = useState(false);

  // Inicialización y carga de caché
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    // 1. Cargar caché inmediata para arranque instantáneo
    const cached = await storageService.getRatesCache();
    if (cached) {
      setRates(cached);
    }

    const lastCur = await storageService.getLastSelectedCurrency();
    if (lastCur) {
      setSelectedCurrency(lastCur as CurrencyType);
    }

    // 2. Sincronizar tasas en vivo (BCV USD, BCV EUR, Binance P2P USDT)
    refreshRates();

    // 3. Comprobar actualizaciones automáticas en Cloudflare R2
    checkUpdatesBackground(false);
  };

  const refreshRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fresh = await fetchAllRates();
      setRates(fresh);
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

  const handleDrawerNavigate = (navScreen: DrawerScreenType) => {
    if (navScreen === 'CALCULATOR') {
      setCurrentScreen('HOME');
    } else if (navScreen === 'BCV_RATES') {
      setCurrentScreen('BCV_RATES');
    } else if (navScreen === 'USDT_RATES') {
      setCurrentScreen('USDT_RATES');
    } else if (navScreen === 'PAYMENT_PROFILES') {
      setIsPaymentProfilesOpen(true);
    } else if (navScreen === 'SETTINGS') {
      setCurrentScreen('SETTINGS');
    }
  };

  const handleScannedValue = (amountUsd: number) => {
    // Al escanear, seleccionamos Dólar BCV y volvemos al home
    setCurrentScreen('HOME');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Pantallas */}
        {currentScreen === 'HOME' && (
          <HomeScreen
            rates={rates}
            selectedCurrency={selectedCurrency}
            onSelectCurrency={handleSelectCurrency}
            onRefresh={refreshRates}
            isRefreshing={isRefreshing}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenRatesModal={() => setIsRatesModalOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {currentScreen === 'BCV_RATES' && (
          <BcvRatesScreen
            rates={rates}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'USDT_RATES' && (
          <UsdtRatesScreen
            rates={rates}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen
            onBack={() => setCurrentScreen('HOME')}
            onCheckUpdates={() => checkUpdatesBackground(true)}
          />
        )}

        {/* Modal de Tasas (Monedas - Screenshot 3) */}
        <RatesModal
          visible={isRatesModalOpen}
          onClose={() => setIsRatesModalOpen(false)}
          rates={rates}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={handleSelectCurrency}
          onRefresh={refreshRates}
          isRefreshing={isRefreshing}
          onOpenCustomRate={() => {
            setIsRatesModalOpen(false);
            setIsCustomRateOpen(true);
          }}
        />

        {/* Drawer Lateral (Menú - Screenshot 4) */}
        <SideDrawer
          visible={isDrawerOpen}
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

        {/* Modal de Perfiles de Pago */}
        <PaymentProfilesModal
          visible={isPaymentProfilesOpen}
          onClose={() => setIsPaymentProfilesOpen(false)}
        />

        {/* Modal de Escáner de Precios */}
        <ScannerModal
          visible={isScannerOpen}
          rate={rates.bcvUsd.rate}
          rateName="Dólar BCV"
          onClose={() => setIsScannerOpen(false)}
          onApplyScannedValue={handleScannedValue}
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
    backgroundColor: '#000000',
  },
});
