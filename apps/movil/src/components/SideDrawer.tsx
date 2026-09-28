import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Calculator,
  List,
  Coins,
  Receipt,
  Settings,
  Info,
  ChevronRight,
  Share2,
  DownloadCloud,
} from 'lucide-react-native';
import { MonochromeLogo } from './MonochromeLogo';
import { CURRENT_APP_VERSION } from '../services/updater';

export type DrawerScreenType =
  | 'CALCULATOR'
  | 'BCV_RATES'
  | 'USDT_RATES'
  | 'PAYMENT_PROFILES'
  | 'SETTINGS';

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeScreen: DrawerScreenType;
  onNavigate: (screen: DrawerScreenType) => void;
  onOpenInfo: () => void;
  onCheckUpdates: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  visible,
  onClose,
  activeScreen,
  onNavigate,
  onOpenInfo,
  onCheckUpdates,
}) => {
  const menuItems = [
    {
      id: 'CALCULATOR' as DrawerScreenType,
      label: 'Calculadora',
      icon: Calculator,
    },
    {
      id: 'BCV_RATES' as DrawerScreenType,
      label: 'Tasas BCV',
      icon: List,
    },
    {
      id: 'USDT_RATES' as DrawerScreenType,
      label: 'Tasas USDT',
      icon: Coins,
    },
    {
      id: 'PAYMENT_PROFILES' as DrawerScreenType,
      label: 'Perfiles de pago',
      icon: Receipt,
    },
    {
      id: 'SETTINGS' as DrawerScreenType,
      label: 'Configuración',
      icon: Settings,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouch} />
        </TouchableWithoutFeedback>

        <View style={styles.drawerContainer}>
          {/* Header del Drawer */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <MonochromeLogo size={36} />
              <Text style={styles.brandTitle}>app monitor</Text>
            </View>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => {
                onClose();
                onOpenInfo();
              }}
              activeOpacity={0.7}
            >
              <Info size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Menú de Opciones */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = activeScreen === item.id;
              const IconComp = item.icon;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <IconComp
                      size={22}
                      color={isActive ? '#000000' : '#CCCCCC'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <Text
                      style={[
                        styles.menuItemLabel,
                        isActive && styles.menuItemLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight
                    size={18}
                    color={isActive ? '#000000' : '#555555'}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sección Inferior / Acciones y Redes */}
          <View style={styles.footer}>
            {/* Botón de Actualizaciones Cloudflare R2 */}
            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => {
                onClose();
                onCheckUpdates();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.updateCardContent}>
                <DownloadCloud size={20} color="#000000" />
                <View>
                  <Text style={styles.updateCardTitle}>Versión v{CURRENT_APP_VERSION}</Text>
                  <Text style={styles.updateCardSub}>Comprobar actualizaciones</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Redes sociales monocromáticas */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://x.com')}
                activeOpacity={0.7}
              >
                <Text style={styles.socialText}>𝕏</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://instagram.com')}
                activeOpacity={0.7}
              >
                <Text style={styles.socialText}>IG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerContainer: {
    width: '82%',
    maxWidth: 340,
    backgroundColor: '#141414',
    height: '100%',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderRightWidth: 1,
    borderColor: '#262626',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  infoButton: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#262626',
    marginBottom: 20,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#FFFFFF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  menuItemLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#262626',
    gap: 14,
  },
  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  updateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  updateCardSub: {
    fontSize: 12,
    color: '#444444',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#222222',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
