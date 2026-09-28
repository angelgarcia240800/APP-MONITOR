import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  RefreshControl,
} from 'react-native';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react-native';
import { RatesData } from '../types';
import { formatVES } from '../services/ratesService';
import { ThemeColors } from '../constants/theme';

interface BcvRatesScreenProps {
  rates: RatesData;
  theme: ThemeColors;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export const BcvRatesScreen: React.FC<BcvRatesScreenProps> = ({
  rates,
  theme,
  onBack,
  onRefresh,
  isRefreshing = false,
}) => {
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>Tasas Oficiales BCV</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.badgeRow, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
        <ShieldCheck size={16} color={theme.accentGreen} />
        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
          Banco Central de Venezuela (Oficial)
        </Text>
      </View>

      {/* Tarjeta Dólar BCV */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.currencyTitle, { color: theme.textPrimary }]}>
            Dólar Estadounidense (USD)
          </Text>
          <Text style={[styles.currencyCode, { color: theme.textMuted }]}>USD / VES</Text>
        </View>

        <Text style={[styles.price, { color: theme.textPrimary }]}>
          {formatVES(rates.bcvUsd.rate, 4)} Bs
        </Text>

        <View style={[styles.detailsRow, { borderColor: theme.border }]}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Variación:</Text>
            <Text style={[styles.detailValue, { color: theme.accentGreen }]}>
              +{formatVES(rates.bcvUsd.variationAmount || 1.34)} Bs (+{rates.bcvUsd.variationPercentage}%)
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Fecha Valor:</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{rates.bcvUsd.lastUpdated}</Text>
          </View>
        </View>
      </View>

      {/* Tarjeta Euro BCV */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.currencyTitle, { color: theme.textPrimary }]}>Euro (EUR)</Text>
          <Text style={[styles.currencyCode, { color: theme.textMuted }]}>EUR / VES</Text>
        </View>

        <Text style={[styles.price, { color: theme.textPrimary }]}>
          {formatVES(rates.bcvEur.rate, 4)} Bs
        </Text>

        <View style={[styles.detailsRow, { borderColor: theme.border }]}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Variación:</Text>
            <Text style={[styles.detailValue, { color: theme.accentGreen }]}>
              +{formatVES(rates.bcvEur.variationAmount || 4.25)} Bs (+{rates.bcvEur.variationPercentage}%)
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Fecha Valor:</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{rates.bcvEur.lastUpdated}</Text>
          </View>
        </View>
      </View>

      {/* Información Legal y Facturación SENIAT */}
      <View style={[styles.infoCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
        <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>Validez Jurídica y Facturación</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          De conformidad con la normativa cambiaria y tributaria de la República Bolivariana de Venezuela, las operaciones de facturación comercial y cobros deben calcularse con base en la tasa oficial vigente publicada por el BCV.
        </Text>
      </View>

      {/* Enlace al sitio web del BCV */}
      <TouchableOpacity
        style={[styles.bcvLink, { backgroundColor: theme.buttonPrimaryBg }]}
        onPress={() => Linking.openURL('https://www.bcv.org.ve')}
        activeOpacity={0.8}
      >
        <Text style={[styles.bcvLinkText, { color: theme.buttonPrimaryText }]}>
          Consultar portal oficial bcv.org.ve
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
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
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
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: '700',
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  detailItem: {},
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
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
  bcvLink: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bcvLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
