import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Movie } from '@/data/movies';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface MovieFormData {
  title: string;
  genre: string;
  durationMin: string; // input string, converted to number
  rating: string; // classification like PG-13
  synopsis: string;
  price: string; // input string, converted to number
  poster: string; // URL string for new movies
  showtimes: string; // comma-separated input
  status: 'now_playing' | 'coming_soon';
}

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (data: Omit<Movie, 'id'>) => Promise<void> | void;
  onCancel: () => void;
}

export function MovieForm({ movie, onSubmit, onCancel }: MovieFormProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconBg = useThemeColor({}, 'icon');
  const { scheme } = useColorSchemeController();
  const primaryBtnBg = scheme === 'dark' ? iconBg : tintColor;

  const { control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<MovieFormData>({
    defaultValues: {
      title: movie?.title || '',
      genre: movie?.genre || '',
      durationMin: movie?.durationMin?.toString() || '',
      rating: movie?.rating || '',
      synopsis: movie?.synopsis || '',
      price: movie?.price?.toString() || '',
      poster: typeof movie?.poster === 'string' ? (movie?.poster as string) : '',
      showtimes: movie?.showtimes?.join(', ') || '',
      status: movie?.status || 'now_playing',
    }
  });

  React.useEffect(() => {
    if (movie) {
      reset({
        title: movie.title,
        genre: movie.genre,
        durationMin: movie.durationMin.toString(),
        rating: movie.rating,
        synopsis: movie.synopsis,
        price: movie.price.toString(),
        poster: typeof movie.poster === 'string' ? (movie.poster as string) : '',
        showtimes: movie.showtimes?.join(', ') || '',
        status: movie.status || 'now_playing',
      });
      setImagePreview(typeof movie.poster === 'string' ? (movie.poster as string) : '');
    }
  }, [movie, reset]);

  const [imagePreview, setImagePreview] = useState<string>(
    typeof movie?.poster === 'string' ? (movie?.poster as string) : ''
  );
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  const onFormSubmit = async (data: MovieFormData) => {
    try {
      let posterUri = (imagePreview && imagePreview.trim().length > 0) ? imagePreview.trim() : data.poster.trim();

      if (!posterUri) {
        Toast.show({
          type: 'error',
          text1: 'Poster wajib diisi',
          text2: 'Upload gambar atau masukkan URL poster',
        });
        return;
      }

      // Upload image if it's a local URI
      if (!posterUri.startsWith('http')) {
        try {
          const { supabase } = require('@/lib/supabase');

          // Determine extension from mimeType if available, otherwise fallback to uri
          let ext = 'jpg';
          if (imageMimeType) {
            if (imageMimeType === 'image/png') ext = 'png';
            else if (imageMimeType === 'image/webp') ext = 'webp';
            else if (imageMimeType === 'image/jpeg') ext = 'jpg';
          } else {
            ext = posterUri.split('.').pop() || 'jpg';
          }

          const fileName = `${Date.now()}.${ext}`;

          if (Platform.OS === 'web') {
            const res = await fetch(posterUri);
            const blob = await res.blob();
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('posters')
              .upload(fileName, blob, {
                contentType: imageMimeType || blob.type || 'image/jpeg'
              });
            if (uploadError) throw uploadError;
          } else {
            // Native: use FileSystem and base64
            const base64 = await FileSystem.readAsStringAsync(posterUri, {
              encoding: 'base64',
            });
            const arrayBuffer = decode(base64);

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('posters')
              .upload(fileName, arrayBuffer, {
                contentType: imageMimeType || 'image/jpeg',
                upsert: false
              });
            if (uploadError) throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('posters')
            .getPublicUrl(fileName);

          posterUri = publicUrl;
        } catch (uploadErr: any) {
          console.error('Upload error:', uploadErr);
          Toast.show({
            type: 'error',
            text1: 'Gagal upload gambar',
            text2: uploadErr.message,
          });
          return;
        }
      }

      const movieData: Omit<Movie, 'id'> = {
        title: data.title.trim(),
        genre: data.genre.trim(),
        durationMin: parseInt(data.durationMin, 10),
        rating: data.rating.trim(),
        synopsis: data.synopsis.trim(),
        price: parseInt(data.price),
        poster: posterUri || (movie ? movie.poster : ''),
        showtimes: data.showtimes.split(',').map(time => time.trim()).filter(time => time.length > 0),
        status: data.status,
      };

      await onSubmit(movieData);
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

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Izin ditolak', 'Berikan izin akses galeri untuk upload poster.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        setImagePreview(uri);
        if (asset.mimeType) {
          setImageMimeType(asset.mimeType);
        }
        // Sinkronkan ke field form agar ikut tersimpan
        setValue('poster', uri, { shouldValidate: true });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Gagal memilih gambar' });
    }
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
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
          <View style={styles.imagePreview}>
            <ThemedText style={styles.label}>Preview Poster:</ThemedText>
            <Image
              source={{ uri: imagePreview }}
              style={styles.previewImage}
              onError={() => setImagePreview('')}
            />
          </View>
        ) : null}

        {/* Poster Upload */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Poster Film</ThemedText>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TouchableOpacity
              style={[styles.uploadButton, { borderColor, backgroundColor: 'transparent', borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }]}
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={20} color={textColor} />
              <ThemedText style={{ color: textColor }}>Pilih dari Galeri</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={[styles.label, { fontSize: 12, marginBottom: 5 }]}>Atau masukkan URL:</ThemedText>
          <Controller
            control={control}
            name="poster"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="https://example.com/poster.jpg"
                placeholderTextColor={borderColor}
              />
            )}
          />
        </ThemedView>

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
          <ThemedText style={styles.label}>Klasifikasi Usia *</ThemedText>
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

        {/* Status */}
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Status Film *</ThemedText>
          <Controller
            control={control}
            name="status"
            rules={{ required: 'Status wajib dipilih' }}
            render={({ field: { onChange, value } }) => (
              <View style={[styles.input, { borderColor, padding: 0, justifyContent: 'center' }]}>
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    onChange(itemValue);
                    // Reset fields if switching to coming_soon
                    if (itemValue === 'coming_soon') {
                      setValue('price', '0');
                      setValue('showtimes', '-');
                    } else {
                      if (watch('price') === '0') setValue('price', '');
                      if (watch('showtimes') === '-') setValue('showtimes', '');
                    }
                  }}
                  style={{ color: textColor }}
                  dropdownIconColor={textColor}
                >
                  <Picker.Item label="Now Playing" value="now_playing" />
                  <Picker.Item label="Coming Soon" value="coming_soon" />
                </Picker>
              </View>
            )}
          />
        </ThemedView>

        {/* Price - Only show if Now Playing */}
        {watch('status') === 'now_playing' && (
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
        )}

        {/* Showtimes - Only show if Now Playing */}
        {watch('status') === 'now_playing' && (
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
        )}

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
            style={[styles.button, styles.submitButton, { backgroundColor: primaryBtnBg }]}
            onPress={handleSubmit(onFormSubmit)}
          >
            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
              {movie ? 'Update Film' : 'Simpan Film'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </View>
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
  uploadButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 0,
    marginBottom: 10,
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