import { Movie } from '@/data/movies';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

export function useMovieStorage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedMovies: Movie[] = data.map((m: any) => ({
          id: m.id,
          title: m.title,
          genre: m.genre,
          durationMin: m.duration_minutes,
          rating: m.rating,
          synopsis: m.synopsis,
          price: m.price,
          poster: m.poster_url,
          showtimes: m.showtimes || [],
        }));
        setMovies(mappedMovies);
      }
    } catch (error: any) {
      console.error('Error fetching movies:', error);
      Toast.show({ type: 'error', text1: 'Gagal memuat film', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const addMovie = async (movieData: Omit<Movie, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .insert({
          title: movieData.title,
          genre: movieData.genre,
          duration_minutes: movieData.durationMin,
          rating: movieData.rating,
          synopsis: movieData.synopsis,
          price: movieData.price,
          poster_url: movieData.poster,
          showtimes: movieData.showtimes,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newMovie: Movie = {
          id: data.id,
          title: data.title,
          genre: data.genre,
          durationMin: data.duration_minutes,
          rating: data.rating,
          synopsis: data.synopsis,
          price: data.price,
          poster: data.poster_url,
          showtimes: data.showtimes || [],
        };
        setMovies([newMovie, ...movies]);
        return newMovie;
      }
    } catch (error: any) {
      console.error('Error adding movie:', error);
      throw error;
    }
  };

  const updateMovie = async (id: string, movieData: Partial<Omit<Movie, 'id'>>) => {
    try {
      const updates: any = {};
      if (movieData.title) updates.title = movieData.title;
      if (movieData.genre) updates.genre = movieData.genre;
      if (movieData.durationMin) updates.duration_minutes = movieData.durationMin;
      if (movieData.rating) updates.rating = movieData.rating;
      if (movieData.synopsis) updates.synopsis = movieData.synopsis;
      if (movieData.price) updates.price = movieData.price;
      if (movieData.poster) updates.poster_url = movieData.poster;
      if (movieData.showtimes) updates.showtimes = movieData.showtimes;

      const { data, error } = await supabase
        .from('movies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedMovies = movies.map(m =>
          m.id === id ? {
            ...m,
            title: data.title,
            genre: data.genre,
            durationMin: data.duration_minutes,
            rating: data.rating,
            synopsis: data.synopsis,
            price: data.price,
            poster: data.poster_url,
            showtimes: data.showtimes || [],
          } : m
        );
        setMovies(updatedMovies);
      }
    } catch (error: any) {
      console.error('Error updating movie:', error);
      throw error;
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMovies(movies.filter(m => m.id !== id));
    } catch (error: any) {
      console.error('Error deleting movie:', error);
      Toast.show({ type: 'error', text1: 'Gagal menghapus film', text2: error.message });
    }
  };

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
    refreshMovies: fetchMovies,
  };
}