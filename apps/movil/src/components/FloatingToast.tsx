import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { ThemeColors } from '../constants/theme';

interface FloatingToastProps {
  visible: boolean;
  message?: string;
  theme: ThemeColors;
  onHide: () => void;
}

export const FloatingToast: React.FC<FloatingToastProps> = ({
  visible,
  message = 'Tasas actualizadas',
  theme,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrada
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Permanecer exactamente 1 segundo (1000ms)
      const timer = setTimeout(() => {
        // Salida
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -60,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: theme.toastBg,
          borderColor: theme.borderHighlight,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.accentGreen }]}>
        <Check size={14} color="#FFFFFF" strokeWidth={3} />
      </View>
      <Text style={[styles.toastText, { color: theme.toastText }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
