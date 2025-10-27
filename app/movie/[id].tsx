import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, ScrollView } from 'react-native';
import { MOVIES } from '@/data/movies';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movie = MOVIES.find((m) => m.id === id);

  if (!movie) {
    return (
      <ThemedView style={styles.center}><ThemedText>Film tidak ditemukan.</ThemedText></ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <Image source={movie.poster} style={styles.poster} contentFit="cover" />
        <ThemedText type="title" style={styles.title}>{movie.title}</ThemedText>
        <ThemedText style={styles.meta}>{movie.genre} • {movie.durationMin}m • {movie.rating}</ThemedText>
        <ThemedText>{movie.synopsis}</ThemedText>
        <ThemedText style={styles.sectionTitle}>Jadwal Tayang</ThemedText>
        <ThemedText>{movie.showtimes.join(' | ')}</ThemedText>
        <ThemedText style={styles.price}>Harga: Rp {movie.price.toLocaleString('id-ID')}</ThemedText>

        <ThemedText type="link" style={styles.link} onPress={() => router.push({ pathname: '/(tabs)/add', params: { movieId: movie.id } })}>
          Beli Tiket
        </ThemedText>
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
});