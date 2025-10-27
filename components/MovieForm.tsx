import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  useWindowDimensions,
  Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Movie } from '@/data/movies';
import Toast from 'react-native-toast-message';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface MovieFormData {
  title: string;
  genre: string;
  durationMin: string; // input string, converted to number
  rating: string; // classification like PG-13
  synopsis: string;
  price: string; // input string, converted to number
  poster: string; // URL string for new movies
  showtimes: string; // comma-separated input
}

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (data: Omit<Movie, 'id'>) => void;
  onCancel: () => void;
}

export function MovieForm({ movie, onSubmit, onCancel }: MovieFormProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const { control, handleSubmit, formState: { errors }, watch } = useForm<MovieFormData>({
    defaultValues: {
      title: movie?.title || '',
      genre: movie?.genre || '',
      durationMin: movie?.durationMin?.toString() || '',
      rating: movie?.rating || '',
      synopsis: movie?.synopsis || '',
      price: movie?.price?.toString() || '',
      poster: typeof movie?.poster === 'string' ? (movie?.poster as string) : '',
      showtimes: movie?.showtimes?.join(', ') || '',
    }
  });

  const [imagePreview, setImagePreview] = useState<string>(
    typeof movie?.poster === 'string' ? (movie?.poster as string) : ''
  );

  const onFormSubmit = (data: MovieFormData) => {
    try {
      const movieData: Omit<Movie, 'id'> = {
        title: data.title.trim(),
        genre: data.genre.trim(),
        durationMin: parseInt(data.durationMin, 10),
        rating: data.rating.trim(),
        synopsis: data.synopsis.trim(),
        price: parseInt(data.price),
        poster: data.poster.trim() || (movie ? movie.poster : ''),
        showtimes: data.showtimes.split(',').map(time => time.trim()).filter(time => time.length > 0),
      };

      onSubmit(movieData);
      Toast.show({
        type: 'success',
        text1: movie ? 'Film berhasil diupdate!' : 'Film berhasil ditambahkan!',
        text2: `${movieData.title} telah disimpan`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gagal menyimpan film',
        text2: 'Terjadi kesalahan saat menyimpan data',
      });
    }
  };

  const posterUrl = watch('poster');
  React.useEffect(() => {
    setImagePreview(posterUrl);
  }, [posterUrl]);

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={[
          styles.formContainer,
          isTablet && styles.formContainerTablet
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>
          {movie ? 'Edit Film' : 'Tambah Film Baru'}
        </ThemedText>

        {/* Image Preview */}
        {imagePreview ? (
          <Animated.View entering={FadeIn} style={styles.imagePreview}>
            <ThemedText style={styles.label}>Preview Poster:</ThemedText>
            <Animated.Image 
              source={{ uri: imagePreview }} 
              style={styles.previewImage}
              onError={() => setImagePreview('')}
            />
          </Animated.View>
        ) : null}

        {/* Title */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Judul Film *</ThemedText>
          <Controller
            control={control}
            name="title"
            rules={{ 
              required: 'Judul film wajib diisi',
              minLength: { value: 2, message: 'Judul minimal 2 karakter' }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Masukkan judul film"
                placeholderTextColor={borderColor}
              />
            )}
          />
          {errors.title && (
            <ThemedText style={styles.errorText}>{errors.title.message}</ThemedText>
          )}
        </ThemedView>

        {/* Genre */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Genre *</ThemedText>
          <Controller
            control={control}
            name="genre"
            rules={{ required: 'Genre wajib diisi' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Contoh: Action, Drama, Comedy"
                placeholderTextColor={borderColor}
              />
            )}
          />
          {errors.genre && (
            <ThemedText style={styles.errorText}>{errors.genre.message}</ThemedText>
          )}
        </ThemedView>

        {/* Duration (minutes) */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Durasi (menit) *</ThemedText>
          <Controller
            control={control}
            name="durationMin"
            rules={{ required: 'Durasi wajib diisi' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Contoh: 120"
                placeholderTextColor={borderColor}
                keyboardType="numeric"
              />
            )}
          />
          {errors.durationMin && (
            <ThemedText style={styles.errorText}>{errors.durationMin.message}</ThemedText>
          )}
        </ThemedView>

        {/* Rating */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Rating (1-10) *</ThemedText>
          <Controller
            control={control}
            name="rating"
            rules={{ 
              required: 'Rating wajib diisi',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Contoh: PG-13"
                placeholderTextColor={borderColor}
              />
            )}
          />
          {errors.rating && (
            <ThemedText style={styles.errorText}>{errors.rating.message}</ThemedText>
          )}
        </ThemedView>

        {/* Price */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Harga Tiket (Rp) *</ThemedText>
          <Controller
            control={control}
            name="price"
            rules={{ 
              required: 'Harga wajib diisi',
              pattern: {
                value: /^[0-9]+$/,
                message: 'Harga harus berupa angka'
              },
              min: { value: 1000, message: 'Harga minimal Rp 1.000' }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Contoh: 50000"
                placeholderTextColor={borderColor}
                keyboardType="numeric"
              />
            )}
          />
          {errors.price && (
            <ThemedText style={styles.errorText}>{errors.price.message}</ThemedText>
          )}
        </ThemedView>

        {/* Poster URL */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>URL Poster *</ThemedText>
          <Controller
            control={control}
            name="poster"
            rules={{ 
              required: 'URL poster wajib diisi',
              pattern: {
                value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                message: 'URL harus valid dan berformat gambar (jpg, png, gif, webp)'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="https://example.com/poster.jpg"
                placeholderTextColor={borderColor}
                autoCapitalize="none"
              />
            )}
          />
          {errors.poster && (
            <ThemedText style={styles.errorText}>{errors.poster.message}</ThemedText>
          )}
        </ThemedView>

        {/* Showtimes */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Jadwal Tayang *</ThemedText>
          <ThemedText style={styles.helperText}>
            Pisahkan dengan koma. Contoh: 10:00, 13:00, 16:00, 19:00
          </ThemedText>
          <Controller
            control={control}
            name="showtimes"
            rules={{ 
              required: 'Jadwal tayang wajib diisi',
              validate: (value) => {
                const times = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
                return times.length > 0 || 'Minimal satu jadwal tayang';
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="10:00, 13:00, 16:00, 19:00"
                placeholderTextColor={borderColor}
              />
            )}
          />
          {errors.showtimes && (
            <ThemedText style={styles.errorText}>{errors.showtimes.message}</ThemedText>
          )}
        </ThemedView>

        {/* Synopsis */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Sinopsis *</ThemedText>
          <Controller
            control={control}
            name="synopsis"
            rules={{ 
              required: 'Sinopsis wajib diisi',
              minLength: { value: 20, message: 'Sinopsis minimal 20 karakter' }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.textArea, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Masukkan sinopsis film..."
                placeholderTextColor={borderColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
          {errors.synopsis && (
            <ThemedText style={styles.errorText}>{errors.synopsis.message}</ThemedText>
          )}
        </ThemedView>

        {/* Buttons */}
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor }]}
            onPress={onCancel}
          >
            <ThemedText style={[styles.buttonText, { color: textColor }]}>
              Batal
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit(onFormSubmit)}
          >
            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
              {movie ? 'Update Film' : 'Simpan Film'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formContainerTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  imagePreview: {
    marginBottom: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    // backgroundColor will be set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});