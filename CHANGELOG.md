# Changelog

Todas las modificaciones notables a este proyecto serán documentadas en este archivo según el estándar [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-09-28 (Lanzamiento Inicial: APP-MONITOR — Monitor Cambiario BCV y USDT)

### Arquitectura & Frontend Móvil (React Native / TypeScript)
- **Consumo Directo de APIs (Zero Backend)**:
  - Integración nativa con la API oficial del Banco Central de Venezuela (BCV) para cotizaciones en tiempo real de Dólar (USD) y Euro (EUR).
  - Consulta en tiempo real de libro de órdenes Binance P2P (`p2p.binance.com`) para el cálculo automatizado del promedio comercial de Tether (USDT) en Bolívares (VES).
  - Cálculo instantáneo de **Brecha Cambiaria**: indicador porcentual diferencial entre el Dólar oficial BCV y el promedio USDT.
  - Almacenamiento persistente sin conexión con `@react-native-async-storage/async-storage` para garantizar carga instantánea offline.
- **Diseño Estricto Monocromático (Black & White)**:
  - Interfaz visual basada fielmente en las capturas de referencia del monitor de cambio, adaptada a un tema 100% monocromático sin colores (blanco, escala de grises y negro azabache).
  - Logotipo vectorial SVG circular (`MonochromeLogo.tsx`): 3 segmentos arqueados con gradación tonal en escala de grises, símbolo de divisa `$` central en alto contraste y flechas bidireccionales verticales.
  - Calculadora interactiva bidireccional en pantalla principal: conversión reactiva inmediata Divisa ⇄ Bolívares (VES) con botón de copiado al portapapeles.
  - Píldora selectora de tasas y fecha oficial BCV.
- **Módulo de Tasas y Monedas (`RatesModal.tsx`)**:
  - Modal tipo Bottom Sheet desplegable con cotizaciones detalladas: Dólar BCV, Euro, Promedio, USDT Binance P2P, Monitor Paralelo y Tasa Personalizada.
  - Indicador de estado "En calculadora" para la tasa actualmente activa.
  - Opción para compartir el boletín diario de tasas a WhatsApp, Telegram y redes sociales.
- **Módulo de Perfiles de Pago (`PaymentProfilesModal.tsx`)**:
  - Guardado local de datos bancarios para transacciones rápidas: Pago Móvil (banco, cédula, teléfono), Zelle (correo y titular) y Binance Pay (Pay ID).
  - Copiado en un solo toque para agilizar cobros y pagos comerciales.
- **Escáner de Precios (`ScannerModal.tsx`)**:
  - Visor interactivo para escaneo o fijación rápida de precios en dólares y conversión instantánea a Bolívares según la tasa seleccionada.

### Canal de Despliegue y Distribución Automática (CI/CD & Cloudflare R2)
- **Workflow de GitHub Actions (`.github/workflows/build-mobile.yml`)**:
  - Compilación automatizada de APK de producción mediante EAS Build (`--local --profile github`) al publicar un GitHub Release.
  - Inyección dinámica de versión SemVer (`vX.Y.Z`) en `app.json` y `package.json`.
  - Generación de manifiesto `latest-mobile.json` con hash, fecha ISO, notas de versión y peso del instalador.
  - Despliegue directo al bucket de Cloudflare R2 con credenciales S3 compatibles.
  - Política de retención automática: mantiene en Cloudflare R2 las últimas 2 versiones activas y purga compilaciones antiguas.
  - Adjunto automático de artefactos APK y manifiesto al Release oficial de GitHub.
- **Sistema de Auto-Actualizaciones Integrado (`updater.ts` & `UpdateModal.tsx`)**:
  - Verificación en segundo plano al abrir la aplicación contra el manifiesto `latest-mobile.json` de Cloudflare R2.
  - Comparador SemVer estricto (`compareSemVer`).
  - Modal con barra de progreso de descarga y disparador nativo de instalación APK mediante `expo-intent-launcher`.
