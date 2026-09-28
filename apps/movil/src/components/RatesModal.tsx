import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { RefreshCw, ArrowUp, Share2, X, Edit3 } from 'lucide-react-native';
import { RatesData, CurrencyType } from '../types';
import { formatVES } from '../services/ratesService';
import { THEME } from '../constants/theme';

interface RatesModalProps {
  visible: boolean;
  onClose: () => void;
  rates: RatesData;
  selectedCurrency: CurrencyType;
  onSelectCurrency: (currency: CurrencyType) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onOpenCustomRate: () => void;
}

export const RatesModal: React.FC<RatesModalProps> = ({
  visible,
  onClose,
  rates,
  selectedCurrency,
  onSelectCurrency,
  onRefresh,
  isRefreshing,
  onOpenCustomRate,
}) => {
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
        `📱 App Monitor Móvil`;

      await Share.share({ message });
    } catch (e) {
      console.warn('Error al compartir tasas:', e);
    }
  };

  const rateItems = [
    {
      id: 'USD_BCV' as CurrencyType,
      title: 'Dólar BCV',
      rate: rates.bcvUsd.rate,
      variationPct: rates.bcvUsd.variationPercentage,
      variationAmount: rates.bcvUsd.variationAmount,
    },
    {
      id: 'EUR_BCV' as CurrencyType,
      title: 'Euro',
      rate: rates.bcvEur.rate,
      variationPct: rates.bcvEur.variationPercentage,
      variationAmount: rates.bcvEur.variationAmount,
    },
    {
      id: 'PROMEDIO' as CurrencyType,
      title: 'Promedio',
      rate: rates.promedio.rate,
      variationPct: rates.promedio.variationPercentage,
      variationAmount: rates.promedio.variationAmount,
    },
    {
      id: 'USDT' as CurrencyType,
      title: 'USDT',
      rate: rates.usdt.rate,
      variationPct: rates.usdt.variationPercentage,
      variationAmount: rates.usdt.variationAmount,
    },
    {
      id: 'CUSTOM' as CurrencyType,
      title: 'Personalizada',
      rate: rates.custom.rate,
      isCustom: true,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Manija superior para arrastre */}
          <View style={styles.dragHandle} />

          {/* Header del modal */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Monedas</Text>
              <Text style={styles.subtitle}>{rates.bcvUsd.lastUpdated}, 10:00 AM</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={isRefreshing}
              activeOpacity={0.7}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <RefreshCw size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Tarjeta de Brecha Cambiaria ($/USDT) */}
            <View style={styles.brechaCard}>
              <View style={styles.brechaLeft}>
                <Text style={styles.brechaLabel}>Brecha ($/USDT):</Text>
                <Text style={styles.brechaValue}>{rates.brechaUsdtVsBcv.toFixed(2)}%</Text>
              </View>
              <View style={styles.brechaIconBadge}>
                <ArrowUp size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>

            {/* Lista de Tasas */}
            <View style={styles.ratesList}>
              {rateItems.map((item) => {
                const isSelected = selectedCurrency === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.rateCard,
                      isSelected && styles.rateCardSelected,
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
                          isSelected && styles.rateTitleSelected,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {isSelected ? (
                        <Text
                          style={[
                            styles.inCalculatorLabel,
                            isSelected && styles.inCalculatorLabelSelected,
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
                          color={isSelected ? '#000000' : '#FFFFFF'}
                          strokeWidth={2}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.priceValue,
                            isSelected && styles.priceValueSelected,
                          ]}
                        >
                          {formatVES(item.rate)} Bs
                        </Text>
                      </View>

                      {item.isCustom ? (
                        <TouchableOpacity
                          style={styles.editCustomButton}
                          onPress={onOpenCustomRate}
                        >
                          <Edit3 size={13} color={isSelected ? '#000000' : '#888888'} />
                          <Text
                            style={[
                              styles.editCustomText,
                              isSelected && { color: '#000000' },
                            ]}
                          >
                            Modificar
                          </Text>
                        </TouchableOpacity>
                      ) : item.variationPct !== undefined ? (
                        <Text
                          style={[
                            styles.variationText,
                            isSelected && styles.variationTextSelected,
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

          {/* Botones de acción inferiores */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareButtonText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.colors.modalBackdrop,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#444444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#383838',
  },
  scrollArea: {
    marginBottom: 16,
  },
  brechaCard: {
    backgroundColor: '#222222',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#333333',
  },
  brechaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brechaLabel: {
    color: '#CCCCCC',
    fontSize: 15,
    fontWeight: '500',
  },
  brechaValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  brechaIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratesList: {
    gap: 10,
  },
  rateCard: {
    backgroundColor: '#222222',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  rateCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  rateCardLeft: {
    justifyContent: 'center',
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rateTitleSelected: {
    color: '#000000',
  },
  inCalculatorLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  inCalculatorLabelSelected: {
    color: '#444444',
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
    color: '#FFFFFF',
  },
  priceValueSelected: {
    color: '#000000',
  },
  variationText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  variationTextSelected: {
    color: '#333333',
  },
  editCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  editCustomText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  closeButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#383838',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
