import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Movie } from '@/data/movies';
import { useColorSchemeController } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const SPACING = (width - ITEM_WIDTH) / 2;

interface HeroCarouselProps {
    movies: Movie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
    const router = useRouter();
    const scrollX = useSharedValue(0);
    const { scheme } = useColorSchemeController();
    const themeColors = Colors[scheme ?? 'light'];

    const featuredMovies = movies.slice(0, 5); // Show top 5 movies

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    if (movies.length === 0) return null;

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={featuredMovies}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: SPACING }}
                onScroll={onScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <CarouselItem
                        item={item}
                        index={index}
                        scrollX={scrollX}
                        onPress={() => router.push(`/movie/${item.id}`)}
                    />
                )}
            />
        </View>
    );
}

const CarouselItem = ({ item, index, scrollX, onPress }: { item: Movie; index: number; scrollX: Animated.SharedValue<number>, onPress: () => void }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
        ];

        const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], 'clamp');
        const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], 'clamp');

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <Pressable onPress={onPress}>
            <Animated.View style={[styles.itemContainer, animatedStyle]}>
                <Image
                    source={typeof item.poster === 'string' ? { uri: item.poster } : item.poster}
                    style={styles.poster}
                    contentFit="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                >
                    <ThemedText style={styles.title} numberOfLines={1}>{item.title}</ThemedText>
                    <ThemedText style={styles.subtitle} numberOfLines={1}>{item.genre} • {item.rating}</ThemedText>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        justifyContent: 'flex-end',
        padding: 16,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
});
