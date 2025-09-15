import React from 'react';

type IconProps = { name?: string; size?: number; color?: string; style?: any } & Record<string, any>;

export const Ionicons: React.FC<IconProps> = () => null;
export const MaterialIcons: React.FC<IconProps> = () => null;
export const FontAwesome: React.FC<IconProps> = () => null;
const DefaultIcon: React.FC<IconProps> = () => null;

export default DefaultIcon;


