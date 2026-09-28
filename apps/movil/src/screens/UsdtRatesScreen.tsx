import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { ArrowLeft, ExternalLink, Coins, ArrowUp } from 'lucide-react-native';
import { RatesData } from '../types';
import { formatVES } from '../services/ratesService';
import { ThemeColors } from '../constants/theme';

interface UsdtRatesScreenProps {
  rates: RatesData;
  theme: ThemeColors;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export const UsdtRatesScreen: React.FC<UsdtRatesScreenProps> = ({
  rates,
  theme,
  onBack,
  onRefresh,
  isRefreshing = false,
}) => {
  const [usdtInput, setUsdtInput] = useState('10');
  const parsedUsdt = parseFloat(usdtInput) || 0;
  const totalVES = parsedUsdt * rates.usdt.rate;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={true}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.accentGreen}
            colors={[theme.accentGreen]}
            progressBackgroundColor={theme.surface}
          />
        ) : undefined
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Tasas USDT (Binance P2P)</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.badgeRow, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
        <Coins size={16} color={theme.accentGreen} />
        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
          Promedio Ponderado Peer-to-Peer (VES)
        </Text>
      </View>

      {/* Tarjeta Principal de Cotización USDT */}
      <View style={[styles.mainCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Precio Promedio USDT:</Text>
        <Text style={[styles.price, { color: theme.textPrimary }]}>
          {formatVES(rates.usdt.rate)} Bs
        </Text>

        <View style={[styles.metricsRow, { borderColor: theme.border }]}>
          <View style={styles.metricBox}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Brecha vs BCV:</Text>
            <View style={styles.metricValueRow}>
              <ArrowUp size={14} color={theme.accentGreen} />
              <Text style={[styles.metricValue, { color: theme.accentGreen }]}>
                +{rates.brechaUsdtVsBcv.toFixed(2)}%
              </Text>
            </View>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Variación 24h:</Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              +{formatVES(rates.usdt.variationAmount || 1.45)} Bs (+{rates.usdt.variationPercentage}%)
            </Text>
          </View>
        </View>
      </View>

      {/* Calculadora Rápida USDT -> Bs (Corregido: USDT nunca se sale de la caja) */}
      <View style={[styles.calcCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.calcTitle, { color: theme.textPrimary }]}>Calculadora Rápida P2P</Text>

        <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <Text style={[styles.inputPrefix, { color: theme.textMuted }]}>₮</Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.textPrimary },
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
            ]}
            value={usdtInput}
            onChangeText={setUsdtInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.textMuted}
          />
          <View style={styles.suffixWrapper}>
            <Text style={[styles.inputSuffix, { color: theme.textPrimary }]}>USDT</Text>
          </View>
        </View>

        <View style={[styles.resultBox, { backgroundColor: theme.surfaceSubtle }]}>
          <Text style={[styles.resultLabel, { color: theme.textMuted }]}>Equivalente en Bolívares:</Text>
          <Text style={[styles.resultValue, { color: theme.textPrimary }]}>
            {formatVES(totalVES)} Bs
          </Text>
        </View>
      </View>

      {/* Resumen del Mercado */}
      <View style={[styles.infoCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
        <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>Metodología de Cálculo P2P</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          El precio promedio de Tether (USDT) se calcula muestreando directamente las órdenes comerciales activas del par USDT/VES en Venezuela, descartando precios atípicos para reflejar fielmente la oferta y demanda de mercado.
        </Text>
      </View>

      {/* Enlace a Binance P2P */}
      <TouchableOpacity
        style={[styles.binanceLink, { backgroundColor: theme.buttonPrimaryBg }]}
        onPress={() => Linking.openURL('https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES')}
        activeOpacity={0.8}
      >
        <Text style={[styles.binanceLinkText, { color: theme.buttonPrimaryText }]}>
          Ver mercado en Binance P2P
        </Text>
        <ExternalLink size={16} color={theme.buttonPrimaryText} />
      </TouchableOpacity>
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  price: {
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  metricBox: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  calcCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  calcTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
    overflow: 'hidden',
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '700',
    padding: 0,
    margin: 0,
  },
  suffixWrapper: {
    marginLeft: 8,
    flexShrink: 0,
  },
  inputSuffix: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resultBox: {
    padding: 14,
    borderRadius: 12,
  },
  resultLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  binanceLink: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  binanceLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
