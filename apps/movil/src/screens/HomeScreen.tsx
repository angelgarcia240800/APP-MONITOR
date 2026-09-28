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
  Platform,
} from 'react-native';
import {
  Menu,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Calendar,
  List,
  ArrowUp,
  MoreVertical,
  TrendingUp,
} from 'lucide-react-native';
import { AppLogo } from '../components/AppLogo';
import { RatesData, CurrencyType, RateItem } from '../types';
import { formatVES } from '../services/ratesService';
import { ThemeColors } from '../constants/theme';

interface HomeScreenProps {
  rates: RatesData;
  selectedCurrency: CurrencyType;
  customDateLabel?: string;
  theme: ThemeColors;
  isDark: boolean;
  onSelectCurrency: (currency: CurrencyType) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onOpenDrawer: () => void;
  onOpenRatesModal: () => void;
  onOpenDatePicker: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  rates,
  selectedCurrency,
  customDateLabel,
  theme,
  isDark,
  onSelectCurrency,
  onRefresh,
  isRefreshing,
  onOpenDrawer,
  onOpenRatesModal,
  onOpenDatePicker,
}) => {
  const [foreignAmount, setForeignAmount] = useState('1.00');
  const [vesAmount, setVesAmount] = useState('');
  const [copiedField, setCopiedField] = useState<'foreign' | 'ves' | null>(null);

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
        `📅 Fecha: ${customDateLabel || activeRate.lastUpdated}\n\n` +
        `Descarga APP-MONITOR: https://github.com/angelgarcia240800/APP-MONITOR`;

      await Share.share({ message: msg });
    } catch (e) {
      console.warn('Error al compartir:', e);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {/* Barra Superior */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenDrawer}
          activeOpacity={0.7}
        >
          <Menu size={26} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRefresh}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.textPrimary} />
            ) : (
              <RefreshCw size={24} color={theme.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShareApp}
            activeOpacity={0.7}
          >
            <Share2 size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logotipo Central Oficial con flechas verdes */}
      <View style={styles.logoWrapper}>
        <AppLogo size={145} isDark={isDark} useImage={true} />
      </View>

      {/* Tarjeta Principal de Conversión */}
      <View style={[styles.conversionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Píldora Selectora de Tasa */}
        <TouchableOpacity
          style={[styles.rateSelectorPill, { backgroundColor: theme.pillBg }]}
          onPress={onOpenRatesModal}
          activeOpacity={0.8}
        >
          <Text style={[styles.rateSelectorText, { color: theme.pillText }]}>
            {activeRate.title}
          </Text>
          <MoreVertical size={18} color={theme.pillText} />
        </TouchableOpacity>

        {/* Fila 1: Monto en Divisa Extranjera */}
        <View style={[styles.inputRow, { borderColor: theme.border }]}>
          <View style={styles.symbolBox}>
            <Text style={[styles.currencySymbol, { color: theme.textPrimary }]}>
              {activeRate.symbol}
            </Text>
          </View>

          <View style={styles.inputFlexContainer}>
            <TextInput
              style={[
                styles.textInput,
                { color: theme.textPrimary },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              value={foreignAmount}
              onChangeText={handleForeignChange}
              keyboardType="numeric"
              placeholder="1.00"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopy(foreignAmount, 'foreign')}
            activeOpacity={0.7}
          >
            {copiedField === 'foreign' ? (
              <Check size={20} color={theme.accentGreen} />
            ) : (
              <Copy size={20} color={theme.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Fila 2: Monto en Bolívares (Bs) */}
        <View style={[styles.inputRow, { borderColor: theme.border }]}>
          <View style={styles.symbolBox}>
            <Text style={[styles.currencySymbol, { color: theme.textPrimary }]}>
              Bs
            </Text>
          </View>

          <View style={styles.inputFlexContainer}>
            <TextInput
              style={[
                styles.textInput,
                { color: theme.textPrimary },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              value={vesAmount}
              onChangeText={handleVesChange}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopy(vesAmount, 'ves')}
            activeOpacity={0.7}
          >
            {copiedField === 'ves' ? (
              <Check size={20} color={theme.accentGreen} />
            ) : (
              <Copy size={20} color={theme.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Variación e Indicador con Flecha Verde */}
        <View style={styles.variationRow}>
          <View style={styles.variationBadge}>
            <ArrowUp size={16} color={theme.accentGreen} strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={[styles.variationText, { color: theme.accentGreen }]}>
              +{formatVES(activeRate.variationAmount || 1.34)} Bs (
              {activeRate.variationPercentage || 0.16}%)
            </Text>
          </View>
          <TrendingUp size={18} color={theme.textMuted} />
        </View>
      </View>

      {/* Selector de Fecha Interactivo (Abre DatePickerModal) */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={[styles.datePill, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onOpenDatePicker}
          activeOpacity={0.8}
        >
          <Text style={[styles.dateText, { color: theme.textPrimary }]}>
            {customDateLabel || activeRate.lastUpdated}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.calendarButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onOpenDatePicker}
          activeOpacity={0.8}
        >
          <Calendar size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Botón de Acción Principal (Tasas y Monedas) */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionButtonWide, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onOpenRatesModal}
          activeOpacity={0.8}
        >
          <List size={22} color={theme.textPrimary} style={{ marginRight: 10 }} />
          <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>
            Ver Lista de Tasas y Monedas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pie de página con fuente oficial */}
      <Text style={[styles.footnote, { color: theme.textMuted }]}>
        {selectedCurrency === 'USDT'
          ? 'Cotización promedio USDT obtenida en tiempo real de Binance P2P.'
          : 'Tasa oficial publicada por el Banco Central de Venezuela en bcv.org.ve.'}
      </Text>

      {/* Banner / Pie Institucional */}
      <View style={[styles.footerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.footerBannerText, { color: theme.textMuted }]}>
          APP-MONITOR • MONITOR DOLAR & USDT
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginVertical: 14,
  },
  conversionCard: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
    overflow: 'hidden',
  },
  rateSelectorPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
    gap: 8,
  },
  rateSelectorText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    width: '100%',
    minWidth: 0,
  },
  symbolBox: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '800',
  },
  inputFlexContainer: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  textInput: {
    width: '100%',
    minWidth: 0,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  copyButton: {
    padding: 6,
    flexShrink: 0,
  },
  variationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 4,
  },
  variationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variationText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    width: '100%',
  },
  datePill: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  calendarButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsRow: {
    marginBottom: 18,
    width: '100%',
  },
  actionButtonWide: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footnote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  footerBanner: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  footerBannerText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
