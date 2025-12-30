import { MovieCard } from '@/components/MovieCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStorage } from '@/hooks/use-auth-storage';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, RefreshControl, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStorage();
  const { width } = useWindowDimensions();
  const numCols = width > 900 ? 2 : 1;

  const { movies, deleteMovie, refreshMovies } = useMovieStorage();
  const [refreshing, setRefreshing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('Semua');
  const { scheme, toggleScheme } = useColorSchemeController();

  const tintColor = useThemeColor({}, 'tint');
  const iconBg = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  useFocusEffect(
    useCallback(() => {
      refreshMovies();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshMovies().finally(() => setRefreshing(false));
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

  const genres = useMemo(() => {
    const allGenres = movies.flatMap(m =>
      m.genre ? m.genre.split(',').map(g => g.trim()) : []
    );
    const unique = Array.from(new Set(allGenres)).filter(g => g.length > 0);
    return ['Semua', ...unique.sort()];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    if (!selectedGenre || selectedGenre === 'Semua') return movies;
    return movies.filter(m => {
      if (!m.genre) return false;
      const movieGenres = m.genre.split(',').map(g => g.trim());
      return movieGenres.includes(selectedGenre);
    });
  }, [movies, selectedGenre]);

  // Chip dengan animasi scale dan hover (web)
  const GenreChip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => {
    const isDark = scheme === 'dark';
    const scale = useRef(new Animated.Value(1)).current;
    const [hovered, setHovered] = useState(false);

    const chipBgColor = active
      ? tintColor
      : (isDark ? (hovered ? '#555' : '#444') : (hovered ? '#eaeaea' : '#f0f0f0'));
    // Hitung kontras warna teks terhadap background chip
    const getContrastTextColor = (bg: string, fallback: string) => {
      try {
        if (!bg.startsWith('#')) return fallback;
        let hex = bg.slice(1);
        if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        const srgb = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        const L = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
        return L > 0.6 ? '#000' : '#fff';
      } catch {
        return fallback;
      }
    };
    const chipTextColor = active ? getContrastTextColor(chipBgColor, '#fff') : (isDark ? '#e0e0e0' : textColor);
    const shadowColor = isDark ? '#000' : '#888';
    const shadowOpacity = isDark ? 0.4 : 0.2;
    const elevation = active ? 4 : (isDark ? 3 : 2);

    const handlePressIn = () => {
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
      <Pressable
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.filterChip,
            {
              borderColor: active ? tintColor : 'transparent',
              backgroundColor: chipBgColor,
              shadowColor,
              shadowOpacity,
              elevation,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {active ? <IconSymbol name="checkmark.circle.fill" size={14} color={chipTextColor} /> : null}
            <ThemedText style={[styles.filterChipText, { color: chipTextColor }]}>
              {label}
            </ThemedText>
          </View>
        </Animated.View>
      </Pressable>
    );
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
        {user?.role === 'admin' && (
          <>
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
          </>
        )}
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
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tintColor }]}
          onPress={handleAddMovie}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
          <ThemedText style={styles.addButtonText}>Tambah Film</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  const renderGenreFilter = () => (
    <ThemedView style={styles.filterContainer}>
      {genres.map((g) => (
        <GenreChip
          key={g}
          label={g}
          active={selectedGenre === g}
          onPress={() => setSelectedGenre(g)}
        />
      ))}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      {renderGenreFilter()}
      {filteredMovies.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredMovies}
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
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
