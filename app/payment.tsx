import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBookingStorage } from '@/hooks/use-booking-storage';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

type Method = 'qris' | 'cash' | 'card';

export default function PaymentScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const params = useLocalSearchParams<{ movieId?: string; showtime?: string; tickets?: string; customerName?: string; seats?: string }>();
  const { addBooking } = useBookingStorage();
  const [method, setMethod] = useState<Method>('qris');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hitung warna teks yang kontras terhadap background tint (dark mode tint = #fff)
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
  const contrastOnTint = getContrastTextColor(tint, '#fff');

  const { getMovieById } = useMovieStorage();
  const movie = useMemo(() => (params.movieId ? getMovieById(String(params.movieId)) : undefined), [params.movieId, getMovieById]);
  const qty = Number(params.tickets ?? '0');
  const seats = (params.seats ?? '').split(',').filter(Boolean);
  const total = useMemo(() => (movie ? qty * movie.price : 0), [movie, qty]);

  const handlePay = async () => {
    if (!movie || !params.showtime || seats.length !== qty) {
      Toast.show({ type: 'error', text1: 'Data belum lengkap' });
      return;
    }

    setIsProcessing(true);
    try {
      const poster = typeof movie.poster === 'string' ? movie.poster : undefined;
      const result = await addBooking({
        movieId: movie.id,
        title: movie.title,
        showtime: String(params.showtime),
        quantity: qty,
        totalPrice: total,
        poster,
        customerName: String(params.customerName ?? ''),
        seats,
        paymentStatus: 'paid',
        paymentMethod: method,
      });

      if (result) {
        Toast.show({ type: 'success', text1: 'Pembayaran berhasil', text2: `${movie.title} • ${params.showtime} • Kursi: ${seats.join(', ')} • Total Rp ${total.toLocaleString('id-ID')}` });
        router.push('/explore');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Toast.show({ type: 'error', text1: 'Terjadi kesalahan saat memproses pembayaran' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Pembayaran</ThemedText>
      {movie ? (
        <>
          <ThemedView style={styles.summaryCard}>
            <ThemedText type="subtitle" style={styles.movieTitle}>{movie.title}</ThemedText>
            <View style={styles.summaryRow}>
              <IconSymbol name="film" size={16} color={tint} />
              <ThemedText style={styles.summaryText}>Jadwal: {params.showtime}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <IconSymbol name="pencil" size={16} color={tint} />
              <ThemedText style={styles.summaryText}>Kursi: {seats.join(', ')}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <IconSymbol name="plus" size={16} color={tint} />
              <ThemedText style={styles.summaryText}>Jumlah: {qty} tiket</ThemedText>
            </View>
            <ThemedText style={[styles.total, { color: tint }]}>Total: Rp {total.toLocaleString('id-ID')}</ThemedText>
          </ThemedView>

          <View style={styles.methods}>
            {(['qris', 'cash', 'card'] as Method[]).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setMethod(m)}
                style={[styles.methodBtn, { backgroundColor: method === m ? tint : 'transparent', borderColor: tint }]}
              >
                <View style={styles.methodInner}>
                  {m === 'qris' && <IconSymbol name="qrcode" size={18} color={method === m ? contrastOnTint : tint} />}
                  {m === 'cash' && <IconSymbol name="banknote" size={18} color={method === m ? contrastOnTint : tint} />}
                  {m === 'card' && <IconSymbol name="creditcard" size={18} color={method === m ? contrastOnTint : tint} />}
                  <ThemedText style={[styles.methodText, { color: method === m ? contrastOnTint : undefined }]}>
                    {m === 'qris' ? 'QRIS' : m === 'cash' ? 'Cash' : 'Card'}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handlePay}
            disabled={isProcessing}
            style={[styles.payBtn, { backgroundColor: isProcessing ? '#ccc' : tint }]}
          >
            <ThemedText style={[styles.payText, { color: isProcessing ? '#666' : contrastOnTint }]}>
              {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
            </ThemedText>
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
  summaryCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  movieTitle: { fontWeight: '700', marginBottom: 6 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  summaryText: {},
  total: { marginTop: 8, fontWeight: '700' },
  methods: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  methodBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  methodInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodText: { fontWeight: '600' },
  payBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  payText: { color: '#fff', fontWeight: '700' },
});