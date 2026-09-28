import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { ArrowLeft, ExternalLink, ShieldCheck, TrendingUp, Calendar } from 'lucide-react-native';
import { RatesData } from '../types';
import { formatVES } from '../services/ratesService';

interface BcvRatesScreenProps {
  rates: RatesData;
  onBack: () => void;
}

export const BcvRatesScreen: React.FC<BcvRatesScreenProps> = ({ rates, onBack }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Tasas Oficiales BCV</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.badgeRow}>
        <ShieldCheck size={16} color="#FFFFFF" />
        <Text style={styles.badgeText}>Banco Central de Venezuela (Oficial)</Text>
      </View>

      {/* Tarjeta Dólar BCV */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.currencyTitle}>Dólar Estadounidense (USD)</Text>
          <Text style={styles.currencyCode}>USD / VES</Text>
        </View>

        <Text style={styles.price}>{formatVES(rates.bcvUsd.rate, 4)} Bs</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Variación:</Text>
            <Text style={styles.detailValue}>
              +{formatVES(rates.bcvUsd.variationAmount || 1.34)} Bs (+{rates.bcvUsd.variationPercentage}%)
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fecha Valor:</Text>
            <Text style={styles.detailValue}>{rates.bcvUsd.lastUpdated}</Text>
          </View>
        </View>
      </View>

      {/* Tarjeta Euro BCV */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.currencyTitle}>Euro (EUR)</Text>
          <Text style={styles.currencyCode}>EUR / VES</Text>
        </View>

        <Text style={styles.price}>{formatVES(rates.bcvEur.rate, 4)} Bs</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Variación:</Text>
            <Text style={styles.detailValue}>
              +{formatVES(rates.bcvEur.variationAmount || 4.25)} Bs (+{rates.bcvEur.variationPercentage}%)
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fecha Valor:</Text>
            <Text style={styles.detailValue}>{rates.bcvEur.lastUpdated}</Text>
          </View>
        </View>
      </View>

      {/* Información Legal y Tributaria SENIAT */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Validez Jurídica y Facturación</Text>
        <Text style={styles.infoText}>
          De conformidad con la normativa cambiaria y tributaria de la República Bolivariana de Venezuela, las operaciones de facturación y pagos en divisas deben calcularse con base en la tasa oficial vigente publicada por el BCV.
        </Text>
      </View>

      {/* Enlace al sitio web del BCV */}
      <TouchableOpacity
        style={styles.bcvLink}
        onPress={() => Linking.openURL('https://www.bcv.org.ve')}
      >
        <Text style={styles.bcvLinkText}>Consultar portal web bcv.org.ve</Text>
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
  card: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888888',
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#262626',
    paddingTop: 14,
  },
  detailItem: {},
  detailLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
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
  bcvLink: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bcvLinkText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});
