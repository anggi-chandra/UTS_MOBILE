# CINEBOOK — Aplikasi Pemesanan Tiket dan Manajemen Film

CINEBOOK adalah aplikasi berbasis Expo/React Native untuk melihat daftar film, mengelola data film, membeli tiket, memilih kursi, dan melihat riwayat pemesanan. Aplikasi mendukung tema terang/gelap dan latar belakang gradien yang modern.

## Fitur Utama

- Daftar Film dengan filter genre dan aksi cepat (edit/hapus)
- Detail Film: poster, genre, durasi, rating, sinopsis, jadwal tayang
- Beli Tiket: pilih film, jadwal tayang, jumlah tiket, dan nama pelanggan
- Pemilihan Kursi dan Ringkasan Pembayaran dengan total harga
- Riwayat Pemesanan di tab Explore
- Manajemen Film: tambah dan ubah data film melalui form khusus
- Tema terang/gelap dengan latar belakang gradien berbasis `expo-linear-gradient`
- Header global “CINEBOOK” dan tab bar yang dimodernkan
- Penyimpanan data film dan pemesanan (Web: `localStorage`, Non‑Web: memori proses)

## Teknologi yang Digunakan

- `Expo` dan `React Native`
- `expo-router` untuk routing berbasis file
- `TypeScript` untuk type safety
- `expo-linear-gradient` untuk latar gradien
- `expo-image` untuk render poster
- `react-hook-form` dan `@react-native-picker/picker` untuk form
- `react-native-reanimated` untuk animasi UI
- `react-native-toast-message` untuk notifikasi

## Struktur Proyek Singkat

- `app/(tabs)/index.tsx` — Beranda, daftar film dan filter genre
- `app/movie/[id].tsx` — Detail film
- `app/(tabs)/add.tsx` — Form beli tiket
- `app/seat-selection.tsx` — Pemilihan kursi
- `app/payment.tsx` — Ringkasan pembayaran
- `app/manage-movie.tsx` — Form tambah/ubah film
- `components/` — Komponen UI bertema (`ThemedView`, `ThemedText`, `MovieCard`, dll.)
- `hooks/` — Penyimpanan film/pemesanan, tema, dan utilitas
- `data/movies.ts` — Data default film dan versi data (`MOVIES_VERSION`)
- `constants/theme.ts` — Palet warna dan gradien (terang/gelap)

## Menjalankan Aplikasi

1. Instal dependensi

   ```bash
   npm install
   ```

2. Jalankan pengembangan

   ```bash
   npx expo start
   ```

   Atau jalankan khusus web:

   ```bash
   npm run web
   ```

## Sinkronisasi Data Film di Web

- Aplikasi web membaca data film dari `localStorage` agar perubahan bertahan antar sesi.
- Saat Anda mengubah `data/movies.ts`, konstanta `MOVIES_VERSION` memastikan web memuat ulang data default secara otomatis bila versi berubah.
- Jika perlu reset manual, hapus item storage:

  ```js
  localStorage.removeItem('cinema_movies');
  localStorage.removeItem('cinema_movies_version');
  location.reload();
  ```

## Kustomisasi Gradien Latar

- Gradien global diatur lewat `ThemedView` dengan prop `useGradient`.
- Anda dapat mengoverride warna gradien per layar:

  ```tsx
  <ThemedView
    useGradient
    gradientColors={{ light: ['#F7F9FC', '#EAF3FF'], dark: ['#0F1216', '#12202F'] }}
    style={{ flex: 1 }}
  >
    {/* Konten */}
  </ThemedView>
  ```

## Catatan Pengembangan

- Daftar film berasal dari `useMovieStorage()` yang menyatukan data default dan storage.
- Ekspor web dan native menggunakan komponen bertema untuk konsistensi warna dan aksesibilitas.

## Lisensi

Proyek ini dibuat untuk kebutuhan pembelajaran/pengembangan aplikasi. Silakan sesuaikan sesuai kebutuhan Anda.
