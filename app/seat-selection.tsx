import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBookingStorage } from '@/hooks/use-booking-storage';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SeatSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ movieId?: string; showtime?: string; tickets?: string; customerName?: string }>();
  const tint = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  // Hitung warna teks yang kontras terhadap background (tint)
  const getContrastTextColor = (bg: string, fallback: string) => {
    try {
      if (!bg.startsWith('#')) return fallback;
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

  const { getMovieById } = useMovieStorage();
  const { fetchBookedSeats } = useBookingStorage();
  const movie = useMemo(() => (params.movieId ? getMovieById(String(params.movieId)) : undefined), [params.movieId, getMovieById]);
  const qty = Number(params.tickets ?? '0');

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);

  React.useEffect(() => {
    if (movie && params.showtime) {
      fetchBookedSeats(movie.id, String(params.showtime)).then(setOccupiedSeats);
    }
  }, [movie, params.showtime]);

  const toggleSeat = (seat: string) => {
    if (occupiedSeats.includes(seat)) return;

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.header}>Pilih Kursi</ThemedText>
        {movie ? (
          <>
            <ThemedText style={styles.subHeader}>{movie.title}</ThemedText>
            <ThemedText style={styles.subHeader}>Jadwal: {params.showtime}</ThemedText>
            <ThemedText style={styles.subHeader}>Jumlah tiket: {qty}</ThemedText>

            {/* Screen Indicator */}
            <View style={styles.screenContainer}>
              <View style={[styles.screenLine, { borderColor: tint }]} />
              <ThemedText style={styles.screenText}>Layar Bioskop</ThemedText>
            </View>

            <View style={styles.grid}>
              {rows.map((rowName) => (
                <View key={rowName} style={styles.rowContainer}>
                  {/* Left Side (1-5) */}
                  {cols.slice(0, 5).map((colNum) => {
                    const seat = `${rowName}${colNum}`;
                    const isOccupied = occupiedSeats.includes(seat);
                    const selected = selectedSeats.includes(seat);
                    return (
                      <TouchableOpacity
                        key={seat}
                        disabled={isOccupied}
                        style={[
                          styles.seat,
                          {
                            borderColor: isOccupied ? '#555' : (selected ? tint : iconColor),
                            backgroundColor: isOccupied ? '#555' : (selected ? tint : 'transparent'),
                            opacity: isOccupied ? 0.5 : 1,
                          },
                        ]}
                        onPress={() => toggleSeat(seat)}
                      >
                        <ThemedText
                          style={[
                            styles.seatLabel,
                            {
                              color: isOccupied
                                ? '#aaa'
                                : (selected ? getContrastTextColor(tint, '#fff') : textColor),
                              fontWeight: selected ? 'bold' : 'normal',
                            },
                          ]}
                        >
                          {seat}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Aisle Gap */}
                  <View style={styles.aisle} />

                  {/* Right Side (6-10) */}
                  {cols.slice(5).map((colNum) => {
                    const seat = `${rowName}${colNum}`;
                    const isOccupied = occupiedSeats.includes(seat);
                    const selected = selectedSeats.includes(seat);
                    return (
                      <TouchableOpacity
                        key={seat}
                        disabled={isOccupied}
                        style={[
                          styles.seat,
                          {
                            borderColor: isOccupied ? '#555' : (selected ? tint : iconColor),
                            backgroundColor: isOccupied ? '#555' : (selected ? tint : 'transparent'),
                            opacity: isOccupied ? 0.5 : 1,
                          },
                        ]}
                        onPress={() => toggleSeat(seat)}
                      >
                        <ThemedText
                          style={[
                            styles.seatLabel,
                            {
                              color: isOccupied
                                ? '#aaa'
                                : (selected ? getContrastTextColor(tint, '#fff') : textColor),
                              fontWeight: selected ? 'bold' : 'normal',
                            },
                          ]}
                        >
                          {seat}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { borderColor: iconColor }]} />
                  <ThemedText style={styles.legendText}>Tersedia</ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: tint, borderColor: tint }]} />
                  <ThemedText style={styles.legendText}>Dipilih</ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#555', borderColor: '#555', opacity: 0.5 }]} />
                  <ThemedText style={styles.legendText}>Terisi</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                disabled={!canProceed}
                onPress={handleProceed}
                style={[styles.proceedBtn, { backgroundColor: canProceed ? tint : '#aaa' }]}
              >
                <ThemedText
                  style={[
                    styles.proceedText,
                    { color: getContrastTextColor(canProceed ? tint : '#aaa', '#fff') },
                  ]}
                >
                  Lanjut Pembayaran
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ThemedText>Data film tidak ditemukan</ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 4, textAlign: 'center' },
  subHeader: { fontSize: 14, opacity: 0.8, textAlign: 'center', marginBottom: 2 },

  screenContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  screenLine: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    borderTopWidth: 4,
    opacity: 0.5,
    marginBottom: 8,
    transform: [{ perspective: 100 }, { rotateX: '10deg' }], // Slight 3D effect attempt
  },
  screenText: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  grid: {
    gap: 10,
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aisle: {
    width: 24, // Gap between left and right columns
  },
  seat: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  seatLabel: {
    fontSize: 10,
  },

  footer: {
    marginTop: 32,
    gap: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
  },

  proceedBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});