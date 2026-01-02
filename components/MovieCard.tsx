import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Movie } from '@/data/movies';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getShadowStyle } from '@/lib/ui-utils';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Clock, Pencil, Star, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

interface MovieCardProps {
  movie: Movie;
  index: number;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movieId: string) => void;
  showActions?: boolean;
  variant?: 'standard' | 'portrait';
}

export function MovieCard({
  movie,
  index,
  onEdit,
  onDelete,
  showActions = false,
  variant = 'standard'
}: MovieCardProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const backgroundColor = useThemeColor({}, 'surface'); // Changed to surface for better contrast
  const tintColor = useThemeColor({}, 'tint');
  const { scheme } = useColorSchemeController();

  const isPortrait = variant === 'portrait';
  const cardWidth = isPortrait ? 160 : (isTablet ? (width - 60) / 2 : width - 40);

  const handlePress = () => {
    router.push(`/movie/${movie.id}`);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(movie);
    else router.push(`/manage-movie?movieId=${movie.id}`);
  };

  const handleDelete = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm(`Apakah Anda yakin ingin menghapus film "${movie.title}"?`);
      if (ok && onDelete) {
        onDelete(movie.id);
        Toast.show({ type: 'success', text1: 'Film dihapus', text2: `${movie.title} dihapus.` });
      }
      return;
    }
    Alert.alert('Hapus Film', `Hapus "${movie.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDelete?.(movie.id) },
    ]);
  };

  const isWeb = Platform.OS === 'web';
  const CardComponent = isWeb ? View : Animated.View;
  const animationProps = isWeb ? {} : {
    entering: FadeIn.delay(index * 100),
    layout: Layout,
  };

  return (
    <CardComponent
      {...animationProps}
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: isPortrait ? 'transparent' : backgroundColor,
          marginRight: isPortrait ? 16 : 0,
          marginBottom: isPortrait ? 0 : 20,
          ...getShadowStyle(isPortrait ? 0 : 0.1, 12, 8, 4), // Dynamic shadow
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} style={styles.touchable} activeOpacity={0.8}>
        <View style={[styles.posterWrapper, isPortrait && styles.posterPortrait]}>
          <Image
            source={typeof movie.poster === 'string' ? { uri: movie.poster } : movie.poster}
            style={styles.poster}
            contentFit="cover"
            transition={500}
          />

          {/* Portrait Variant: Clean overlay badges */}
          {isPortrait && (
            <>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.portraitOverlay}>
                <ThemedText style={styles.portraitRating}>★ {movie.rating}</ThemedText>
              </View>
            </>
          )}

          {/* Standard Variant: Badges */}
          {!isPortrait && (
            <>
              <View style={[styles.priceBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <ThemedText style={[styles.badgeText, { color: '#fff' }]}>Rp {movie.price.toLocaleString('id-ID')}</ThemedText>
              </View>
              <View style={styles.topBadgesContainer}>
                <View style={[styles.ratingBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <ThemedText style={[styles.ratingBadgeText, { color: '#fff' }]}>{movie.rating}</ThemedText>
                </View>
              </View>
            </>
          )}
        </View>

        {isPortrait ? (
          <View style={{ paddingTop: 8 }}>
            <ThemedText style={styles.portraitTitle} numberOfLines={2}>{movie.title}</ThemedText>
          </View>
        ) : (
          <ThemedView style={styles.content}>
            <View style={styles.headerRow}>
              <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>{movie.title}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.genre} numberOfLines={1}>{movie.genre}</ThemedText>
            </View>
            <View style={styles.footerRow}>
              <View style={styles.durationBadge}>
                <Clock size={12} color={Platform.OS === 'ios' ? '#888' : '#666'} style={{ marginRight: 4 }} />
                <ThemedText style={styles.duration}>{movie.durationMin} m</ThemedText>
              </View>
            </View>
          </ThemedView>
        )}
      </TouchableOpacity>

      {showActions && !isPortrait && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: scheme === 'dark' ? '#333' : '#fff' }]} onPress={handleEdit}>
            <Pencil size={16} color={tintColor} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ffebee' }]} onPress={handleDelete}>
            <Trash2 size={16} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      )}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'visible',
    // removed static legacy shadow props
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  posterWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  posterPortrait: {
    // Specifically for portrait variant if needed
  },
  poster: {
    width: '100%',
    height: '100%',
  },

  // Standard Content Styles
  content: {
    padding: 16,
    paddingTop: 12,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  genre: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoRow: { marginBottom: 6 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(150, 150, 150, 0.1)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  duration: { fontSize: 12, fontWeight: '600', opacity: 0.8 },

  // Portrait Styles
  portraitTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  portraitOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  portraitRating: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
  },

  // Actions & Badges (Standard)
  actionButtons: { position: 'absolute', top: 12, right: 12, flexDirection: 'column', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  priceBadge: { position: 'absolute', right: 12, bottom: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, overflow: 'hidden' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  topBadgesContainer: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingBadgeText: { fontSize: 12, fontWeight: '700' },

  // Unused legacy
  rating: {}, details: {}, priceNote: {},
});