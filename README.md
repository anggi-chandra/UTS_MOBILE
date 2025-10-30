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

Untuk bukti screenshot dari aplikasi nya :
![Screenshot_2025-10-30-21-52-37-934_host exp exponent 1](https://github.com/user-attachments/assets/8ef92b74-dc57-4a68-9456-941dda3b20c1)
![Screenshot_2025-10-30-21-52-40-542_host exp exponent 1](https://github.com/user-attachments/assets/553d3340-01b1-42fb-a6af-26c22085ba36)
![Screenshot_2025-10-30-21-53-05-545_host exp exponent 1](https://github.com/user-attachments/assets/cfb49dc9-b974-450d-b90a-64468f7d37e3)
![Screenshot_2025-10-30-21-54-48-964_host exp exponent 2](https://github.com/user-attachments/assets/917fd6e3-daca-443b-ae5e-e8f5da27766c)
![Screenshot_2025-10-30-21-55-03-395_host exp exponent 1](https://github.com/user-attachments/assets/b03ce656-359a-4717-9cf2-bf72d011e733)
![Screenshot_2025-10-30-21-52-45-949_host exp exponent 1](https://github.com/user-attachments/assets/db0c32e3-654f-47ca-bb34-67c106ebd0d0)
![Screenshot_2025-10-30-21-53-42-452_host exp exponent 2](https://github.com/user-attachments/assets/c8ed27e3-84b0-4b32-8d30-78a40b1f7a36)

LINK LOOM
https://www.loom.com/share/f1549d9c2b77436bbaaf60b860dcf327
