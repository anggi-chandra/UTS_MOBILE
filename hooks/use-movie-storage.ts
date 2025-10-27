import { useState, useEffect } from 'react';
import { Movie } from '@/data/movies';

const STORAGE_KEY = 'cinema_movies';

export function useMovieStorage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Load movies from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedMovies = JSON.parse(stored);
        setMovies(parsedMovies);
      } else {
        // Initialize with default movies if no stored data
        const { MOVIES } = require('@/data/movies');
        setMovies(MOVIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOVIES));
      }
    } catch (error) {
      console.error('Error loading movies from storage:', error);
      // Fallback to default movies
      const { MOVIES } = require('@/data/movies');
      setMovies(MOVIES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save movies to localStorage
  const saveMovies = (newMovies: Movie[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMovies));
      setMovies(newMovies);
    } catch (error) {
      console.error('Error saving movies to storage:', error);
    }
  };

  // Add new movie
  const addMovie = (movieData: Omit<Movie, 'id'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: Date.now().toString(), // Simple ID generation
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