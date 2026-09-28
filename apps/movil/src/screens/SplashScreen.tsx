import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { AppLogo } from '../components/AppLogo';
import { ThemeColors } from '../constants/theme';

interface SplashScreenProps {
  theme: ThemeColors;
  isDark: boolean;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  theme,
  isDark,
  onFinish,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Animación de entrada suave
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Tiempo mínimo de splash screen para dar experiencia fluida
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AppLogo size={150} isDark={isDark} useImage={true} />

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          APP MONITOR
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Cotizaciones en Tiempo Real
        </Text>

        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="small" color={theme.accentGreen} />
          <Text style={[styles.loaderText, { color: theme.textSubtle }]}>
            Sincronizando tasas oficiales...
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  loaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 36,
  },
  loaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
