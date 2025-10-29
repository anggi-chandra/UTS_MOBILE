import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MOVIES } from '@/data/movies';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBookingStorage } from '@/hooks/use-booking-storage';
import Toast from 'react-native-toast-message';

type Method = 'qris' | 'cash' | 'card';

export default function PaymentScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const params = useLocalSearchParams<{ movieId?: string; showtime?: string; tickets?: string; customerName?: string; seats?: string }>();
  const { addBooking } = useBookingStorage();
  const [method, setMethod] = useState<Method>('qris');

  const movie = useMemo(() => MOVIES.find(m => m.id === params.movieId), [params.movieId]);
  const qty = Number(params.tickets ?? '0');
  const seats = (params.seats ?? '').split(',').filter(Boolean);
  const total = useMemo(() => (movie ? qty * movie.price : 0), [movie, qty]);

  const handlePay = () => {
    if (!movie || !params.showtime || seats.length !== qty) {
      Toast.show({ type: 'error', text1: 'Data belum lengkap' });
      return;
    }
    const poster = typeof movie.poster === 'string' ? movie.poster : undefined;
    addBooking({
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
    Toast.show({ type: 'success', text1: 'Pembayaran berhasil', text2: `${movie.title} • ${params.showtime} • Kursi: ${seats.join(', ')} • Total Rp ${total.toLocaleString('id-ID')}` });
    router.push('/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Pembayaran</ThemedText>
      {movie ? (
        <>
          <ThemedText>{movie.title}</ThemedText>
          <ThemedText>Jadwal: {params.showtime}</ThemedText>
          <ThemedText>Kursi: {seats.join(', ')}</ThemedText>
          <ThemedText>Jumlah: {qty} tiket</ThemedText>
          <ThemedText style={[styles.total, { color: tint }]}>Total: Rp {total.toLocaleString('id-ID')}</ThemedText>

          <View style={styles.methods}>
            {(['qris','cash','card'] as Method[]).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setMethod(m)}
                style={[styles.methodBtn, { backgroundColor: method === m ? tint : 'transparent', borderColor: tint }]}
              >
                <ThemedText style={{ color: method === m ? '#fff' : undefined }}>
                  {m === 'qris' ? 'QRIS' : m === 'cash' ? 'Cash' : 'Card'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handlePay} style={[styles.payBtn, { backgroundColor: tint }]}> 
            <ThemedText style={styles.payText}>Bayar</ThemedText>
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
  total: { marginVertical: 8 },
  methods: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  methodBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  payBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  payText: { color: '#fff', fontWeight: '600' },
});