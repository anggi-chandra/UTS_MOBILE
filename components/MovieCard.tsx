import React from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
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
    Alert.alert(
      'Hapus Film',
      `Apakah Anda yakin ingin menghapus film "${movie.title}"?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
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

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100)}
      exiting={FadeOut}
      layout={Layout}
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
        <Image 
          source={typeof movie.poster === 'string' ? { uri: movie.poster } : movie.poster} 
          style={styles.poster} 
        />
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title} numberOfLines={2}>
            {movie.title}
          </ThemedText>
          <ThemedText style={styles.genre}>{movie.genre}</ThemedText>
          <ThemedView style={styles.details}>
            <ThemedText style={styles.duration}>{movie.durationMin} min</ThemedText>
            <ThemedText style={[styles.rating, { color: tintColor }]}>Rating: {movie.rating}</ThemedText>
          </ThemedView>
          <ThemedText style={[styles.price, { color: tintColor }]}>
            Rp {movie.price.toLocaleString('id-ID')}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
      
      {showActions && (
        <Animated.View 
          entering={FadeIn.delay(200)}
          style={styles.actionButtons}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor }]}
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
      )}
    </Animated.View>
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
  price: {
    fontSize: 16,
    fontWeight: '700',
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
});