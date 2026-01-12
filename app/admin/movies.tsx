import { MovieCard } from '@/components/MovieCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMovieStorage } from '@/hooks/use-movie-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ManageMoviesScreen() {
    const router = useRouter();
    const { movies, deleteMovie, refreshMovies } = useMovieStorage();
    const tintColor = useThemeColor({}, 'tint');

    useFocusEffect(
        React.useCallback(() => {
            refreshMovies();
        }, [])
    );

    // Sort movies by status (now playing first) then by title
    const sortedMovies = React.useMemo(() => {
        return [...movies].sort((a, b) => {
            if (a.status === b.status) {
                return a.title.localeCompare(b.title);
            }
            return a.status === 'now_playing' ? -1 : 1;
        });
    }, [movies]);

    const handleMoviePress = (movie: any) => {
        Alert.alert(
            'Manage Movie',
            `Choose an action for "${movie.title}"`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Edit',
                    onPress: () => router.push(`/manage-movie?movieId=${movie.id}`)
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Confirm Delete', `Are you sure you want to delete "${movie.title}"?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteMovie(movie.id) }
                        ]);
                    }
                }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Manage Movies',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/manage-movie')}>
                            <IconSymbol name="plus" size={24} color={tintColor} />
                        </TouchableOpacity>
                    )
                }}
            />

            <FlatList
                data={sortedMovies}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <MovieCard
                        movie={item}
                        index={index}
                        variant="portrait"
                        onPress={handleMoviePress}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText>No movies found.</ThemedText>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: tintColor }]}
                            onPress={() => router.push('/manage-movie')}
                        >
                            <ThemedText style={styles.addButtonText}>Add New Movie</ThemedText>
                        </TouchableOpacity>
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
        gap: 16,
    },
    addButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
