import React from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, Alert, Platform, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Movie } from '@/data/movies';
import Toast from 'react-native-toast-message';

interface MovieCardProps {
  movie: Movie;
  index: number;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movieId: string) => void;
  showActions?: boolean;
}

export function MovieCard({ movie, index, onEdit, onDelete, showActions = false }: MovieCardProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const iconBg = useThemeColor({}, 'icon');
  const { scheme } = useColorSchemeController();

  const cardWidth = isTablet ? (width - 60) / 2 : width - 40;

  const handlePress = () => {
    router.push(`/movie/${movie.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(movie);
    } else {
      router.push(`/manage-movie?movieId=${movie.id}`);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm(`Apakah Anda yakin ingin menghapus film "${movie.title}"?`);
      if (ok && onDelete) {
        onDelete(movie.id);
        Toast.show({
          type: 'success',
          text1: 'Film berhasil dihapus',
          text2: `${movie.title} telah dihapus dari daftar`,
        });
      }
      return;
    }

    Alert.alert(
      'Hapus Film',
      `Apakah Anda yakin ingin menghapus film "${movie.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(movie.id);
              Toast.show({
                type: 'success',
                text1: 'Film berhasil dihapus',
                text2: `${movie.title} telah dihapus dari daftar`,
              });
            }
          },
        },
      ]
    );
  };

  const isWeb = Platform.OS === 'web';

  const CardComponent = isWeb ? View : Animated.View;
  const animationProps = isWeb ? {} : {
    entering: FadeIn.delay(index * 100),
    exiting: FadeOut,
    layout: Layout
  };

  // Hitung warna teks yang kontras untuk badge pada dark/light mode
  const getContrastTextColor = (bg: string, fallback: string) => {
    try {
      if (!bg || typeof bg !== 'string' || !bg.startsWith('#')) return fallback;
      let hex = bg.slice(1);
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      const srgb = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      const L = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
      return L > 0.6 ? '#000' : '#fff';
    } catch {
      return fallback;
    }
  };
  const priceBadgeTextColor = getContrastTextColor(String(tintColor), scheme === 'dark' ? '#000' : '#fff');
  const ratingBadgeTextColor = getContrastTextColor(String(iconBg), scheme === 'dark' ? '#000' : '#fff');

  return (
    <CardComponent
      {...animationProps}
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          width: cardWidth,
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} style={styles.touchable}>
        <View style={styles.posterWrapper}>
          <Image 
            source={typeof movie.poster === 'string' ? { uri: movie.poster } : movie.poster} 
            style={styles.poster} 
          />
          <View style={[styles.priceBadge, { backgroundColor: tintColor }]}> 
            <ThemedText style={[styles.badgeText, { color: priceBadgeTextColor }]}>Rp {movie.price.toLocaleString('id-ID')}</ThemedText>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: iconBg }]}> 
            <IconSymbol name="star.fill" size={12} color={scheme === 'dark' ? '#ffd54f' : '#ffb300'} />
            <ThemedText style={[styles.ratingBadgeText, { color: ratingBadgeTextColor }]}>{movie.rating}</ThemedText>
          </View>
        </View>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title} numberOfLines={2}>
            {movie.title}
          </ThemedText>
          <ThemedText style={styles.genre}>{movie.genre}</ThemedText>
          <ThemedView style={styles.details}>
            <ThemedText style={styles.duration}>{movie.durationMin} min</ThemedText>
            <ThemedText style={[styles.rating, { color: tintColor }]}>Rating: {movie.rating}</ThemedText>
          </ThemedView>
          <ThemedText style={[styles.priceNote]}>
            Klik kartu untuk lihat detail
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
      
      {showActions && (
        isWeb ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: scheme === 'dark' ? '#444' : tintColor }]}
              onPress={handleEdit}
            >
              <IconSymbol name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
              onPress={handleDelete}
            >
              <IconSymbol name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View 
            entering={FadeIn.delay(200)}
            style={styles.actionButtons}
          >
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: scheme === 'dark' ? '#444' : tintColor }]}
              onPress={handleEdit}
            >
              <IconSymbol name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
              onPress={handleDelete}
            >
              <IconSymbol name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )
      )}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  touchable: {
    flexDirection: 'row',
  },
  posterWrapper: {
    position: 'relative',
    width: 120,
    height: 180,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  poster: {
    width: 120,
    height: 180,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  genre: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  duration: {
    fontSize: 12,
    opacity: 0.6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceNote: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  priceBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    backgroundColor: '#333',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});