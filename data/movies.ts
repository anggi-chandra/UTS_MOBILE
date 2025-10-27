export type Movie = {
  id: string;
  title: string;
  genre: string;
  durationMin: number;
  rating: string;
  poster: any; // require(...) result
  synopsis: string;
  showtimes: string[];
  price: number; // per ticket
};

export const MOVIES: Movie[] = [
  {
    id: 'mv-001',
    title: 'The React Awakens',
    genre: 'Sci-Fi',
    durationMin: 124,
    rating: 'PG-13',
    poster: require('@/assets/images/react-logo.png'),
    synopsis:
      'Seorang developer menemukan kekuatan baru untuk membangun UI dengan komponen yang hidup dan interaktif.',
    showtimes: ['12:00', '15:00', '18:30', '21:00'],
    price: 45000,
  },
  {
    id: 'mv-002',
    title: 'TypeScript Chronicles',
    genre: 'Adventure',
    durationMin: 138,
    rating: 'PG',
    poster: require('@/assets/images/partial-react-logo.png'),
    synopsis:
      'Perjalanan epik menaklukkan bug dengan tipe yang kuat dan aman.',
    showtimes: ['11:15', '14:45', '17:15', '20:00'],
    price: 50000,
  },
  {
    id: 'mv-003',
    title: 'Expo Odyssey',
    genre: 'Drama',
    durationMin: 110,
    rating: 'PG-13',
    poster: require('@/assets/images/splash-icon.png'),
    synopsis:
      'Kisah tim kecil membangun aplikasi lintas platform yang mulus dengan satu codebase.',
    showtimes: ['10:00', '13:30', '16:00', '19:30'],
    price: 40000,
  },
];