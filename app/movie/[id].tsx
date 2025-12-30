import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMovieById, loading } = useMovieStorage();
  const movie = id ? getMovieById(String(id)) : undefined;

  if (loading) {
    return (
      <ThemedView style={styles.center}><ThemedText>Memuat detail film...</ThemedText></ThemedView>
    );
  }

  if (!movie) {
    return (
      <ThemedView style={styles.center}><ThemedText>Film tidak ditemukan.</ThemedText></ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <Image
          source={typeof movie.poster === 'string' ? { uri: movie.poster } : movie.poster}
          style={styles.poster}
          contentFit="cover"
        />
        <ThemedText type="title" style={styles.title}>{movie.title}</ThemedText>
        <ThemedText style={styles.meta}>{movie.genre} • {movie.durationMin}m • {movie.rating}</ThemedText>
        <ThemedText>{movie.synopsis}</ThemedText>
        <ThemedText style={styles.sectionTitle}>Jadwal Tayang</ThemedText>
        <ThemedText>{movie.showtimes.join(' | ')}</ThemedText>
        <ThemedText style={styles.price}>Harga: Rp {movie.price.toLocaleString('id-ID')}</ThemedText>

        <TouchableOpacity
          style={[styles.buyButton, { backgroundColor: Colors.light.tint }]}
          onPress={() => router.push({ pathname: '/(tabs)/add', params: { movieId: movie.id } })}
        >
          <ThemedText style={styles.buyButtonText}>Beli Tiket</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  container: {
    flex: 1,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  poster: {
    width: '100%',
    height: 260,
    borderRadius: 12,
  },
  title: {
    marginTop: 8,
  },
  meta: {
    opacity: 0.8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.light.tint,
  },
  price: {
    fontWeight: '600',
  },
  link: {
    marginTop: 8,
  },
  buyButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});