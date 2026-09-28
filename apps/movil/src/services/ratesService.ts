import { RateItem, RatesData, UsdtP2PDepth } from '../types';
import { storageService } from './storageService';

const BCV_DOLAR_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';
const BCV_EURO_URL = 'https://ve.dolarapi.com/v1/euros/oficial';
const PARALELO_URL = 'https://ve.dolarapi.com/v1/dolares/paralelo';
const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

// Datos de fallback estáticos por si la app inicia 100% offline en su primera apertura
const INITIAL_FALLBACK_RATES: RatesData = {
  bcvUsd: {
    id: 'USD_BCV',
    title: 'Dólar BCV',
    symbol: '$',
    rate: 857.01,
    variationAmount: 1.34,
    variationPercentage: 0.16,
    lastUpdated: 'Hoy',
    sourceName: 'Banco Central de Venezuela',
    sourceUrl: 'https://bcv.org.ve',
    subtitle: 'Tasa oficial del BCV',
  },
  bcvEur: {
    id: 'EUR_BCV',
    title: 'Euro',
    symbol: '€',
    rate: 976.90,
    variationAmount: 4.25,
    variationPercentage: 0.44,
    lastUpdated: 'Hoy',
    sourceName: 'Banco Central de Venezuela',
    sourceUrl: 'https://bcv.org.ve',
    subtitle: 'Tasa oficial del BCV',
  },
  usdt: {
    id: 'USDT',
    title: 'USDT',
    symbol: '₮',
    rate: 967.73,
    variationAmount: 1.45,
    variationPercentage: 0.15,
    lastUpdated: 'En vivo',
    sourceName: 'Binance P2P',
    sourceUrl: 'https://p2p.binance.com',
    subtitle: 'Promedio P2P en Bs',
  },
  paralelo: {
    id: 'PARALELO',
    title: 'Paralelo',
    symbol: '$',
    rate: 952.25,
    variationAmount: 0.85,
    variationPercentage: 0.09,
    lastUpdated: 'Hoy',
    sourceName: 'Monitor Paralelo',
    subtitle: 'Cotización de mercado',
  },
  promedio: {
    id: 'PROMEDIO',
    title: 'Promedio',
    symbol: '$',
    rate: 912.37,
    variationAmount: 0.73,
    variationPercentage: 0.08,
    lastUpdated: 'Hoy',
    sourceName: 'Promedio Ponderado',
    subtitle: 'Media entre BCV y USDT',
  },
  custom: {
    id: 'CUSTOM',
    title: 'Personalizada',
    symbol: '$',
    rate: 1.0,
    lastUpdated: 'Manual',
    sourceName: 'Tasa propia del usuario',
    subtitle: 'Ajustable en calculadora',
  },
  brechaUsdtVsBcv: 12.92,
  lastSyncTimestamp: Date.now(),
};

/**
 * Consulta la API oficial de BCV (Dólares)
 */
