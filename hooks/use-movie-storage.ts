import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Movie, MOVIES_VERSION } from '@/data/movies';

const STORAGE_KEY = 'cinema_movies';
const VERSION_KEY = 'cinema_movies_version';
const MEMORY_KEY = '__MOVIES_STORAGE_MEM__';

// Fungsi untuk memastikan data movies selalu tersedia
const getInitialMovies = () => {
  const { MOVIES } = require('@/data/movies');
  return MOVIES;
};

export function useMovieStorage() {
  const [movies, setMovies] = useState<Movie[]>(getInitialMovies());
  const [loading, setLoading] = useState(true);

  // Load movies from storage sesuai platform
  useEffect(() => {
    try {
      if (Platform.OS === 'web') {
        const ls = typeof window !== 'undefined' ? window.localStorage : undefined;
        if (ls) {
          const stored = ls.getItem(STORAGE_KEY);
          const storedVersion = ls.getItem(VERSION_KEY);
          // Jika versi berbeda atau data belum ada, gunakan data default dari file
          if (!stored || storedVersion !== String(MOVIES_VERSION)) {
            const defaultMovies = getInitialMovies();
            setMovies(defaultMovies);
            ls.setItem(STORAGE_KEY, JSON.stringify(defaultMovies));
            ls.setItem(VERSION_KEY, String(MOVIES_VERSION));
          } else if (stored) {
            try {
              const parsedMovies = JSON.parse(stored);
              if (Array.isArray(parsedMovies) && parsedMovies.length > 0) {
                setMovies(parsedMovies);
              } else {
                // Jika data kosong atau bukan array, gunakan data default
                const defaultMovies = getInitialMovies();
                setMovies(defaultMovies);
                ls.setItem(STORAGE_KEY, JSON.stringify(defaultMovies));
                ls.setItem(VERSION_KEY, String(MOVIES_VERSION));
              }
            } catch (e) {
              console.error('Error parsing stored movies:', e);
              const defaultMovies = getInitialMovies();
              setMovies(defaultMovies);
              ls.setItem(STORAGE_KEY, JSON.stringify(defaultMovies));
              ls.setItem(VERSION_KEY, String(MOVIES_VERSION));
            }
          }
        }
      } else {
        // Untuk platform non-web (Expo Go)
        const mem: any = globalThis as any;
        const existing = mem[MEMORY_KEY] as Movie[] | undefined;
        if (Array.isArray(existing) && existing.length > 0) {
          setMovies(existing);
        } else {
          const defaultMovies = getInitialMovies();
          setMovies(defaultMovies);
          mem[MEMORY_KEY] = defaultMovies;
        }
      }
    } catch (error) {
      console.error('Error loading movies from storage:', error);
      const defaultMovies = getInitialMovies();
      setMovies(defaultMovies);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save movies ke storage sesuai platform
  const saveMovies = (newMovies: Movie[]) => {
    try {
      if (Platform.OS === 'web') {
        const ls = typeof window !== 'undefined' ? window.localStorage : undefined;
        if (ls) {
          ls.setItem(STORAGE_KEY, JSON.stringify(newMovies));
          ls.setItem(VERSION_KEY, String(MOVIES_VERSION));
          console.log('Movies saved to localStorage:', newMovies.length);
        } else {
          console.warn('localStorage not available');
        }
      } else {
        // Untuk platform non-web (Expo Go)
        const mem: any = globalThis as any;
        mem[MEMORY_KEY] = [...newMovies]; // Gunakan spread operator untuk memastikan array baru
        console.log('Movies saved to memory:', newMovies.length);
      }
      setMovies([...newMovies]); // Gunakan spread operator untuk memastikan state diupdate
    } catch (error) {
      console.error('Error saving movies to storage:', error);
      // Tetap update state meskipun gagal menyimpan ke storage
      setMovies([...newMovies]);
    }
  };

  // Add new movie
  const addMovie = (movieData: Omit<Movie, 'id'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: `movie_${Date.now().toString()}`, // ID yang lebih unik
    };
    const updatedMovies = [...movies, newMovie];
    saveMovies(updatedMovies);
    return newMovie;
  };

  // Update existing movie
  const updateMovie = (id: string, movieData: Partial<Omit<Movie, 'id'>>) => {
    const updatedMovies = movies.map(movie =>
      movie.id === id ? { ...movie, ...movieData } : movie
    );
    saveMovies(updatedMovies);
    return updatedMovies.find(movie => movie.id === id);
  };

  // Delete movie
  const deleteMovie = (id: string) => {
    const updatedMovies = movies.filter(movie => movie.id !== id);
    saveMovies(updatedMovies);
  };

  // Get movie by ID
  const getMovieById = (id: string) => {
    return movies.find(movie => movie.id === id);
  };

  return {
    movies,
    loading,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieById,
  };
}