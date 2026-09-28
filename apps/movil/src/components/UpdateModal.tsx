import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { DownloadCloud, AlertCircle, CheckCircle } from 'lucide-react-native';
import { UpdateInfo, downloadAndInstallApk, CURRENT_APP_VERSION } from '../services/updater';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: UpdateInfo | null;
  isMandatory: boolean;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  updateInfo,
  isMandatory,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!updateInfo) return null;

  const handleUpdate = async () => {
    try {
      setDownloading(true);
      setErrorMsg(null);
      setProgress(0);

      const res = await downloadAndInstallApk(
        updateInfo.url,
        updateInfo.apk_name || `APP-MONITOR_v${updateInfo.version}.apk`,
        (pct) => setProgress(pct)
      );

      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo descargar la actualización.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error inesperado.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <DownloadCloud size={32} color="#000000" />
          </View>

          <Text style={styles.title}>Nueva Versión Disponible</Text>
          <Text style={styles.versionBadge}>
            v{updateInfo.version} (Actual: v{CURRENT_APP_VERSION})
          </Text>

          {updateInfo.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>Novedades:</Text>
              <Text style={styles.notesText}>{updateInfo.notes}</Text>
            </View>
          ) : null}

          {updateInfo.size_mb || updateInfo.peso ? (
            <Text style={styles.sizeText}>
              Tamaño: {updateInfo.size_mb || updateInfo.peso}
            </Text>
          ) : null}

          {downloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>Descargando actualización... {progress}%</Text>
            </View>
          )}

          {errorMsg && (
            <View style={styles.errorRow}>
              <AlertCircle size={16} color="#FFFFFF" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            {!isMandatory && !downloading && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Más tarde</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.updateBtn, downloading && styles.updateBtnDisabled]}
              onPress={handleUpdate}
              disabled={downloading}
              activeOpacity={0.8}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.updateBtnText}>Actualizar Ahora</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#181818',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  versionBadge: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 16,
  },
  notesBox: {
    width: '100%',
    backgroundColor: '#222222',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#303030',
    marginBottom: 14,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
  },
  sizeText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 14,
  },
  progressContainer: {
    width: '100%',
    marginVertical: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  updateBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnDisabled: {
    opacity: 0.6,
  },
  updateBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
