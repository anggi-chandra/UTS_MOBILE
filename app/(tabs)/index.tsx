import { MovieCard } from '@/components/MovieCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numCols = width > 900 ? 2 : 1;
  
  const { movies, deleteMovie } = useMovieStorage();
  const [refreshing, setRefreshing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { scheme, toggleScheme } = useColorSchemeController();
  
  const tintColor = useThemeColor({}, 'tint');
  const iconBg = useThemeColor({}, 'icon');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleAddMovie = () => {
    router.push('/manage-movie');
  };

  const handleToggleActions = () => {
    setShowActions(!showActions);
  };

  const handleDeleteMovie = (movieId: string) => {
    deleteMovie(movieId);
  };

  const renderHeader = () => (
    <ThemedView style={styles.headerContainer}>
      <ThemedText type="title" style={styles.header}>Daftar Film</ThemedText>
      <ThemedView style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.actionHeaderButton, { backgroundColor: scheme === 'dark' ? '#444' : tintColor }]}
          onPress={toggleScheme}
        >
          <IconSymbol 
            name={scheme === 'light' ? 'moon.fill' : 'sun.max.fill'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionHeaderButton, { backgroundColor: showActions ? '#ff4444' : (scheme === 'dark' ? '#444' : tintColor) }]}
          onPress={handleToggleActions}
        >
          <IconSymbol 
            name={showActions ? "xmark" : "ellipsis"}
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionHeaderButton, { backgroundColor: scheme === 'dark' ? '#444' : tintColor }]}
          onPress={handleAddMovie}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyState}>
      <IconSymbol name="film" size={64} color={tintColor} />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Belum ada film
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Tambahkan film pertama Anda dengan menekan tombol + di atas
      </ThemedText>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: tintColor }]}
        onPress={handleAddMovie}
      >
        <IconSymbol name="plus" size={20} color="#fff" />
        <ThemedText style={styles.addButtonText}>Tambah Film</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      {movies.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={movies}
          key={`${numCols}-${showActions}`}
          keyExtractor={(item) => item.id}
          numColumns={numCols}
          columnWrapperStyle={numCols > 1 ? styles.column : undefined}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tintColor}
            />
          }
          renderItem={({ item, index }) => (
            <View style={{ flex: 1 }}>
              <MovieCard 
                movie={item} 
                index={index}
                showActions={showActions}
                onDelete={handleDeleteMovie}
              />
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
  },
  column: {
    gap: 12,
  },
});