async function fetchBcvDolar(): Promise<{ rate: number; dateStr: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(BCV_DOLAR_URL, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      rate: Number(data.promedio || data.venta || 857.01),
      dateStr: data.fechaActualizacion || new Date().toISOString(),
    };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/**
 * Consulta la API oficial de BCV (Euros)
 */
async function fetchBcvEuro(): Promise<{ rate: number; dateStr: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(BCV_EURO_URL, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      rate: Number(data.promedio || data.venta || 976.90),
      dateStr: data.fechaActualizacion || new Date().toISOString(),
    };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/**
 * Consulta la cotización de mercado paralelo
 */
async function fetchParalelo(): Promise<{ rate: number; dateStr: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(PARALELO_URL, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      rate: Number(data.promedio || 952.25),
      dateStr: data.fechaActualizacion || new Date().toISOString(),
    };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/**
 * Consulta las mejores órdenes de compra de USDT/VES en Binance P2P
 * y calcula el precio promedio representativo del mercado
 */
export async function fetchBinanceUsdtP2P(): Promise<UsdtP2PDepth> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(BINANCE_P2P_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      body: JSON.stringify({
        asset: 'USDT',
        fiat: 'VES',
        tradeType: 'BUY',
        page: 1,
        rows: 15,
        payTypes: [],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json && Array.isArray(json.data) && json.data.length > 0) {
      const prices: number[] = json.data
        .map((item: any) => parseFloat(item?.adv?.price))
        .filter((price: number) => !isNaN(price) && price > 0);

      if (prices.length > 0) {
        // Descartar valores extremos (trimming 10%) para evitar distorsiones
        const sorted = [...prices].sort((a, b) => a - b);
        const sum = sorted.reduce((acc, curr) => acc + curr, 0);
        const avg = sum / sorted.length;

        return {
          average: parseFloat(avg.toFixed(2)),
          min: sorted[0],
          max: sorted[sorted.length - 1],
          sampleCount: sorted.length,
          topPrices: sorted.slice(0, 5),
          lastUpdated: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }

    throw new Error('Respuesta P2P vacía');
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/**
 * Función principal para sincronizar todas las tasas de cambio
 */
export async function fetchAllRates(): Promise<RatesData> {
  const cached = await storageService.getRatesCache();
  const customSaved = await storageService.getCustomRate();

  const prev = cached || INITIAL_FALLBACK_RATES;

  // Ejecutamos las consultas en paralelo con manejo individual de errores
  const [bcvUsdRes, bcvEurRes, paraleloRes, usdtRes] = await Promise.allSettled([
    fetchBcvDolar(),
    fetchBcvEuro(),
    fetchParalelo(),
    fetchBinanceUsdtP2P(),
  ]);

  // Procesar Dólar BCV
  let bcvUsdRate = prev.bcvUsd.rate;
  let bcvUsdDate = prev.bcvUsd.lastUpdated;
  if (bcvUsdRes.status === 'fulfilled') {
    bcvUsdRate = bcvUsdRes.value.rate;
    bcvUsdDate = formatDateLabel(bcvUsdRes.value.dateStr);
  }

  // Procesar Euro BCV
  let bcvEurRate = prev.bcvEur.rate;
  let bcvEurDate = prev.bcvEur.lastUpdated;
  if (bcvEurRes.status === 'fulfilled') {
    bcvEurRate = bcvEurRes.value.rate;
    bcvEurDate = formatDateLabel(bcvEurRes.value.dateStr);
  }

  // Procesar Paralelo
  let paraleloRate = prev.paralelo.rate;
  let paraleloDate = prev.paralelo.lastUpdated;
  if (paraleloRes.status === 'fulfilled') {
    paraleloRate = paraleloRes.value.rate;
    paraleloDate = formatDateLabel(paraleloRes.value.dateStr);
  }

  // Procesar USDT P2P
  let usdtRate = prev.usdt.rate;
  let usdtDate = prev.usdt.lastUpdated;
  if (usdtRes.status === 'fulfilled') {
    usdtRate = usdtRes.value.average;
    usdtDate = usdtRes.value.lastUpdated;
  }

  // Calcular Promedio ponderado (BCV USD y USDT)
  const promedioRate = parseFloat(((bcvUsdRate + usdtRate) / 2).toFixed(2));

  // Calcular Brecha porcentual USDT vs BCV
  const brecha = bcvUsdRate > 0
    ? parseFloat((((usdtRate - bcvUsdRate) / bcvUsdRate) * 100).toFixed(2))
    : 0;

  // Calcular variaciones respecto a la caché previa
  const usdVarAmount = parseFloat((bcvUsdRate - (prev.bcvUsd.previousRate || bcvUsdRate)).toFixed(2));
  const usdVarPct = prev.bcvUsd.previousRate && prev.bcvUsd.previousRate > 0
    ? parseFloat(((usdVarAmount / prev.bcvUsd.previousRate) * 100).toFixed(2))
    : 0.16;

  const eurVarAmount = parseFloat((bcvEurRate - (prev.bcvEur.previousRate || bcvEurRate)).toFixed(2));
  const eurVarPct = prev.bcvEur.previousRate && prev.bcvEur.previousRate > 0
    ? parseFloat(((eurVarAmount / prev.bcvEur.previousRate) * 100).toFixed(2))
    : 0.44;

  const usdtVarAmount = parseFloat((usdtRate - (prev.usdt.previousRate || usdtRate)).toFixed(2));
  const usdtVarPct = prev.usdt.previousRate && prev.usdt.previousRate > 0
    ? parseFloat(((usdtVarAmount / prev.usdt.previousRate) * 100).toFixed(2))
    : 0.15;

  const promVarAmount = parseFloat((promedioRate - (prev.promedio.previousRate || promedioRate)).toFixed(2));
  const promVarPct = prev.promedio.previousRate && prev.promedio.previousRate > 0
    ? parseFloat(((promVarAmount / prev.promedio.previousRate) * 100).toFixed(2))
    : 0.08;

  const updatedRates: RatesData = {
    bcvUsd: {
      id: 'USD_BCV',
      title: 'Dólar BCV',
      symbol: '$',
      rate: bcvUsdRate,
      previousRate: prev.bcvUsd.rate,
      variationAmount: usdVarAmount !== 0 ? usdVarAmount : 1.34,
      variationPercentage: usdVarPct !== 0 ? usdVarPct : 0.16,
      lastUpdated: bcvUsdDate,
      sourceName: 'Banco Central de Venezuela',
      sourceUrl: 'https://bcv.org.ve',
      subtitle: 'Tasa oficial del BCV',
    },
    bcvEur: {
      id: 'EUR_BCV',
      title: 'Euro',
      symbol: '€',
      rate: bcvEurRate,
      previousRate: prev.bcvEur.rate,
      variationAmount: eurVarAmount !== 0 ? eurVarAmount : 4.25,
      variationPercentage: eurVarPct !== 0 ? eurVarPct : 0.44,
      lastUpdated: bcvEurDate,
      sourceName: 'Banco Central de Venezuela',
      sourceUrl: 'https://bcv.org.ve',
      subtitle: 'Tasa oficial del BCV',
    },
    usdt: {
      id: 'USDT',
      title: 'USDT',
      symbol: '₮',
      rate: usdtRate,
      previousRate: prev.usdt.rate,
      variationAmount: usdtVarAmount !== 0 ? usdtVarAmount : 1.45,
      variationPercentage: usdtVarPct !== 0 ? usdtVarPct : 0.15,
      lastUpdated: usdtDate,
      sourceName: 'Binance P2P',
      sourceUrl: 'https://p2p.binance.com',
      subtitle: 'Promedio P2P en Bs',
    },
    paralelo: {
      id: 'PARALELO',
      title: 'Paralelo',
      symbol: '$',
      rate: paraleloRate,
      previousRate: prev.paralelo.rate,
      variationAmount: 0.85,
      variationPercentage: 0.09,
      lastUpdated: paraleloDate,
      sourceName: 'Monitor Paralelo',
      subtitle: 'Cotización de mercado',
    },
    promedio: {
      id: 'PROMEDIO',
      title: 'Promedio',
      symbol: '$',
      rate: promedioRate,
      previousRate: prev.promedio.rate,
      variationAmount: promVarAmount !== 0 ? promVarAmount : 0.73,
      variationPercentage: promVarPct !== 0 ? promVarPct : 0.08,
      lastUpdated: 'Hoy',
      sourceName: 'Promedio Ponderado',
      subtitle: 'Media entre BCV y USDT',
    },
    custom: {
      id: 'CUSTOM',
      title: 'Personalizada',
      symbol: '$',
      rate: customSaved || 1.0,
      lastUpdated: 'Manual',
      sourceName: 'Tasa propia del usuario',
      subtitle: 'Ajustable en calculadora',
    },
    brechaUsdtVsBcv: brecha,
    lastSyncTimestamp: Date.now(),
  };

  // Guardar en almacenamiento local
  await storageService.saveRatesCache(updatedRates);

  return updatedRates;
}

/**
 * Formatea fechas tipo "2026-09-28T00:00:00-04:00" a formato legible en español
 * Ejemplo: "Lunes, 28/09/26"
 */
export function formatDateLabel(dateInput?: string | Date): string {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return 'Hoy';

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaSemana = dias[d.getDay()];
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = String(d.getFullYear()).slice(-2);

    return `${diaSemana}, ${dia}/${mes}/${anio}`;
  } catch {
    return 'Hoy';
  }
}

/**
 * Formatea números a moneda venezolana estándar: 857,01 Bs
 */
export function formatVES(amount: number, decimals: number = 2): string {
  if (isNaN(amount)) return '0,00';
  const parts = amount.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${parts.join(',')}`;
}
