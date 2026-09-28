# APP-MONITOR

Aplicación móvil de cotización y monitoreo cambiario para Venezuela desarrollada con **React Native**, **Expo** y **TypeScript**. 

Presenta una interfaz con estética **estrictamente monocromática (Black & White)** inspirada en monitores de cambio financieros, con soporte para tasas oficiales del **Banco Central de Venezuela (BCV)**, promedio en tiempo real de **USDT (Binance P2P)**, cálculo de **Brecha Cambiaria**, calculadora bidireccional y actualización automática de APK vía **Cloudflare R2** y **GitHub Actions**.

---

## 🚀 Características Principales

- **🏛️ Tasas Oficiales BCV**:
  - Dólar estadounidense (USD) y Euro (EUR) actualizados según la cotización oficial del Banco Central de Venezuela.
  - Indicador de variación en Bolívares y porcentaje respecto al cierre anterior.
  - Indicación de fecha valor oficial para facturación comercial y cumplimiento SENIAT.

- **🪙 USDT en Tiempo Real (Binance P2P)**:
  - Consulta directa al libro de órdenes P2P de Binance para el par `USDT/VES`.
  - Algoritmo de promedio representativo (eliminación de valores atípicos y extremos).

- **📈 Indicador de Brecha Cambiaria**:
  - Métrica porcentual diferencial calculada al instante entre la cotización BCV y el promedio USDT.

- **🧮 Calculadora Bidireccional Reactiva**:
  - Conversión en tiempo real Divisa ⇄ Bolívares (VES).
  - Botones de copiado al portapapeles con confirmación visual.
  - Píldora interactiva para alternar al instante entre Dólar BCV, Euro, USDT, Promedio, Paralelo o Tasa Personalizada.

- **💳 Perfiles de Pago Rápidos**:
  - Almacena datos frecuentes de **Pago Móvil** (banco, cédula, teléfono), **Zelle** (correo) y **Binance Pay**.
  - Copiado con 1 solo toque para agilizar cobros y pagos cotidianos.

- **📷 Escáner / Fijador Rápido de Precios**:
  - Herramienta para convertir montos de etiquetas de productos en divisas al equivalente exacto en Bolívares según la tasa seleccionada.

- **⚫⚪ Diseño Estricto Monocromático**:
  - Paleta 100% en escala de grises, negro azabache (#000000) y blanco de alto contraste (#FFFFFF).
  - Logotipo circular vectorial con segmentos tonales en escala de grises y flechas bidireccionales.

- **⚡ Arquitectura Frontend-Direct (Zero Backend)**:
  - No requiere servidor ni backend intermediario; la aplicación se comunica directamente con las APIs públicas y oficiales.
  - Caché persistente en `AsyncStorage` para funcionamiento fluido incluso sin conexión a internet.

- **🔄 Sistema de Actualizaciones Automáticas (OTA / APK)**:
  - Consulta en segundo plano contra el manifiesto `latest-app-monitor.json` alojado en **Cloudflare R2**.
  - Descarga del APK con barra de progreso e invocación del instalador nativo de Android.

---

## 🛠️ Tecnologías y Dependencias

- **Framework**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 57)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estricto)
- **Almacenamiento Local**: `@react-native-async-storage/async-storage`
- **Iconografía**: `lucide-react-native`
- **Gráficos Vectoriales**: `react-native-svg`
- **Actualizador Nativo**: `expo-file-system`, `expo-intent-launcher`, `expo-application`
- **Compilación CI/CD**: GitHub Actions + EAS Build (`--profile github --local`)
- **Alojamiento de Releases**: Cloudflare R2 (Compatible con AWS S3)

---

## 📁 Estructura del Repositorio

```text
APP-MONITOR/
├── .github/
│   └── workflows/
│       └── build-mobile.yml       # Compilación automática de APK y subida a Cloudflare R2 / GitHub Release
├── apps/
│   └── movil/
│       ├── assets/                # Iconos monocromáticos, splash y favicon
│       ├── src/
│       │   ├── components/        # Logo B&W, modales (Tasas, Drawer, Updates, Scanner, Perfiles)
│       │   ├── constants/         # Tema monocromático y paleta de colores
│       │   ├── screens/           # HomeScreen, BcvRatesScreen, UsdtRatesScreen, SettingsScreen
│       │   ├── services/          # ratesService (BCV y P2P), storageService, updater
│       │   └── types/             # Modelos de datos TypeScript
│       ├── app.json               # Configuración de Expo y paquete com.angelgarcia.appmonitor
│       ├── eas.json               # Perfiles de compilación EAS
│       ├── release-config.json    # Control de versión mínima y notas de versión
│       └── package.json           # Dependencias de la app móvil
├── CHANGELOG.md                   # Registro de cambios según Semantic Versioning
├── README.md                      # Documentación del proyecto
└── package.json                   # Scripts de conveniencia raíz
```

---

## ⚙️ Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/angelgarcia240800/APP-MONITOR.git
cd APP-MONITOR
```

### 2. Instalar dependencias
```bash
cd apps/movil
npm install
```

### 3. Iniciar el servidor de desarrollo Expo
```bash
npm start
```
- Presiona `a` para abrir en emulador Android o dispositivo físico mediante Expo Go.
- Presiona `w` para probar en el navegador web.

---

## 🚀 Despliegue y Distribución (CI/CD)

El pipeline de compilación y distribución se ejecuta automáticamente mediante **GitHub Actions** al publicar un nuevo release:

1. **Creación de Release**:
   - Crear un tag de versión, por ejemplo `v1.0.0`.
   - Publicar el release en GitHub.

2. **Acciones del Workflow (`build-mobile.yml`)**:
   - Descarga el código y prepara el entorno Node 22, Java Zulu 17 y EAS CLI.
   - Inyecta la versión del tag en `apps/movil/app.json` y `package.json`.
   - Compila el APK ejecutable localmente: `APP-MONITOR_v1.0.0.apk`.
   - Genera el manifiesto `latest-app-monitor.json`.
   - Despliega el instalador y el manifiesto al bucket de **Cloudflare R2**.
   - Mantiene automáticamente las últimas 2 versiones activas en R2 para optimizar almacenamiento.
   - Adjunta el APK y el JSON al GitHub Release para descarga directa.

3. **Variables y Secretos Requeridos en GitHub Actions**:
   - `EXPO_TOKEN`: Token de autenticación de Expo.
   - `R2_ACCESS_KEY_ID`: ID de clave de acceso de Cloudflare R2.
   - `R2_SECRET_ACCESS_KEY`: Clave secreta de Cloudflare R2.
   - `R2_BUCKET_NAME` *(Opcional, por defecto `app-junreca-updates`)*.
   - `R2_ENDPOINT_URL` *(Opcional, endpoint S3 de Cloudflare)*.
   - `R2_PUBLIC_URL` *(Opcional, dominio público de descarga R2)*.

---

## 📜 Política de Ramas y Changelog

- La rama `main` se mantiene siempre limpia, estable y compilable.
- Cada modificación funcional o corrección debe registrarse en el archivo `CHANGELOG.md` siguiendo el estándar [Keep a Changelog](https://keepachangelog.com/).
