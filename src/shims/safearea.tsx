import React from 'react';

type Props = React.PropsWithChildren<{ style?: React.CSSProperties }>;

export const SafeAreaProvider: React.FC<Props> = ({ children }) => <>{children}</>;
export const SafeAreaView: React.FC<Props> = ({ children, style }) => (
  <div style={style as any}>{children}</div>
);
export const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });
export const useSafeAreaFrame = () => ({ width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0, x: 0, y: 0 });

export const SafeAreaFrameContext = React.createContext({ width: 0, height: 0, x: 0, y: 0 });
export const SafeAreaInsetsContext = React.createContext({ top: 0, right: 0, bottom: 0, left: 0 });
export const initialWindowMetrics = {
  frame: { width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0, x: 0, y: 0 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

export default SafeAreaView;


