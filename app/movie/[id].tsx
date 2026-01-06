import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMovieById, loading } = useMovieStorage();
  const movie = id ? getMovieById(String(id)) : undefined;
  const tint = useThemeColor({}, 'tint');

  const handleShare = async () => {
    if (!movie) return;
    try {
      await Share.share({
        message: `Tonton film ${movie.title} di Cinebook! Klik link ini: cinebook://movie/${movie.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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

        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>{movie.title}</ThemedText>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <IconSymbol name="square.and.arrow.up" size={24} color={tint} />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.meta}>{movie.genre} • {movie.durationMin}m • {movie.rating}</ThemedText>
        <ThemedText>{movie.synopsis}</ThemedText>

        {movie.status === 'now_playing' ? (
          <>
            <ThemedText style={[styles.sectionTitle, { color: tint }]}>Jadwal Tayang</ThemedText>
            <ThemedText>{movie.showtimes.join(' | ')}</ThemedText>
            <ThemedText style={styles.price}>Harga: Rp {movie.price.toLocaleString('id-ID')}</ThemedText>

            <TouchableOpacity
              style={[styles.buyButton, { backgroundColor: tint }]}
              onPress={() => router.push({ pathname: '/(tabs)/add', params: { movieId: movie.id } })}
            >
              <ThemedText style={styles.buyButtonText}>Beli Tiket</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <ThemedView style={[styles.comingSoonBadge, { borderColor: tint }]}>
            <ThemedText style={[styles.comingSoonText, { color: tint }]}>COMING SOON</ThemedText>
          </ThemedView>
        )}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  shareButton: {
    padding: 8,
  },
  meta: {
    opacity: 0.8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  price: {
    fontWeight: '600',
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
  comingSoonBadge: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignSelf: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});