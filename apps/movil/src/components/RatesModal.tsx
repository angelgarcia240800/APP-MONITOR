import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Share,
  ActivityIndicator,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { RefreshCw, ArrowUp, Share2, Edit3 } from 'lucide-react-native';
import { RatesData, CurrencyType } from '../types';
import { formatVES } from '../services/ratesService';
import { ThemeColors } from '../constants/theme';

export interface CalculatorState {
  anchor: 'foreign' | 'ves';
  amount: number;
  symbol: string;
}

interface RatesModalProps {
  visible: boolean;
  theme: ThemeColors;
  onClose: () => void;
  rates: RatesData;
  selectedCurrency: CurrencyType;
  onSelectCurrency: (currency: CurrencyType) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onOpenCustomRate: () => void;
  calculatorState?: CalculatorState;
}

// Formateador venezolano estilo ATM: 1.000.000,00
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

function numberToDigits(n: number): string {
  const cents = Math.round(n * 100);
  return cents > 0 ? String(cents) : '';
}

export const RatesModal: React.FC<RatesModalProps> = ({
  visible,
  theme,
  onClose,
  rates,
  selectedCurrency,
  onSelectCurrency,
  onRefresh,
  isRefreshing,
  onOpenCustomRate,
  calculatorState,
}) => {
  const translateY = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Apertura sincronizada: la sombra y la tarjeta aparecen juntas
  useEffect(() => {
    if (visible) {
      translateY.setValue(500);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Cierre sincronizado: la sombra y la tarjeta se van juntas
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Gesto de arrastrar hacia abajo para cerrar el modal (compatible con Android/Expo Go y Web)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          // La sombra se desvanece gradualmente con el arrastre
          const opacity = Math.max(0, 1 - gestureState.dy / 250);
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          handleClose();
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
            }),
            Animated.spring(fadeAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleShare = async () => {
    try {
      const fecha = rates.bcvUsd.lastUpdated || 'Hoy';
      const message =
        `📊 APP-MONITOR — TASAS DE CAMBIO VENEZUELA\n` +
        `📅 ${fecha}\n\n` +
        `💵 Dólar BCV: ${formatVES(rates.bcvUsd.rate)} Bs (+${rates.bcvUsd.variationPercentage}%)\n` +
        `💶 Euro BCV: ${formatVES(rates.bcvEur.rate)} Bs (+${rates.bcvEur.variationPercentage}%)\n` +
        `🪙 USDT P2P: ${formatVES(rates.usdt.rate)} Bs (+${rates.usdt.variationPercentage}%)\n` +
        `⚖️ Promedio: ${formatVES(rates.promedio.rate)} Bs\n` +
        `📈 Brecha ($/USDT): ${rates.brechaUsdtVsBcv}%\n\n` +
        `📱 Descarga: https://app.rvproyecto.xyz`;

      await Share.share({ message });
    } catch (e) {
      console.warn('Error al compartir tasas:', e);
    }
  };

  const rateItems = [
    {
      id: 'USD_BCV' as CurrencyType,
      title: 'Dólar BCV',
      symbol: '$',
      rate: rates.bcvUsd.rate,
      variationPct: rates.bcvUsd.variationPercentage,
      variationAmount: rates.bcvUsd.variationAmount,
    },
    {
      id: 'EUR_BCV' as CurrencyType,
      title: 'Euro',
      symbol: '€',
      rate: rates.bcvEur.rate,
      variationPct: rates.bcvEur.variationPercentage,
      variationAmount: rates.bcvEur.variationAmount,
    },
    {
      id: 'PROMEDIO' as CurrencyType,
      title: 'Promedio',
      symbol: '$',
      rate: rates.promedio.rate,
      variationPct: rates.promedio.variationPercentage,
      variationAmount: rates.promedio.variationAmount,
    },
    {
      id: 'USDT' as CurrencyType,
      title: 'USDT',
      symbol: '₮',
      rate: rates.usdt.rate,
      variationPct: rates.usdt.variationPercentage,
      variationAmount: rates.usdt.variationAmount,
    },
    {
      id: 'CUSTOM' as CurrencyType,
      title: 'Personalizada',
      symbol: '$',
      rate: rates.custom.rate,
      isCustom: true,
    },
  ];

  const hasCustomComparison = calculatorState && calculatorState.amount > 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        {/* Área superior vacía para cerrar al tocar fuera */}
        <TouchableOpacity
          style={styles.backdropTouchArea}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Contenedor del Bottom Sheet animado */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Zona superior táctil para arrastrar hacia abajo */}
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={[styles.dragHandle, { backgroundColor: theme.borderHighlight }]} />

            {/* Header del modal */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  {hasCustomComparison ? 'Comparar Monedas' : 'Monedas'}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  {hasCustomComparison
                    ? calculatorState.anchor === 'foreign'
                      ? `Monto base: ${formatATM(numberToDigits(calculatorState.amount))} ${calculatorState.symbol}`
                      : `Monto base: ${formatATM(numberToDigits(calculatorState.amount))} Bs`
                    : `${rates.bcvUsd.lastUpdated}, 10:00 AM`}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                onPress={onRefresh}
                disabled={isRefreshing}
                activeOpacity={0.7}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={theme.textPrimary} />
                ) : (
                  <RefreshCw size={20} color={theme.textPrimary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Tarjeta de Brecha Cambiaria ($/USDT) */}
            <View style={[styles.brechaCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <View style={styles.brechaLeft}>
                <Text style={[styles.brechaLabel, { color: theme.textSecondary }]}>Brecha ($/USDT):</Text>
                <Text style={[styles.brechaValue, { color: theme.textPrimary }]}>
                  {rates.brechaUsdtVsBcv.toFixed(2)}%
                </Text>
              </View>
              <View style={[styles.brechaIconBadge, { backgroundColor: theme.accentGreenSubtle }]}>
                <ArrowUp size={20} color={theme.accentGreen} strokeWidth={2.5} />
              </View>
            </View>

            {/* Lista de Tasas */}
            <View style={styles.ratesList}>
              {rateItems.map((item) => {
                const isSelected = selectedCurrency === item.id;

                // Si hay monto de comparación activo:
                let displayPrice = `${formatVES(item.rate)} Bs`;
                let displaySubText = '';

                if (hasCustomComparison) {
                  if (calculatorState.anchor === 'foreign') {
                    const converted = item.rate * calculatorState.amount;
                    displayPrice = `${formatATM(numberToDigits(converted))} Bs`;
                    displaySubText = `Tasa: ${formatVES(item.rate)} Bs`;
                  } else {
                    const converted = item.rate > 0 ? calculatorState.amount / item.rate : 0;
                    displayPrice = `${formatATM(numberToDigits(converted))} ${item.symbol}`;
                    displaySubText = `Tasa: ${formatVES(item.rate)} Bs`;
                  }
                }

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.rateCard,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                      isSelected && { backgroundColor: theme.buttonPrimaryBg, borderColor: theme.buttonPrimaryBg },
                    ]}
                    onPress={() => {
                      onSelectCurrency(item.id);
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.rateCardLeft}>
                      <Text
                        style={[
                          styles.rateTitle,
                          { color: theme.textPrimary },
                          isSelected && { color: theme.buttonPrimaryText },
                        ]}
                      >
                        {item.title}
                      </Text>
                      {isSelected ? (
                        <Text
                          style={[
                            styles.inCalculatorLabel,
                            isSelected && { color: theme.buttonPrimaryText, opacity: 0.75 },
                          ]}
                        >
                          En calculadora
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.rateCardRight}>
                      <View style={styles.priceRow}>
                        <ArrowUp
                          size={14}
                          color={isSelected ? theme.buttonPrimaryText : theme.accentGreen}
                          strokeWidth={2}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.priceValue,
                            { color: theme.textPrimary },
                            isSelected && { color: theme.buttonPrimaryText },
                          ]}
                        >
                          {displayPrice}
                        </Text>
                      </View>

                      {hasCustomComparison ? (
                        <Text
                          style={[
                            styles.variationText,
                            { color: theme.textMuted },
                            isSelected && { color: theme.buttonPrimaryText, opacity: 0.85 },
                          ]}
                        >
                          {displaySubText}
                        </Text>
                      ) : item.isCustom ? (
                        <TouchableOpacity
                          style={styles.editCustomButton}
                          onPress={onOpenCustomRate}
                        >
                          <Edit3 size={13} color={isSelected ? theme.buttonPrimaryText : theme.textMuted} />
                          <Text
                            style={[
                              styles.editCustomText,
                              { color: theme.textMuted },
                              isSelected && { color: theme.buttonPrimaryText },
                            ]}
                          >
                            Modificar
                          </Text>
                        </TouchableOpacity>
                      ) : item.variationPct !== undefined ? (
                        <Text
                          style={[
                            styles.variationText,
                            { color: theme.accentGreen },
                            isSelected && { color: theme.buttonPrimaryText, opacity: 0.85 },
                          ]}
                        >
                          +{item.variationPct}% (+{formatVES(item.variationAmount || 0)} Bs)
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Botones de acción inferiores: Cerrar y Compartir */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>Cerrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: theme.buttonPrimaryBg }]}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={18} color={theme.buttonPrimaryText} style={{ marginRight: 8 }} />
              <Text style={[styles.shareButtonText, { color: theme.buttonPrimaryText }]}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropTouchArea: {
    flex: 1,
    width: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 46,
    maxHeight: '88%',
    zIndex: 10,
    elevation: 10,
  },
  dragZone: {
    paddingTop: 12,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 52,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollArea: {
    marginBottom: 16,
  },
  brechaCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  brechaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brechaLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  brechaValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  brechaIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratesList: {
    gap: 10,
  },
  rateCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  rateCardLeft: {
    justifyContent: 'center',
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  inCalculatorLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  rateCardRight: {
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  variationText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  editCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  editCustomText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    marginBottom: 4,
  },
  closeButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
