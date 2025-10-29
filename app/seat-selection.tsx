import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MOVIES } from '@/data/movies';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SeatSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ movieId?: string; showtime?: string; tickets?: string; customerName?: string }>();
  const tint = useThemeColor({}, 'tint');

  const movie = useMemo(() => MOVIES.find(m => m.id === params.movieId), [params.movieId]);
  const qty = Number(params.tickets ?? '0');

  const seatsAll = useMemo(() => {
    const rows = ['A','B','C','D','E','F','G','H'];
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);
    return rows.flatMap(r => cols.map(c => `${r}${c}`));
  }, []);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seat: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      }
      if (prev.length >= qty) return prev; // batasi sesuai jumlah tiket
      return [...prev, seat];
    });
  };

  const canProceed = selectedSeats.length === qty && movie && params.showtime;

  const handleProceed = () => {
    if (!canProceed || !movie) return;
    const q = new URLSearchParams({
      movieId: movie.id,
      showtime: String(params.showtime),
      tickets: String(qty),
      customerName: String(params.customerName ?? ''),
      seats: selectedSeats.join(','),
    });
    router.push(`/payment?${q.toString()}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Pilih Kursi</ThemedText>
      {movie ? (
        <>
          <ThemedText>{movie.title}</ThemedText>
          <ThemedText>Jadwal: {params.showtime}</ThemedText>
          <ThemedText>Jumlah tiket: {qty}</ThemedText>
          <View style={styles.grid}>
            {seatsAll.map(seat => {
              const selected = selectedSeats.includes(seat);
              return (
                <TouchableOpacity
                  key={seat}
                  style={[styles.seat, { borderColor: selected ? tint : '#ccc', backgroundColor: selected ? tint : 'transparent' }]}
                  onPress={() => toggleSeat(seat)}
                >
                  <ThemedText style={[styles.seatLabel, { color: selected ? '#fff' : undefined }]}>{seat}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            disabled={!canProceed}
            onPress={handleProceed}
            style={[styles.proceedBtn, { backgroundColor: canProceed ? tint : '#aaa' }]}
          >
            <ThemedText style={styles.proceedText}>Lanjut Pembayaran</ThemedText>
          </TouchableOpacity>
        </>
      ) : (
        <ThemedText>Data film tidak ditemukan</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  header: { marginBottom: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  seat: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatLabel: { fontSize: 12 },
  proceedBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  proceedText: { color: '#fff', fontWeight: '600' },
});