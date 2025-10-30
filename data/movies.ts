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
    title: 'Cars',
    genre: 'Animasi',
    durationMin: 116,
    rating: 'PG-13',
    poster: require('@/assets/images/disney-lightning-mcqueen-mcqueen-cars-movie-wallpaper-preview.jpg'),
    synopsis:
      'Cars adalah tentang Lightning McQueen, sebuah mobil balap pemula yang sombong, yang tersesat dan terdampar di kota kecil Radiator Springs saat menuju balapan besar, Piala Piston. Di sana, ia perlahan-lahan belajar tentang persahabatan, nilai-nilai hidup, dan menjadi orang yang lebih baik dari penduduk kota, terutama Doc Hudson dan Mater. Perjalanan ini membuatnya menyadari bahwa kemenangan bukanlah segalanya dan persahabatan jauh lebih berharga. .',
    showtimes: ['12:00', '15:00', '18:30', '21:00'],
    price: 40000,
  },
  {
    id: 'mv-002',
    title: 'Fall guy',
    genre: 'Adventure',
    durationMin: 138,
    rating: 'PG',
    poster: require('@/assets/images/the-fall-guy-poster.jpg'),
    synopsis:
      'The Fall Guy adalah film yang menceritakan Colt Seavers (Ryan Gosling), seorang stuntman Hollywood yang kembali bekerja setelah pensiun dini akibat kecelakaan. Ia harus kembali ke dunia perfilman saat bintang film dalam proyek yang disutradarai oleh mantannya, Jody Moreno (Emily Blunt), menghilang secara misterius. Colt kemudian terseret dalam sebuah konspirasi berbahaya saat ia mencoba menemukan bintang tersebut. ',
    showtimes: ['11:15', '14:45', '17:15', '20:00'],
    price: 50000,
  },
  {
    id: 'mv-003',
    title: 'Dune 2',
    genre: 'Laga',
    durationMin: 110,
    rating: 'PG-13',
    poster: require('@/assets/images/Poster_film_dune_part_two.jpg'),
    synopsis:
      'Perjalanan pahlawan mitis dan emosional, Dune"menceritakan kisah Paul Atreides, seorang pemuda cerdas dan berbakat yang lahir dalam takdir besar di luar pemahamannya, yang harus melakukan perjalanan ke planet paling berbahaya di alam semesta untuk memastikan masa depannya.',
    showtimes: ['10:00', '13:30', '16:00', '19:30'],
    price: 40000,
  },
];