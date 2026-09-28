# Changelog

Todas las modificaciones notables a este proyecto serán documentadas en este archivo según el estándar [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-09-28 (Logos Oficiales con Flechas Verdes, Modo Claro/Oscuro/Auto, Calendario Histórico, Toast y Correcciones de Layout)

### Nuevas Características & Mejoras Visuales
- **Nuevos Logotipos Oficiales con Flechas Verdes**:
  - Incorporadas las imágenes originales de `C:\Proyectos\LOGOS` (`app-monito-oscuro.jfif` y `app-monito-claro.jfif`) convertidas a PNG en `apps/movil/assets/`.
  - Flechas verticales en color verde esmeralda brillante (`#22C55E` / `#16A34A`), manteniendo el contraste sobre fondos oscuros y claros.
  - Creación del componente `AppLogo.tsx` que alterna automáticamente entre la versión oscura y clara según el tema activo.
- **Soporte de 3 Modos de Apariencia**:
  - Modo Oscuro, Modo Claro y Automático (sincronizado con el sistema operativo del teléfono mediante `useColorScheme`).
  - Selector interactivo incorporado en la pantalla de **Configuración** con persistencia en `AsyncStorage`.
- **Pantalla de Mini Carga de Inicio (`SplashScreen.tsx`)**:
  - Pantalla de bienvenida con el logotipo central animado en escala suave, indicador de carga y prefetch de tasas oficiales antes de mostrar la interfaz principal.
- **Mensaje Flotante (Toast) de Actualización**:
  - Al presionar el botón de refresco o actualizar las cotizaciones, aparece una notificación flotante animada durante 1 segundo (`✓ Tasas actualizadas`).
- **Calendario Interactivo y Cotizaciones Históricas (`DatePickerModal.tsx`)**:
  - Al presionar la fecha o el icono de calendario en la pantalla principal, se abre un selector de mes y día interactivo.
  - Consulta y cálculo de las cotizaciones oficiales de BCV Dólar, Euro, USDT y promedio para la fecha seleccionada.
  - Botón *"Cargar en Calculadora"* para aplicar la tasa histórica directamente a la calculadora de conversión.

### Correcciones de Layout y Depuración
- **Corrección de Inputs de la Calculadora en `HomeScreen.tsx`**:
  - Corregido el problema de inputs que se desplazaban hacia la derecha fuera de los límites de la tarjeta en web y móvil.
  - Implementado layout con `flex: 1`, `minWidth: 0`, borde inferior separador y alineación numérica limpia y contenida.
- **Corrección en Calculadora Rápida USDT (`UsdtRatesScreen.tsx`)**:
  - Corregido el desbordamiento donde la etiqueta `USDT` salía del recuadro de entrada en pantallas reducidas y navegadores.
- **Limpieza de Interfaz y Opciones Obsoletas**:
  - Eliminado el botón de "Escáner" de la pantalla principal.
  - Eliminado el módulo y modal de "Perfiles de pago".
  - Eliminados los botones de redes sociales (X e Instagram) del menú lateral (Drawer).

---

## [1.0.0] - 2026-09-28 (Lanzamiento Inicial: APP-MONITOR — Monitor Cambiario BCV y USDT)

### Arquitectura & Frontend Móvil (React Native / TypeScript)
- **Consumo Directo de APIs (Zero Backend)**:
  - Integración nativa con la API oficial del Banco Central de Venezuela (BCV) para cotizaciones en tiempo real de Dólar (USD) y Euro (EUR).
  - Consulta en tiempo real de libro de órdenes Binance P2P (`p2p.binance.com`) para el cálculo automatizado del promedio comercial de Tether (USDT) en Bolívares (VES).
  - Cálculo instantáneo de **Brecha Cambiaria**: indicador porcentual diferencial entre el Dólar oficial BCV y el promedio USDT.
  - Almacenamiento persistente sin conexión con `@react-native-async-storage/async-storage` para garantizar carga instantánea offline.
- **Diseño Estricto Monocromático (Black & White)**:
  - Interfaz visual basada fielmente en las capturas de referencia del monitor de cambio.
  - Calculadora interactiva bidireccional en pantalla principal: conversión reactiva inmediata Divisa ⇄ Bolívares (VES) con botón de copiado al portapapeles.
  - Píldora selectora de tasas y fecha oficial BCV.
- **Módulo de Tasas y Monedas (`RatesModal.tsx`)**:
  - Modal tipo Bottom Sheet desplegable con cotizaciones detalladas: Dólar BCV, Euro, Promedio, USDT Binance P2P, Monitor Paralelo y Tasa Personalizada.
  - Indicador de estado "En calculadora" para la tasa actualmente activa.
  - Opción para compartir el boletín diario de tasas a WhatsApp, Telegram y redes sociales.

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
