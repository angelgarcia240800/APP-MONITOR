import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';

interface MonochromeLogoProps {
  size?: number;
}

/**
 * Logotipo Monocromático de APP-MONITOR
 * Réplica exacta del logo de las capturas pero en blanco, grises y negro
 * Estricto monocromatismo: sin colores verde, rojo, azul o amarillo.
 */
export const MonochromeLogo: React.FC<MonochromeLogoProps> = ({ size = 120 }) => {
  const strokeWidth = size * 0.085;
  const radius = size / 2 - strokeWidth;
  const center = size / 2;

  // Ángulos para los 3 segmentos del anillo exterior
  // Segmento 1 (Izquierdo, antes amarillo): White #FFFFFF
  // Segmento 2 (Superior derecho, antes azul): Silver/Medium Gray #999999
  // Segmento 3 (Inferior derecho, antes rojo): Charcoal #4A4A4A

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {/* Fondo central del círculo */}
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2}
            fill="#0F0F0F"
          />

          {/* Segmento 1: Arco Izquierdo (Blanco puro) */}
          <Path
            d={describeArc(center, center, radius, 140, 280)}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segmento 2: Arco Superior Derecho (Gris medio / Plata) */}
          <Path
            d={describeArc(center, center, radius, 290, 390)}
            fill="none"
            stroke="#9E9E9E"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segmento 3: Arco Inferior Derecho (Gris grafito oscuro) */}
          <Path
            d={describeArc(center, center, radius, 400, 490)}
            fill="none"
            stroke="#4A4A4A"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Letra "$" en el centro */}
          <SvgText
            x={center}
            y={center + size * 0.15}
            fill="#FFFFFF"
            fontSize={size * 0.52}
            fontWeight="900"
            fontFamily="System"
            textAnchor="middle"
          >
            $
          </SvgText>

          {/* Flecha Vertical Hacia Arriba (Blanco brillante) */}
          <Path
            d={`M ${center - size * 0.02} ${center + size * 0.22}
                L ${center - size * 0.02} ${center - size * 0.22}
                M ${center - size * 0.06} ${center - size * 0.16}
                L ${center - size * 0.02} ${center - size * 0.25}
                L ${center + size * 0.02} ${center - size * 0.16}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={size * 0.032}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Flecha Vertical Hacia Abajo (Gris claro reflectivo) */}
          <Path
            d={`M ${center + size * 0.02} ${center - size * 0.22}
                L ${center + size * 0.02} ${center + size * 0.22}
                M ${center - size * 0.02} ${center + size * 0.16}
                L ${center + size * 0.02} ${center + size * 0.25}
                L ${center + size * 0.06} ${center + size * 0.16}`}
            fill="none"
            stroke="#CCCCCC"
            strokeWidth={size * 0.032}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};

// Función auxiliar para dibujar arcos SVG precisos
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
