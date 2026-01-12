import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieCard } from '@/components/MovieCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useAuthStorage } from '@/hooks/use-auth-storage';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStorage();
  const { movies, deleteMovie, refreshMovies } = useMovieStorage();
  const [refreshing, setRefreshing] = useState(false);
  const { scheme, toggleScheme } = useColorSchemeController();
  const theme = Colors[scheme ?? 'light'];
  const tintColor = useThemeColor({}, 'tint');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshMovies().finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshMovies();
    }, [])
  );

  const handleAddMovie = () => router.push('/manage-movie');

  const LogoHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <ThemedText style={styles.logoText}>CINEBOOK</ThemedText>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={toggleScheme}>
          <IconSymbol
            name={scheme === 'dark' ? 'moon.fill' : 'sun.max.fill'}
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const nowPlaying = movies.filter(m => m.status === 'now_playing');
  const comingSoon = movies.filter(m => m.status === 'coming_soon');

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LogoHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />}
      >
        {/* Hero Carousel */}
        <HeroCarousel movies={nowPlaying.slice(0, 5)} />


        {/* Start "Now Playing" Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Now playing</ThemedText>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push({ pathname: '/movie/see-all', params: { title: 'Now Playing' } })}
          >
            <ThemedText style={[styles.seeAllText, { color: tintColor }]}>See all</ThemedText>
            <ChevronRight size={16} color={tintColor} />
          </TouchableOpacity>
        </View>

        {nowPlaying.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText>Belum ada film yang tayang.</ThemedText>
            {user?.role === 'admin' && (
              <TouchableOpacity onPress={handleAddMovie} style={[styles.addButton, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.addButtonText}>Tambah Film</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={nowPlaying}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <MovieCard
                movie={item}
                index={index}
                variant="portrait"
                onDelete={user?.role === 'admin' ? deleteMovie : undefined}
                showActions={user?.role === 'admin'}
              />
            )}
          />
        )}

        {/* Coming Soon Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Coming Soon</ThemedText>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push({ pathname: '/movie/see-all', params: { title: 'Coming Soon' } })}
          >
            <ThemedText style={[styles.seeAllText, { color: tintColor }]}>See all</ThemedText>
            <ChevronRight size={16} color={tintColor} />
          </TouchableOpacity>
        </View>

        {comingSoon.length === 0 ? (
          <View style={{ height: 100, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
            <ThemedText>No upcoming movies</ThemedText>
          </View>
        ) : (
          <FlatList
            data={comingSoon}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <MovieCard
                movie={item}
                index={index}
                variant="portrait"
                onDelete={user?.role === 'admin' ? deleteMovie : undefined}
                showActions={user?.role === 'admin'}
              />
            )}
          />
        )}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  logoText: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: '#34D399', // Brand Tint Color (M-Tix ish)
    letterSpacing: 1,
    lineHeight: 32,
    textShadowColor: 'rgba(52, 211, 153, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  logoSubText: {
    fontSize: 10,
    fontFamily: Fonts.body, // Fixed typo
    color: '#9CA3AF',
    letterSpacing: 2,
    marginTop: -2,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sectionSpacing: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // Thin border like M-Tix
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
