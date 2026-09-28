import React from 'react';
import { AppLogo } from './AppLogo';

interface MonochromeLogoProps {
  size?: number;
  isDark?: boolean;
}

export const MonochromeLogo: React.FC<MonochromeLogoProps> = ({ size = 120, isDark = true }) => {
  return <AppLogo size={size} isDark={isDark} useImage={true} />;
};
