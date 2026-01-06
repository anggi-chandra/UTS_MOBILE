import { MovieCard } from '@/components/MovieCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

export default function SeeAllScreen() {
    const { title } = useLocalSearchParams<{ title: string }>();
    const { movies } = useMovieStorage();
    const backgroundColor = useThemeColor({}, 'background');

    const displayMovies = React.useMemo(() => {
        if (title === 'Coming Soon') {
            return movies.filter(m => m.status === 'coming_soon');
        }
        if (title === 'Now Playing') {
            return movies.filter(m => m.status === 'now_playing');
        }
        return movies;
    }, [movies, title]);

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: title || 'Movies', headerBackTitle: 'Home' }} />

            <FlatList
                data={displayMovies}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <MovieCard
                        movie={item}
                        index={index}
                        variant="portrait"
                    // We can decide if we want actions here, probably not for a general list view unless admin
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText>No movies found.</ThemedText>
                    </View>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        gap: 20,
    },
    columnWrapper: {
        gap: 16,
        justifyContent: 'flex-start',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
});
