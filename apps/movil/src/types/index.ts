export type CurrencyType = 'USD_BCV' | 'EUR_BCV' | 'PROMEDIO' | 'USDT' | 'PARALELO' | 'CUSTOM';

export interface RateItem {
  id: CurrencyType;
  title: string;
  symbol: string;
  rate: number; // in VES
  previousRate?: number;
  variationAmount?: number;
  variationPercentage?: number;
  lastUpdated: string;
  sourceName: string;
  sourceUrl?: string;
  subtitle?: string;
}

export interface RatesData {
  bcvUsd: RateItem;
  bcvEur: RateItem;
  usdt: RateItem;
  paralelo: RateItem;
  promedio: RateItem;
  custom: RateItem;
  brechaUsdtVsBcv: number; // percentage difference
  lastSyncTimestamp: number;
}

export interface UsdtP2PDepth {
  average: number;
  min: number;
  max: number;
  sampleCount: number;
  topPrices: number[];
  lastUpdated: string;
}

export interface PaymentProfile {
  id: string;
  tipo: 'PAGO_MOVIL' | 'TRANSFERENCIA' | 'ZELLE' | 'BINANCE_PAY';
  titular: string;
  identificacion: string; // CI o RIF
  telefono?: string;
  banco?: string;
  correo?: string;
  binancePayId?: string;
}

export interface AppSettings {
  autoRefresh: boolean;
  refreshIntervalMinutes: number;
  hapticFeedback: boolean;
  showParalelo: boolean;
  decimalPlaces: number;
}
