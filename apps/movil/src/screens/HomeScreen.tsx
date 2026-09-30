import React, { useState, useEffect, useRef } from 'react';
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
  RefreshControl,
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
  RotateCcw,
  BarChart2,
} from 'lucide-react-native';
import { AppLogo } from '../components/AppLogo';
import { RatesData, CurrencyType, RateItem } from '../types';
import { formatVES } from '../services/ratesService';
import { ThemeColors } from '../constants/theme';
import { CalculatorState } from '../components/RatesModal';

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
  onOpenRatesModal: (context?: CalculatorState) => void;
  onOpenDatePicker: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formateador estilo ATM venezolano: '5' -> '0,05', '52' -> '0,52', '100000000' -> '1.000.000,00'
// ─────────────────────────────────────────────────────────────────────────────
function formatATM(raw: string): string {
  if (!raw || raw === '0') return '0,00';
  const clean = raw.replace(/^0+/, '') || '0';
  if (clean === '0') return '0,00';
  const padded = clean.padStart(3, '0');
  const intPart = padded.slice(0, -2);
  const decPart = padded.slice(-2);
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedInt},${decPart}`;
}

function digitsToNumber(raw: string): number {
  if (!raw) return 0;
  return parseInt(raw, 10) / 100;
}

function numberToDigits(n: number): string {
  if (!n || isNaN(n) || n <= 0) return '';
  const cents = Math.round(n * 100);
  return cents > 0 ? String(cents) : '';
}

// Procesa la entrada de texto comparándola con el valor previo formateado
function handleATMChange(incomingText: string, prevDisplay: string, prevRaw: string): string {
  if (!incomingText) return '';

  // Detección de borrado (backspace)
  if (incomingText.length < prevDisplay.length) {
    return prevRaw.slice(0, -1);
  }

  // Detección de carácter individual añadido
  if (incomingText.length === prevDisplay.length + 1) {
    let addedChar = '';
    for (let i = 0; i < incomingText.length; i++) {
      if (i >= prevDisplay.length || incomingText[i] !== prevDisplay[i]) {
        if (/^[0-9]$/.test(incomingText[i])) {
          addedChar = incomingText[i];
          break;
        }
      }
    }
    if (addedChar) {
      return (prevRaw + addedChar).replace(/^0+/, '');
    }
  }

  // Pegado o caracteres múltiples: extraer dígitos numéricos
  const digits = incomingText.replace(/[^0-9]/g, '').replace(/^0+/, '');
  return digits;
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
  const getActiveRateItem = (): RateItem => {
    switch (selectedCurrency) {
      case 'USD_BCV':  return rates.bcvUsd;
      case 'EUR_BCV':  return rates.bcvEur;
      case 'USDT':     return rates.usdt;
      case 'PARALELO': return rates.paralelo;
      case 'PROMEDIO': return rates.promedio;
      case 'CUSTOM':   return rates.custom;
      default:         return rates.bcvUsd;
    }
  };

  const activeRate = getActiveRateItem();

  // Dígitos almacenados internamente (solo números sin formato)
  const [foreignDigits, setForeignDigits] = useState('100'); // Inicial: 1,00
  const [vesDigits, setVesDigits] = useState(() => numberToDigits(activeRate.rate));

  // Estados de foco (controlan si la línea inferior se ilumina en verde)
  const [foreignFocused, setForeignFocused] = useState(false);
  const [vesFocused, setVesFocused] = useState(false);

  // Flags para limpiar a 0,00 solo la primera vez que se toca cada campo
  const [foreignCleared, setForeignCleared] = useState(false);
  const [vesCleared, setVesCleared] = useState(false);

  // Ancla de cálculo: 'foreign' o 'ves'
  const [lastEdited, setLastEdited] = useState<'foreign' | 'ves'>('foreign');
  const [hasUserEdited, setHasUserEdited] = useState(false);

  const [copiedField, setCopiedField] = useState<'foreign' | 'ves' | null>(null);

  // Refs para preservar los valores más recientes en efectos y callbacks
  const foreignDigitsRef = useRef(foreignDigits);
  const vesDigitsRef = useRef(vesDigits);
  const lastEditedRef = useRef(lastEdited);
  foreignDigitsRef.current = foreignDigits;
  vesDigitsRef.current = vesDigits;
  lastEditedRef.current = lastEdited;

  // Recálculo automático al cambiar de tasa o moneda
  useEffect(() => {
    const fd = foreignDigitsRef.current;
    const vd = vesDigitsRef.current;

    if (lastEditedRef.current === 'ves') {
      // Bs es el monto base -> se recalcula la moneda extranjera
      const vNum = digitsToNumber(vd);
      const fNum = activeRate.rate > 0 ? vNum / activeRate.rate : 0;
      setForeignDigits(numberToDigits(fNum));
    } else {
      // Moneda extranjera es el monto base -> se recalcula en Bs
      const fNum = digitsToNumber(fd);
      const vNum = fNum * activeRate.rate;
      setVesDigits(numberToDigits(vNum));
    }
  }, [activeRate.rate, selectedCurrency]);

  // Valores de visualización en pantalla
  const foreignDisplay = formatATM(foreignDigits);
  const vesDisplay = formatATM(vesDigits);

  // ── Manejadores de foco con auto-clear primera vez ──
  const handleForeignFocus = () => {
    setForeignFocused(true);
    if (!foreignCleared) {
      // Primera vez: limpiar a 0,00 e iniciar edición
      setForeignDigits('');
      setVesDigits('');
      setForeignCleared(true);
      setHasUserEdited(true);
      setLastEdited('foreign');
    }
  };

  const handleVesFocus = () => {
    setVesFocused(true);
    if (!vesCleared) {
      // Primera vez: limpiar a 0,00 e iniciar edición
      setVesDigits('');
      setForeignDigits('');
      setVesCleared(true);
      setHasUserEdited(true);
      setLastEdited('ves');
    }
  };

  // ── Manejadores de escritura en tiempo real (ATM) ──
  const handleForeignTextChange = (text: string) => {
    setLastEdited('foreign');
    setHasUserEdited(true);

    const nextRaw = handleATMChange(text, foreignDisplay, foreignDigits);
    setForeignDigits(nextRaw);

    const fNum = digitsToNumber(nextRaw);
    const vNum = fNum * activeRate.rate;
    setVesDigits(numberToDigits(vNum));
  };

  const handleVesTextChange = (text: string) => {
    setLastEdited('ves');
    setHasUserEdited(true);

    const nextRaw = handleATMChange(text, vesDisplay, vesDigits);
    setVesDigits(nextRaw);

    const vNum = digitsToNumber(nextRaw);
    const fNum = activeRate.rate > 0 ? vNum / activeRate.rate : 0;
    setForeignDigits(numberToDigits(fNum));
  };

  // ── Reiniciar calculadora ──
  const handleResetCalculator = () => {
    const initialForeign = '100'; // 1,00
    const initialVes = numberToDigits(activeRate.rate);

    setForeignDigits(initialForeign);
    setVesDigits(initialVes);

    // Permite que la próxima vez que toque vuelva a ponerse en 0
    setForeignCleared(false);
    setVesCleared(false);

    setLastEdited('foreign');
    setHasUserEdited(false);
  };

  // ── Comparar tasas ──
  const handleOpenComparison = () => {
    const amount = lastEdited === 'foreign' ? digitsToNumber(foreignDigits) : digitsToNumber(vesDigits);
    onOpenRatesModal({
      anchor: lastEdited,
      amount,
      symbol: activeRate.symbol,
    });
  };

  // ── Copiar ──
  const handleCopy = (value: string, field: 'foreign' | 'ves') => {
    Clipboard.setString(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Compartir App ──
  const handleShareApp = async () => {
    try {
      const msg =
        `📊 APP-MONITOR VENEZUELA\n` +
        `💵 ${activeRate.title}: ${formatVES(activeRate.rate)} Bs\n` +
        `🪙 USDT Binance P2P: ${formatVES(rates.usdt.rate)} Bs\n` +
        `📈 Brecha Cambiaria: ${rates.brechaUsdtVsBcv}%\n` +
        `📅 Fecha: ${customDateLabel || activeRate.lastUpdated}\n\n` +
        `Descarga APP-MONITOR: https://app.rvproyecto.xyz`;

      await Share.share({ message: msg });
    } catch (e) {
      console.warn('Error al compartir:', e);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      bounces={true}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.accentGreen}
          colors={[theme.accentGreen]}
          progressBackgroundColor={theme.surface}
        />
      }
    >
      {/* Barra Superior */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onOpenDrawer} activeOpacity={0.7}>
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

          <TouchableOpacity style={styles.iconButton} onPress={handleShareApp} activeOpacity={0.7}>
            <Share2 size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logotipo Central Oficial */}
      <View style={styles.logoWrapper}>
        <AppLogo size={145} isDark={isDark} useImage={true} />
      </View>

      {/* Tarjeta Principal de Conversión */}
      <View style={[styles.conversionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Píldora Selectora de Tasa */}
        <TouchableOpacity
          style={[styles.rateSelectorPill, { backgroundColor: theme.pillBg }]}
          onPress={() => onOpenRatesModal()}
          activeOpacity={0.8}
        >
          <Text style={[styles.rateSelectorText, { color: theme.pillText }]}>
            {activeRate.title}
          </Text>
          <MoreVertical size={18} color={theme.pillText} />
        </TouchableOpacity>

        {/* Fila 1: Monto en Divisa Extranjera (con borde verde al enfocar) */}
        <View
          style={[
            styles.inputRow,
            {
              borderBottomColor: foreignFocused ? theme.accentGreen : theme.border,
              borderBottomWidth: foreignFocused ? 2 : 1,
            },
          ]}
        >
          <View style={styles.symbolBox}>
            <Text style={[styles.currencySymbol, { color: theme.textPrimary }]}>
              {activeRate.symbol}
            </Text>
          </View>

          <View style={styles.inputFlexContainer}>
            <TextInput
              style={[
                styles.textInput,
                { color: foreignFocused ? theme.accentGreen : theme.textPrimary },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              value={foreignDisplay}
              onChangeText={handleForeignTextChange}
              onFocus={handleForeignFocus}
              onBlur={() => setForeignFocused(false)}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopy(foreignDisplay, 'foreign')}
            activeOpacity={0.7}
          >
            {copiedField === 'foreign' ? (
              <Check size={20} color={theme.accentGreen} />
            ) : (
              <Copy size={20} color={theme.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Fila 2: Monto en Bolívares (Bs) (con borde verde al enfocar) */}
        <View
          style={[
            styles.inputRow,
            {
              borderBottomColor: vesFocused ? theme.accentGreen : theme.border,
              borderBottomWidth: vesFocused ? 2 : 1,
            },
          ]}
        >
          <View style={styles.symbolBox}>
            <Text style={[styles.currencySymbol, { color: theme.textPrimary }]}>
              Bs
            </Text>
          </View>

          <View style={styles.inputFlexContainer}>
            <TextInput
              style={[
                styles.textInput,
                { color: vesFocused ? theme.accentGreen : theme.textPrimary },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              value={vesDisplay}
              onChangeText={handleVesTextChange}
              onFocus={handleVesFocus}
              onBlur={() => setVesFocused(false)}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopy(vesDisplay, 'ves')}
            activeOpacity={0.7}
          >
            {copiedField === 'ves' ? (
              <Check size={20} color={theme.accentGreen} />
            ) : (
              <Copy size={20} color={theme.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Mutuamente excluyente: Si se modifica, los botones reemplazan la variación */}
        {hasUserEdited ? (
          <View style={[styles.calcActionsRow, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.calcResetButton,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
              onPress={handleResetCalculator}
              activeOpacity={0.7}
            >
              <RotateCcw size={15} color={theme.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.calcActionText, { color: theme.textPrimary }]}>
                Reiniciar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.calcShareButton, { backgroundColor: theme.accentGreen }]}
              onPress={handleOpenComparison}
              activeOpacity={0.8}
            >
              <BarChart2 size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={[styles.calcActionText, { color: '#FFFFFF', fontWeight: '700' }]}>
                Comparar
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
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
        )}
      </View>

      {/* Selector de Fecha */}
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

      {/* Botón Principal: Ver Lista de Tasas y Monedas */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionButtonWide, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onOpenRatesModal()}
          activeOpacity={0.8}
        >
          <List size={22} color={theme.textPrimary} style={{ marginRight: 10 }} />
          <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>
            Ver Lista de Tasas y Monedas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pie institucional y fuente oficial */}
      <Text style={[styles.footnote, { color: theme.textMuted }]}>
        {selectedCurrency === 'USDT'
          ? 'Cotización promedio USDT obtenida en tiempo real de Binance P2P.'
          : 'Tasa oficial publicada por el Banco Central de Venezuela en bcv.org.ve.'}
      </Text>

      <View style={[styles.footerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.footerBannerText, { color: theme.textMuted }]}>
          APP-MONITOR • MONITOR DOLAR & USDT
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 50,
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
  iconButton: { padding: 6 },
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
  calcActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  calcResetButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcShareButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcActionText: {
    fontSize: 14,
    fontWeight: '600',
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
