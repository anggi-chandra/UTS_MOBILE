/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#007A73'; // Teal darker for light mode
const tintColorDark = '#34D399'; // Teal bright for dark mode (resembling M-Tix accent)

export const Colors = {
  light: {
    text: '#020C0D', // Very dark teal/black
    background: '#F0F9FA', // Very light tealish white
    tint: tintColorLight,
    icon: '#4B5563',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    surface: '#FFFFFF',
    border: '#E5E7EB',
  },
  dark: {
    text: '#ECFDF5', // Minty white
    background: '#0B1E26', // Deep Teal (M-Tix ish background)
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    surface: '#132F38', // Slightly lighter teal for cards/surfaces
    border: '#1F3F47',
  },
};

export const Fonts = {
  heading: 'Outfit_700Bold',
  headingSemiBold: 'Outfit_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'SpaceMono-Regular', // If we had it, but let's keep it simple
};
