# Changelog

Todas las modificaciones notables a este proyecto serán documentadas en este archivo según el estándar [Semantic Versioning](https://semver.org/).

## [0.0.1] - 2026-09-28 (Versión Inicial de Desarrollo y Pruebas — APP-MONITOR)

### Interfaz Móvil y Experiencia de Usuario (React Native / TypeScript)
- **Recarga por Deslizamiento (Pull to Refresh)**:
  - Implementado `RefreshControl` nativo en todas las pantallas principales (`HomeScreen`, `BcvRatesScreen` y `UsdtRatesScreen`).
  - Al jalar hacia abajo la pantalla, se sincronizan las cotizaciones en vivo y se dispara la notificación flotante de confirmación.
- **Logotipos Oficiales con Flechas Verdes y Soporte de Modo Claro / Oscuro**:
  - Incorporadas las imágenes originales de `C:\Proyectos\LOGOS` (`app-monito-oscuro.jfif` y `app-monito-claro.jfif`) como activos oficiales en `apps/movil/assets/`.
  - Corrección de transparencia en activos de logotipo: relleno blanco sólido (`#FFFFFF`) restaurado en la "S" y en los 3 segmentos exteriores del círculo para `icon.png`, `favicon.png`, `splash.png` y `logo-dark.png`, preservando las flechas verdes (`#16A34A` / `#22C55E`), el fondo squircle `#303338` y las transparencias exteriores de esquinas.
  - Creación del componente `AppLogo.tsx` que alterna dinámicamente según el tema seleccionado.
- **Soporte Completo de 3 Modos de Apariencia**:
  - Modo Oscuro, Modo Claro y Automático (sincronizado con el sistema operativo del teléfono mediante `useColorScheme`).
  - Selector táctil en la pantalla de **Configuración** con persistencia en `AsyncStorage`.
- **Pantalla de Mini Carga de Inicio (`SplashScreen.tsx`)**:
  - Bienvenida visual con animación de escala/respiración y prefetch de tasas oficiales al iniciar la aplicación.
- **Mensaje Flotante (Toast) de Actualización (`FloatingToast.tsx`)**:
  - Notificación flotante animada que aparece durante 1 segundo exacto (`✓ Tasas actualizadas`).
- **Calendario Interactivo y Cotizaciones Históricas (`DatePickerModal.tsx`)**:
  - Selector de fecha para consultar cotizaciones pasadas de Dólar BCV, Euro BCV, USDT y Promedio, con botón para cargar el valor en la calculadora.
  - Diseño minimalista limpio: sustitución de emojis por iconos vectoriales profesionales de Lucide (`DollarSign`, `Euro`, `Coins`, `Scale` y `TrendingUp`).
  - Corrección de consistencia histórica: separación de las tasas base oficiales en vivo (`liveRates`) de las tasas temporales aplicadas en la calculadora, eliminando el error de descuento acumulativo al abrir y seleccionar fechas repetidas veces y normalizando las comparaciones a medianoche.
- **Correcciones de Layout en Inputs**:
  - Los campos numéricos de la calculadora principal (`HomeScreen`) permanecen 100% contenidos dentro de la tarjeta sin desbordarse hacia la derecha en web y móvil.
  - En `UsdtRatesScreen`, la etiqueta `USDT` permanece contenida dentro de la caja de cálculo rápido P2P.

### Arquitectura & Sincronización Directa (Zero Backend)
- **Consumo Directo de APIs**:
  - API oficial del Banco Central de Venezuela (BCV) para cotizaciones de Dólar (USD) y Euro (EUR).
  - Consulta en tiempo real de Binance P2P (`p2p.binance.com`) para el promedio comercial de Tether (USDT) en Bolívares.
  - Cálculo instantáneo de Brecha Cambiaria ($/USDT).
  - Almacenamiento persistente sin conexión con `@react-native-async-storage/async-storage`.

### Pipeline de Despliegue CI/CD y Auto-Actualizaciones
- **Segregación del Manifiesto en Cloudflare R2**:
  - Se configuró el endpoint independiente `latest-app-monitor.json` para esta aplicación, evitando colisiones con los manifiestos de otras aplicaciones en el bucket R2 (como `APP-JU`).
  - Validación de identidad del instalador: el actualizador comprueba explícitamente que el paquete pertenezca a `APP-MONITOR`.
- **Workflow de GitHub Actions (`.github/workflows/build-mobile.yml`)**:
  - Compilación automática de APK con EAS Build local.
  - Generación de manifiesto `latest-app-monitor.json` y subida a Cloudflare R2 con retención de 2 versiones.
- **Auto-Actualizador en la App (`updater.ts` & `UpdateModal.tsx`)**:
  - Consulta en segundo plano contra Cloudflare R2 con seguimiento de porcentaje de descarga e instalador nativo.
