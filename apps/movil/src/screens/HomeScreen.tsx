import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Clipboard,
  Share,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import {
  Menu,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Calendar,
  Camera,
  List,
  ArrowUp,
  MoreVertical,
  TrendingUp,
} from 'lucide-react-native';
import { MonochromeLogo } from '../components/MonochromeLogo';
import { RatesData, CurrencyType, RateItem } from '../types';
import { formatVES } from '../services/ratesService';

interface HomeScreenProps {
  rates: RatesData;
  selectedCurrency: CurrencyType;
  onSelectCurrency: (currency: CurrencyType) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onOpenDrawer: () => void;
  onOpenRatesModal: () => void;
  onOpenScanner: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  rates,
  selectedCurrency,
  onSelectCurrency,
  onRefresh,
  isRefreshing,
  onOpenDrawer,
  onOpenRatesModal,
  onOpenScanner,
}) => {
  // Estado de inputs para cálculo bidireccional
  const [foreignAmount, setForeignAmount] = useState('1.00');
  const [vesAmount, setVesAmount] = useState('');
  const [copiedField, setCopiedField] = useState<'foreign' | 'ves' | null>(null);

  // Animación del botón refresh
  const spinValue = new Animated.Value(0);

  const getActiveRateItem = (): RateItem => {
    switch (selectedCurrency) {
      case 'USD_BCV':
        return rates.bcvUsd;
      case 'EUR_BCV':
        return rates.bcvEur;
      case 'USDT':
        return rates.usdt;
      case 'PARALELO':
        return rates.paralelo;
      case 'PROMEDIO':
        return rates.promedio;
      case 'CUSTOM':
        return rates.custom;
      default:
        return rates.bcvUsd;
    }
  };

  const activeRate = getActiveRateItem();

  // Recalcular Bs cuando cambia la tasa activa o foreignAmount
  useEffect(() => {
    const fVal = parseFloat(foreignAmount.replace(',', '.'));
    if (!isNaN(fVal)) {
      const calcVes = (fVal * activeRate.rate).toFixed(2);
      setVesAmount(formatVES(parseFloat(calcVes)));
    } else {
      setVesAmount('0,00');
    }
  }, [activeRate.rate, selectedCurrency]);

  const handleForeignChange = (text: string) => {
    setForeignAmount(text);
    const clean = text.replace(',', '.');
    const fVal = parseFloat(clean);
    if (!isNaN(fVal)) {
      const calcVes = fVal * activeRate.rate;
      setVesAmount(formatVES(calcVes));
    } else {
      setVesAmount('0,00');
    }
  };

  const handleVesChange = (text: string) => {
    setVesAmount(text);
    // Eliminar puntos de miles y reemplazar coma por punto
    const clean = text.replace(/\./g, '').replace(',', '.');
    const vVal = parseFloat(clean);
    if (!isNaN(vVal) && activeRate.rate > 0) {
      const calcForeign = (vVal / activeRate.rate).toFixed(2);
      setForeignAmount(calcForeign);
    } else {
      setForeignAmount('0.00');
    }
  };

  const handleCopy = (value: string, field: 'foreign' | 'ves') => {
    Clipboard.setString(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShareApp = async () => {
    try {
      const msg =
        `📊 APP-MONITOR VENEZUELA\n` +
        `💵 ${activeRate.title}: ${formatVES(activeRate.rate)} Bs\n` +
        `🪙 USDT Binance P2P: ${formatVES(rates.usdt.rate)} Bs\n` +
        `📈 Brecha Cambiaria: ${rates.brechaUsdtVsBcv}%\n` +
        `📅 Fecha: ${activeRate.lastUpdated}\n\n` +
        `Descarga APP-MONITOR: https://github.com/angelgarcia240800/APP-MONITOR`;

      await Share.share({ message: msg });
    } catch (e) {
      console.warn('Error al compartir:', e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} bounces={false}>
      {/* Barra Superior de Navegación */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenDrawer}
          activeOpacity={0.7}
        >
          <Menu size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRefresh}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <RefreshCw size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShareApp}
            activeOpacity={0.7}
          >
            <Share2 size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logotipo Central Monocromático */}
      <View style={styles.logoWrapper}>
        <MonochromeLogo size={145} />
      </View>

      {/* Tarjeta Principal de Conversión */}
      <View style={styles.conversionCard}>
        {/* Píldora Selectora de Tasa */}
        <TouchableOpacity
          style={styles.rateSelectorPill}
          onPress={onOpenRatesModal}
          activeOpacity={0.8}
        >
          <Text style={styles.rateSelectorText}>{activeRate.title}</Text>
          <MoreVertical size={18} color="#000000" />
        </TouchableOpacity>

        {/* Fila 1: Monto en Divisa Extranjera */}
        <View style={styles.inputRow}>
          <Text style={styles.currencySymbol}>{activeRate.symbol}</Text>
          <TextInput
            style={styles.textInput}
            value={foreignAmount}
            onChangeText={handleForeignChange}
            keyboardType="numeric"
            placeholder="1.00"
            placeholderTextColor="#666666"
          />
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopy(foreignAmount, 'foreign')}
            activeOpacity={0.7}
          >
            {copiedField === 'foreign' ? (
              <Check size={20} color="#FFFFFF" />
            ) : (
              <Copy size={20} color="#888888" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputDivider} />

        {/* Fila 2: Monto en Bolívares */}
        <View style={styles.inputRow}>
          <Text style={styles.currencySymbol}>Bs</Text>
          <TextInput
            style={styles.textInput}
            value={vesAmount}
            onChangeText={handleVesChange}
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor="#666666"
          />
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopy(vesAmount, 'ves')}
            activeOpacity={0.7}
          >
            {copiedField === 'ves' ? (
              <Check size={20} color="#FFFFFF" />
            ) : (
              <Copy size={20} color="#888888" />
            )}
          </TouchableOpacity>
        </View>

        {/* Variación e Indicador de Tendencia */}
        <View style={styles.variationRow}>
          <View style={styles.variationBadge}>
            <ArrowUp size={15} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.variationText}>
              +{formatVES(activeRate.variationAmount || 1.34)} Bs (
              {activeRate.variationPercentage || 0.16}%)
            </Text>
          </View>
          <TrendingUp size={18} color="#888888" />
        </View>
      </View>

      {/* Selector de Fecha */}
      <View style={styles.dateRow}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{activeRate.lastUpdated}</Text>
        </View>

        <TouchableOpacity
          style={styles.calendarButton}
          onPress={onOpenRatesModal}
          activeOpacity={0.8}
        >
          <Calendar size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Botones de Acción: Escáner y Tasas */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOpenScanner}
          activeOpacity={0.8}
        >
          <Camera size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.actionButtonText}>Escáner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOpenRatesModal}
          activeOpacity={0.8}
        >
          <List size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.actionButtonText}>Tasas</Text>
        </TouchableOpacity>
      </View>

      {/* Pie de página con fuente oficial */}
      <Text style={styles.footnote}>
        {selectedCurrency === 'USDT'
          ? 'Cotización promedio USDT obtenida de órdenes Binance P2P.'
          : 'Tasa oficial del dólar y euro publicada por el BCV en bcv.org.ve.'}
      </Text>

      {/* Banner / Pie Institucional Monocromático */}
      <View style={styles.footerBanner}>
        <Text style={styles.footerBannerText}>APP-MONITOR • MONITOR DOLAR & USDT</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 6,
  },
  logoWrapper: {
    alignItems: 'center',
    marginVertical: 18,
  },
  conversionCard: {
    backgroundColor: '#161616',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 16,
  },
  rateSelectorPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 20,
    gap: 8,
  },
  rateSelectorText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    width: 38,
  },
  textInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'right',
    paddingRight: 14,
  },
  copyButton: {
    padding: 8,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 12,
  },
  variationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 8,
  },
  variationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  datePill: {
    flex: 1,
    height: 52,
    backgroundColor: '#181818',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: '600',
  },
  calendarButton: {
    width: 52,
    height: 52,
    backgroundColor: '#181818',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 54,
    backgroundColor: '#181818',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footnote: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  footerBanner: {
    backgroundColor: '#121212',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  footerBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1,
  },
});
