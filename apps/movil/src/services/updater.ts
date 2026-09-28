import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import appConfig from '../../app.json';

export const CURRENT_APP_VERSION = appConfig.expo.version || '0.0.1';
export const UPDATE_ENDPOINT = 'https://pub-f4c1d44ce5464b5885fafbb9e5afe882.r2.dev/latest-mobile.json';

export interface UpdateInfo {
  version: string;
  notes?: string;
  pub_date?: string;
  url: string;
  apk_name?: string;
  obligatoria?: boolean;
  min_version?: string;
  size_bytes?: number;
  size_mb?: string;
  size?: string;
  peso?: string;
}

export interface CheckUpdateResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateInfo?: UpdateInfo;
  isMandatory?: boolean;
  error?: string;
}

/**
 * Compara dos versiones SemVer completas (vX.Y.Z)
 * Retorna:
 *  1 si v1 > v2
 * -1 si v1 < v2
 *  0 si v1 === v2
 */
export function compareSemVer(v1: string, v2: string): number {
  const clean1 = (v1 || '').replace(/^v/i, '').trim();
  const clean2 = (v2 || '').replace(/^v/i, '').trim();

  const parts1 = clean1.split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = clean2.split('.').map(p => parseInt(p, 10) || 0);

  const maxLength = Math.max(parts1.length, parts2.length, 3);

  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Consulta el endpoint en Cloudflare R2 y valida si existe una versión superior
 */
export async function checkForUpdate(): Promise<CheckUpdateResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${UPDATE_ENDPOINT}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        error: `Error ${response.status} al consultar actualización`,
      };
    }

    const data: UpdateInfo = await response.json();
    if (!data || !data.version || !data.url) {
      return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
    }

    const isNewer = compareSemVer(data.version, CURRENT_APP_VERSION) > 0;

    let isMandatory = false;
    if (isNewer) {
      if (data.obligatoria === true) {
        isMandatory = true;
      } else if (data.min_version && compareSemVer(data.min_version, CURRENT_APP_VERSION) > 0) {
        isMandatory = true;
      }
    }

    return {
      hasUpdate: isNewer,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: data.version,
      updateInfo: data,
      isMandatory,
    };
  } catch (err: any) {
    console.warn('No se pudo comprobar actualizaciones móviles:', err.message);
    return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION, error: err.message };
  }
}

/**
 * Descarga el archivo APK en caché con seguimiento de porcentaje y ejecuta el instalador nativo
 */
export async function downloadAndInstallApk(
  url: string,
  apkName: string = 'APP-MONITOR_update.apk',
  onProgress: (percentage: number) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    if (Platform.OS !== 'android') {
      await Linking.openURL(url);
      return { success: true };
    }

    const localFileName = apkName.endsWith('.apk') ? apkName : `${apkName}.apk`;
    const targetFileUri = `${FileSystem.cacheDirectory}${localFileName}`;

    const fileInfo = await FileSystem.getInfoAsync(targetFileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(targetFileUri, { idempotent: true });
    }

    onProgress(0);

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      targetFileUri,
      {},
      (downloadProgress) => {
        const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
        if (totalBytesExpectedToWrite > 0) {
          const progress = Math.min(100, Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100));
          onProgress(progress);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) {
      throw new Error('La descarga no devolvió una ruta válida del archivo.');
    }

    onProgress(100);

    const contentUri = await FileSystem.getContentUriAsync(result.uri);

    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: 'application/vnd.android.package-archive',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error al descargar e instalar actualización móvil:', error);
    return { success: false, error: error.message || 'Error al descargar o instalar la actualización.' };
  }
}
