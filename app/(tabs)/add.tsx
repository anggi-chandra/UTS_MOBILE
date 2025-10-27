import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOVIES } from '@/data/movies';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useBookingStorage } from '@/hooks/use-booking-storage';

type FormValues = {
  movieId: string;
  showtime: string;
  tickets: string; // keep as string for TextInput, convert later
  customerName: string;
};

export default function AddTicketScreen() {
  const params = useLocalSearchParams<{ movieId?: string }>();
  const router = useRouter();
  const { addBooking } = useBookingStorage();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { movieId: '', showtime: '', tickets: '1', customerName: '' },
    mode: 'onBlur',
  });

  const selectedMovie = MOVIES.find(m => m.id === watch('movieId'));

  useEffect(() => {
    if (params.movieId) {
      setValue('movieId', String(params.movieId));
    }
  }, [params.movieId, setValue]);

  const onSubmit = (values: FormValues) => {
    const qty = Number(values.tickets);
    if (!selectedMovie) {
      Toast.show({ type: 'error', text1: 'Pilih film terlebih dahulu' });
      return;
    }
    const total = qty * selectedMovie.price;
    // Simpan ke riwayat pemesanan
    const poster = typeof selectedMovie.poster === 'string' ? selectedMovie.poster : undefined;
    addBooking({
      movieId: selectedMovie.id,
      title: selectedMovie.title,
      showtime: values.showtime,
      quantity: qty,
      totalPrice: total,
      poster,
      customerName: values.customerName.trim(),
    });
    Toast.show({ type: 'success', text1: 'Tiket berhasil ditambahkan', text2: `${selectedMovie.title} • ${values.showtime} • ${qty} tiket • Total Rp ${total.toLocaleString('id-ID')}` });
    // Arahkan ke tab Riwayat
    router.push('/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Tambah Tiket</ThemedText>

      {/* Pilih Film */}
      <ThemedText>Film</ThemedText>
      <Controller
        control={control}
        name="movieId"
        rules={{ required: 'Film wajib dipilih' }}
        render={({ field: { onChange, value } }) => (
          <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
            <Picker.Item label="-- Pilih Film --" value="" />
            {MOVIES.map(m => (
              <Picker.Item key={m.id} label={m.title} value={m.id} />
            ))}
          </Picker>
        )}
      />
      {errors.movieId && <ThemedText style={styles.error}>{errors.movieId.message}</ThemedText>}

      {/* Jadwal Tayang tergantung Film */}
      <ThemedText>Jadwal Tayang</ThemedText>
      <Controller
        control={control}
        name="showtime"
        rules={{
          required: 'Jadwal wajib dipilih',
          validate: (v) => (selectedMovie && selectedMovie.showtimes.includes(v)) || 'Jadwal tidak valid',
        }}
        render={({ field: { onChange, value } }) => (
          <Picker selectedValue={value} onValueChange={onChange} enabled={!!selectedMovie} style={styles.picker}>
            <Picker.Item label={selectedMovie ? '-- Pilih Jadwal --' : 'Pilih film dulu'} value="" />
            {selectedMovie?.showtimes.map(t => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        )}
      />
      {errors.showtime && <ThemedText style={styles.error}>{errors.showtime.message}</ThemedText>}

      {/* Jumlah Tiket */}
      <ThemedText>Jumlah Tiket</ThemedText>
      <Controller
        control={control}
        name="tickets"
        rules={{
          required: 'Jumlah tiket wajib diisi',
          validate: (v) => {
            const n = Number(v);
            if (isNaN(n)) return 'Harus angka';
            if (n < 1) return 'Minimal 1 tiket';
            if (n > 10) return 'Maksimal 10 tiket';
            return true;
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            placeholder="1"
            style={styles.input}
          />
        )}
      />
      {errors.tickets && <ThemedText style={styles.error}>{errors.tickets.message}</ThemedText>}

      {/* Nama Pemesan */}
      <ThemedText>Nama Pemesan</ThemedText>
      <Controller
        control={control}
        name="customerName"
        rules={{ required: 'Nama wajib diisi', minLength: { value: 3, message: 'Minimal 3 karakter' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Nama lengkap"
            style={styles.input}
          />
        )}
      />
      {errors.customerName && <ThemedText style={styles.error}>{errors.customerName.message}</ThemedText>}

      <View style={{ height: 12 }} />
      <ThemedText type="link" onPress={handleSubmit(onSubmit)} style={styles.submit}>
        Simpan Pesanan
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  header: {
    marginBottom: 8,
  },
  picker: {
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  error: {
    color: 'crimson',
  },
  submit: {
    alignSelf: 'flex-start',
  },
});