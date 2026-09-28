import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { ArrowLeft, ExternalLink, Coins, ArrowUp, ArrowDown } from 'lucide-react-native';
import { RatesData } from '../types';
import { formatVES } from '../services/ratesService';

interface UsdtRatesScreenProps {
  rates: RatesData;
  onBack: () => void;
}

export const UsdtRatesScreen: React.FC<UsdtRatesScreenProps> = ({ rates, onBack }) => {
  const [usdtInput, setUsdtInput] = useState('10');
  const parsedUsdt = parseFloat(usdtInput) || 0;
  const totalVES = parsedUsdt * rates.usdt.rate;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Tasas USDT (Binance P2P)</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.badgeRow}>
        <Coins size={16} color="#FFFFFF" />
        <Text style={styles.badgeText}>Promedio Ponderado Peer-to-Peer (VES)</Text>
      </View>

      {/* Tarjeta Principal de Cotización USDT */}
      <View style={styles.mainCard}>
        <Text style={styles.label}>Precio Promedio USDT:</Text>
        <Text style={styles.price}>{formatVES(rates.usdt.rate)} Bs</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Brecha vs BCV:</Text>
            <View style={styles.metricValueRow}>
              <ArrowUp size={14} color="#FFFFFF" />
              <Text style={styles.metricValue}>+{rates.brechaUsdtVsBcv.toFixed(2)}%</Text>
            </View>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Variación 24h:</Text>
            <Text style={styles.metricValue}>
              +{formatVES(rates.usdt.variationAmount || 1.45)} Bs (+{rates.usdt.variationPercentage}%)
            </Text>
          </View>
        </View>
      </View>

      {/* Calculadora Rápida USDT -> Bs */}
      <View style={styles.calcCard}>
        <Text style={styles.calcTitle}>Calculadora Rápida P2P</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputPrefix}>₮</Text>
          <TextInput
            style={styles.input}
            value={usdtInput}
            onChangeText={setUsdtInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#666666"
          />
          <Text style={styles.inputSuffix}>USDT</Text>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Equivalente en Bolívares:</Text>
          <Text style={styles.resultValue}>{formatVES(totalVES)} Bs</Text>
        </View>
      </View>

      {/* Resumen del Mercado */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Metodología de Cálculo P2P</Text>
        <Text style={styles.infoText}>
          El precio promedio de Tether (USDT) se calcula muestreando directamente las órdenes activas del libro comercial P2P en Venezuela, descartando precios atípicos para reflejar el valor real de compra y venta.
        </Text>
      </View>

      {/* Enlace a Binance P2P */}
      <TouchableOpacity
        style={styles.binanceLink}
        onPress={() => Linking.openURL('https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES')}
      >
        <Text style={styles.binanceLinkText}>Ver mercado en Binance P2P</Text>
        <ExternalLink size={16} color="#000000" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1C1C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  badgeText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 4,
  },
  price: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#262626',
    paddingTop: 14,
  },
  metricBox: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888888',
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
    color: '#FFFFFF',
  },
  calcCard: {
    backgroundColor: '#181818',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 16,
  },
  calcTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 12,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: '#888888',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputSuffix: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888888',
  },
  resultBox: {
    backgroundColor: '#242424',
    padding: 14,
    borderRadius: 12,
  },
  resultLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 18,
  },
  binanceLink: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  binanceLinkText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});
