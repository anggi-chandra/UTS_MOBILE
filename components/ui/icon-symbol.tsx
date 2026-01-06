// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Added mappings for app icons used across the app
  'plus.app.fill': 'add-circle',
  'plus': 'add',
  'film': 'movie',
  'film.fill': 'movie',
  'ellipsis.horizontal': 'more-horiz',
  'ellipsis': 'more-horiz',
  'moon.fill': 'dark-mode',
  'sun.max.fill': 'wb-sunny',
  'xmark': 'close',
  'pencil': 'edit',
  'trash': 'delete',
  // Additional mappings for richer UI
  'checkmark.circle.fill': 'check-circle',
  'star.fill': 'star',
  'qrcode': 'qr-code',
  'creditcard': 'credit-card',
  'banknote': 'attach-money',
  'person.fill': 'person',
  'gear': 'settings',
  'bell.fill': 'notifications',
  'lock.fill': 'lock',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'square.and.arrow.up': 'share',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
