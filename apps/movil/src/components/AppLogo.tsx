import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  isDark?: boolean;
  useImage?: boolean;
}

/**
 * Logotipo Oficial APP-MONITOR
 * Usa las imágenes provistas en C:\Proyectos\LOGOS (app-monito-oscuro y app-monito-claro)
 * con flechas verdes, o renderizado vectorial SVG de alta definición.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  size = 130,
  isDark = true,
  useImage = true,
}) => {
  if (useImage) {
    const source = isDark
      ? require('../../assets/logo-dark.png')
      : require('../../assets/logo-light.png');

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Renderizado Vectorial SVG con flechas verdes nítidas
  const strokeWidth = size * 0.085;
  const radius = size / 2 - strokeWidth;
  const center = size / 2;

  const ringColor = isDark ? '#FFFFFF' : '#111111';
  const diskColor = isDark ? '#0F0F0F' : '#F9FAFB';
  const dollarColor = isDark ? '#FFFFFF' : '#111111';
  const greenArrowColor = isDark ? '#22C55E' : '#16A34A';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2}
            fill={diskColor}
          />

          {/* Anillo Segmentado */}
          <Path
            d={describeArc(center, center, radius, 140, 275)}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d={describeArc(center, center, radius, 285, 395)}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d={describeArc(center, center, radius, 405, 485)}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Letra "$" en el centro */}
          <SvgText
            x={center}
            y={center + size * 0.16}
            fill={dollarColor}
            fontSize={size * 0.52}
            fontWeight="900"
            fontFamily="System"
            textAnchor="middle"
          >
            $
          </SvgText>

          {/* Flecha Verde Arriba */}
          <Path
            d={`M ${center - size * 0.02} ${center + size * 0.23}
                L ${center - size * 0.02} ${center - size * 0.23}
                M ${center - size * 0.06} ${center - size * 0.17}
                L ${center - size * 0.02} ${center - size * 0.26}
                L ${center + size * 0.02} ${center - size * 0.17}`}
            fill="none"
            stroke={greenArrowColor}
            strokeWidth={size * 0.034}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Flecha Verde Abajo */}
          <Path
            d={`M ${center + size * 0.02} ${center - size * 0.23}
                L ${center + size * 0.02} ${center + size * 0.23}
                M ${center - size * 0.02} ${center + size * 0.17}
                L ${center + size * 0.02} ${center + size * 0.26}
                L ${center + size * 0.06} ${center + size * 0.17}`}
            fill="none"
            stroke={greenArrowColor}
            strokeWidth={size * 0.034}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
