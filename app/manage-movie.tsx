import React from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { MovieForm } from '@/components/MovieForm';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { Movie } from '@/data/movies';

export default function ManageMovieScreen() {
  const { movieId } = useLocalSearchParams<{ movieId?: string }>();
  const router = useRouter();
  const { addMovie, updateMovie, getMovieById } = useMovieStorage();

  const movie = movieId ? getMovieById(movieId) : undefined;

  const handleSubmit = (movieData: Omit<Movie, 'id'>) => {
    if (movieId && movie) {
      // Update existing movie
      updateMovie(movieId, movieData);
    } else {
      // Add new movie
      addMovie(movieData);
    }
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <MovieForm
        movie={movie}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});