import { Platform, ViewStyle } from 'react-native';

/**
 * Returns a cross-platform shadow style object.
 * Uses `boxShadow` for Web (to avoid deprecation warnings) and `shadow*` props/elevation for Native.
 * 
 * @param opacity Shadow opacity (default: 0.1)
 * @param radius Shadow radius (default: 12)
 * @param height Shadow vertical offset (default: 8)
 * @param color Shadow color (default: '#000') - Note: Web uses rgba for opacity, so color is assumed black-ish usually unless fully specified in box-shadow logic.
 * We'll simplify to just black shadows with opacity for now.
 */
export function getShadowStyle(
    opacity = 0.1,
    radius = 12,
    height = 8,
    elevation = 4
): ViewStyle {
    if (Platform.OS === 'web') {
        return {
            // @ts-ignore: boxShadow is valid in RNWeb but might not be in standard RN types depending on version
            boxShadow: `0px ${height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
        };
    }

    return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height },
        shadowOpacity: opacity,
        shadowRadius: radius,
        elevation,
    };
}
