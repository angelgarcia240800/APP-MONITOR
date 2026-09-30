# Changelog

Todas las modificaciones notables a este proyecto serán documentadas en este archivo según el estándar [Semantic Versioning](https://semver.org/).

## [0.0.4] - 2026-09-29

### Calculadora en Tiempo Real e Interacción Financiera ATM
- **Eliminación de Capas Superpuestas y Números en Negro**:
  - Se sustituyó la arquitectura de doble capa (`Text` subyacente con `TextInput` transparente superpuesto) por un único `TextInput` directo y reactivo. Esto resuelve de forma definitiva el fallo en Android donde `EditText` ignora el color transparente y dibuja números en negro encima del texto verde, eliminando el parpadeo de capas y caracteres superpuestos.
  - El cursor de texto se mantiene anclado al final mediante `selection={{ start: length, end: length }}`, garantizando adición y borrado continuo sin saltos erráticos de posición.
- **Formateo Monetario Progresivo Tipo ATM**:
  - Al ingresar dígitos en cualquiera de los campos (divisa o Bolívares), los números entran desde los centavos hacia las unidades (`5` -> `0,05`, `52` -> `0,52`, `100000000` -> `1.000.000,00`).
  - Separación de miles con puntos (`.`) y decimales con coma (`,`), conforme al estándar monetario venezolano.
  - Indicador visual activo: el campo seleccionado ilumina su borde inferior y su valor numérico en color verde esmeralda.
- **Acción Contextual "Comparar"**:
  - Los botones dinámicos de la calculadora ahora son **Reiniciar** y **Comparar**.
  - Al pulsar **Comparar**, se despliega el modal de cotizaciones aplicando de inmediato el monto editado por el usuario contra todas las divisas (BCV, USDT, Paralelo, Promedio, etc.).

### Scroll Inteligente y Visibilidad del Logotipo
- **Alineación Exacta con el Borde Superior del Teclado**:
  - Se implementó un cálculo dinámico de desplazamiento vertical que mide la altura del teclado en pantalla (`keyboardHeight`) y la posición absoluta del panel de cálculo.
  - La pantalla se desplaza la distancia exacta necesaria para que el límite inferior de la tarjeta (los botones **Reiniciar** y **Comparar**) quede posicionado justo sobre el teclado nativo.
  - El logotipo central oficial de la aplicación y el encabezado se mantienen completamente visibles durante la escritura, evitando desplazamientos excesivos que ocultaban la identidad visual.
  - Al cerrar el teclado o pulsar "Reiniciar", la vista retorna suavemente a su posición original (`y: 0`).

### Gestos y Animaciones en Modales Desplegables (Bottom Sheets)
- **Cierre por Deslizamiento Vertical (Swipe Down to Dismiss)**:
  - Optimización de los gestos táctiles con `PanResponder` en `RatesModal.tsx` y `DatePickerModal.tsx`, permitiendo cerrar los paneles arrastrándolos suavemente hacia abajo tanto en Expo Go (Android/iOS) como en navegadores web.
- **Cierre por Toque Externo (Backdrop Tap)**:
  - Pulsar en el fondo semitransparente superior cierra inmediatamente el modal sin interferir con el área de contenido.
- **Sincronización de Animaciones**:
  - El desvanecimiento de la sombra de fondo ahora se ejecuta en paralelo con el deslizamiento de salida de la hoja (`Animated.parallel`), eliminando la sensación de "doble cierre" o sombras residuales rezagadas.
- **Botón Compartir Restaurado**:
  - Se reincorporó la acción de compartir en el pie de página de `RatesModal.tsx`, manteniendo tanto "Cerrar" como "Compartir".

### Navegación y Menú Lateral (`SideDrawer.tsx`)
- **Mayor Margen Inferior**:
  - Se incrementó el espaciado inferior (`paddingBottom: 44`) en el menú lateral, elevando la tarjeta de versión ("Versión v0.0.4 - Comprobar actualizaciones") por encima de las barras de gestos y navegación de dispositivos Android y Xiaomi/HyperOS.

## [0.0.3] - 2026-09-29

### Calculadora Interactiva y Experiencia de Usuario
- **Botones Contextuales de Reiniciar y Compartir**:
  - Al ingresar cualquier monto en la calculadora (divisa extranjera o Bolívares), aparece dinámicamente una barra con dos acciones principales:
    - **Reiniciar**: restablece instantáneamente el valor a 1.00 y recalcula el monto en Bolívares a la tasa activa.
    - **Compartir**: permite compartir vía WhatsApp, Telegram, correo o cualquier app el cálculo detallado con fecha, tasa oficial aplicada y enlace hacia la web oficial `https://app.rvproyecto.xyz`.

### Ergonomía y Márgenes de Navegación Móvil
- **Ajuste de Padding Inferior en Modales (`RatesModal.tsx` y `DatePickerModal.tsx`)**:
  - Se incrementó el espaciado inferior (`paddingBottom: 46` en Android y `38` en iOS) en el contenedor principal de los modales desplegables (Bottom Sheets).
  - Reajuste de márgenes en la fila de acciones (`footerRow` con `marginTop: 14` y `marginBottom: 4`), asegurando que los botones "Cerrar" y "Compartir" nunca queden solapados ni ocultos detrás de la barra de navegación física o de gestos en dispositivos Android y Xiaomi/MIUI.
  - Aumento de relleno inferior a `50px` en el scroll principal de `HomeScreen.tsx`.

### Splash Screen Nativo Android 12+ (MIUI / HyperOS)
- **Integración del Plugin Oficial `expo-splash-screen`**:
  - Se instaló la dependencia nativa `expo-splash-screen` (`^57.0.9`) y se configuró como plugin en `app.json` con `imageWidth: 200` y modo oscuro/claro forzado a fondo negro `#000000`.
  - Esto genera explícitamente las directivas nativas `windowSplashScreenAnimatedIcon` y `windowSplashScreenBackground` en `styles.xml`, erradicando definitivamente el fallback del sistema de Android que mostraba la cuadrícula y óvalos de calibración por defecto.
- **Incremento de `versionCode`**:
  - Se asignó explícitamente `"versionCode": 3` en la configuración de Android (`app.json`) para obligar al sistema operativo y a los lanzadores de Xiaomi/MIUI a invalidar su caché interna de splash drawables.

### Sitio Web Oficial y Despliegue en GitHub Pages (`app.rvproyecto.xyz`)
- **Landing Page Minimalista de Descarga (`apps/landing/index.html`)**:
  - Estructuración en 3 tarjetas esenciales con diseño limpio, moderno y oscuro.
  - Sustitución de emojis por iconos vectoriales minimalistas en SVG puro.
  - Integración del logotipo oficial PNG (`logo.png`) en el encabezado.
- **Automatización de Despliegue CI/CD (`.github/workflows/deploy-pages.yml`)**:
  - Workflow automatizado que compila y publica la carpeta `apps/landing` directamente en GitHub Pages en cada push a la rama `main`.
  - Configuración del archivo `CNAME` apuntando al subdominio `app.rvproyecto.xyz` con enlace directo de descarga hacia el bucket de Cloudflare R2.

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
