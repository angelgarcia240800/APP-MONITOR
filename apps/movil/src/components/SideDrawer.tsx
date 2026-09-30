import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import {
  Calculator,
  List,
  Coins,
  Settings,
  Info,
  ChevronRight,
  DownloadCloud,
} from 'lucide-react-native';
import { AppLogo } from './AppLogo';
import { CURRENT_APP_VERSION } from '../services/updater';
import { ThemeColors } from '../constants/theme';

export type DrawerScreenType =
  | 'CALCULATOR'
  | 'BCV_RATES'
  | 'USDT_RATES'
  | 'SETTINGS';

interface SideDrawerProps {
  visible: boolean;
  theme: ThemeColors;
  isDark: boolean;
  activeScreen: DrawerScreenType;
  onClose: () => void;
  onNavigate: (screen: DrawerScreenType) => void;
  onOpenInfo: () => void;
  onCheckUpdates: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  visible,
  theme,
  isDark,
  activeScreen,
  onClose,
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

        <View style={[styles.drawerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header del Drawer con el nuevo logo */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <AppLogo size={36} isDark={isDark} useImage={true} />
              <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>app monitor</Text>
            </View>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => {
                onClose();
                onOpenInfo();
              }}
              activeOpacity={0.7}
            >
              <Info size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Menú de Opciones */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = activeScreen === item.id;
              const IconComp = item.icon;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: theme.buttonPrimaryBg },
                  ]}
                  onPress={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <IconComp
                      size={22}
                      color={isActive ? theme.buttonPrimaryText : theme.textSecondary}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <Text
                      style={[
                        styles.menuItemLabel,
                        { color: theme.textSecondary },
                        isActive && { color: theme.buttonPrimaryText, fontWeight: '700' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight
                    size={18}
                    color={isActive ? theme.buttonPrimaryText : theme.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sección Inferior / Verificación de Actualizaciones */}
          <View style={[styles.footer, { borderColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.updateCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              onPress={() => {
                onClose();
                onCheckUpdates();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.updateCardContent}>
                <View style={[styles.iconCircle, { backgroundColor: theme.accentGreenSubtle }]}>
                  <DownloadCloud size={20} color={theme.accentGreen} />
                </View>
                <View>
                  <Text style={[styles.updateCardTitle, { color: theme.textPrimary }]}>
                    Versión v{CURRENT_APP_VERSION}
                  </Text>
                  <Text style={[styles.updateCardSub, { color: theme.textMuted }]}>
                    Comprobar actualizaciones
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
    height: '100%',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 44,
    borderRightWidth: 1,
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
    letterSpacing: -0.5,
  },
  infoButton: {
    padding: 6,
  },
  divider: {
    height: 1,
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
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  updateCard: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  updateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  updateCardSub: {
    fontSize: 12,
  },
});
