# Changelog

Todas las modificaciones notables a este proyecto serán documentadas en este archivo según el estándar [Semantic Versioning](https://semver.org/).

## [0.0.2] - 2026-09-28

### Experiencia Visual, Splash y Activos Nativos
- **Corrección de Cuadrícula Nativa en Inicio (Android 12+ / MIUI / HyperOS)**:
  - Creación y estandarización de `adaptive-icon.png` (1024×1024 px con zona segura del 66% y fondo transparente), evitando que el sistema operativo o el lanzador recurra a la plantilla geométrica de calibración por defecto durante el arranque en frío.
  - Estandarización de `splash.png` (1024×1024 px centrado sobre fondo negro `#000000`), garantizando una transición nativa limpia y profesional hacia la aplicación sin deformaciones ni óvalos.
  - Actualización de `app.json` vinculando `android.adaptiveIcon.foregroundImage` a `./assets/adaptive-icon.png`.
- **Restauración de Relleno Blanco en Logotipos Oficiales**:
  - Relleno blanco sólido (`#FFFFFF`) restaurado en la "S" y en los 3 arcos exteriores del isotipo en todos los formatos (`icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png` y `logo-dark.png`).
  - Preservación íntegra de las flechas verdes (`#16A34A` / `#22C55E`) y del contenedor squircle `#303338`.

### Calendario y Cotizaciones Históricas (`DatePickerModal.tsx`)
- **Iconografía Minimalista Profesional**:
  - Reemplazo total de emojis (⚖️, 💵, 💶, 🪙, 📈) por iconos vectoriales limpios de Lucide (`DollarSign`, `Euro`, `Coins`, `Scale`, `TrendingUp`).
- **Cálculo Determinista sin Descuento Acumulativo**:
  - Desacoplamiento de las tasas oficiales en vivo del día (`liveRates`) respecto a las tasas activas de la calculadora, resolviendo el error donde abrir repetidas veces el calendario descontaba progresivamente el precio.
  - Normalización de comparaciones temporales a medianoche y botón para recargar la tasa oficial de Hoy.

### Infraestructura, CI/CD y Auto-Actualizador
- **Migración a Bucket Dedicado en Cloudflare R2**:
  - Configuración y enlace con el nuevo bucket independiente `app-monitor` en el endpoint `https://pub-d26f08339769408fa600c88e7f8a97ce.r2.dev`.
  - Aislamiento del manifiesto de actualización en `latest-app-monitor.json` con retención de las últimas 2 versiones del APK.
- **Vinculación Oficial de EAS Build**:
  - Asociación directa con el proyecto Expo de la cuenta `@rvcenter` (`ID: 9b3139b8-1c9e-4b54-83c8-82a9da2b2b92`).

## [0.0.1] - 2026-09-28 (Versión Inicial de Desarrollo y Pruebas — APP-MONITOR)

### Interfaz Móvil y Experiencia de Usuario (React Native / TypeScript)
- **Recarga por Deslizamiento (Pull to Refresh)**:
  - Implementado `RefreshControl` nativo en todas las pantallas principales (`HomeScreen`, `BcvRatesScreen` y `UsdtRatesScreen`).
  - Al jalar hacia abajo la pantalla, se sincronizan las cotizaciones en vivo y se dispara la notificación flotante de confirmación.
- **Logotipos Oficiales con Flechas Verdes y Soporte de Modo Claro / Oscuro**:
  - Incorporadas las imágenes originales de `C:\Proyectos\LOGOS` (`app-monito-oscuro.jfif` y `app-monito-claro.jfif`) como activos oficiales en `apps/movil/assets/`.
  - Corrección de transparencia en activos de logotipo: relleno blanco sólido (`#FFFFFF`) restaurado en la "S" y en los 3 segmentos exteriores del círculo para `icon.png`, `favicon.png`, `splash.png` y `logo-dark.png`, preservando las flechas verdes (`#16A34A` / `#22C55E`), el fondo squircle `#303338` y las transparencias exteriores de esquinas.
  - Estandarización de assets nativos de Android: creación de `adaptive-icon.png` (1024x1024 px con zona segura del 66%) y actualización de `splash.png` (1024x1024 px centrado) para prevenir que Android 12+ / MIUI muestre la cuadrícula de calibración por defecto durante el arranque en frío.
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
