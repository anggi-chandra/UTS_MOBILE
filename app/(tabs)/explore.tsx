import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBookingStorage } from '@/hooks/use-booking-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function BookingHistoryScreen() {
  const tint = useThemeColor({}, 'tint');
  const { byNewest, removeBooking, clearAll, refresh } = useBookingStorage();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 400);
  }, [refresh]);

  const renderHeader = () => (
    <ThemedView style={styles.headerContainer}>
      <ThemedText type="title">History Pemesanan</ThemedText>
      {byNewest.length > 0 && (
        <ThemedText type="link" onPress={clearAll} style={styles.clearLink}>
          Hapus semua
        </ThemedText>
      )}
    </ThemedView>
  );

  const renderEmpty = () => (
    <ThemedView style={styles.emptyState}>
      <IconSymbol name="film" size={72} color={tint} />
      <ThemedText type="subtitle" style={{ marginTop: 8 }}>Belum ada pemesanan</ThemedText>
      <ThemedText style={{ opacity: 0.7, textAlign: 'center' }}>
        Tambahkan tiket dari tab "Add Ticket". Pesanan otomatis tersimpan di riwayat.
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      {byNewest.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={byNewest}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} />}
          renderItem={({ item }) => {
            return (
              <ThemedView style={styles.card}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={styles.muted}>Jadwal: {item.showtime}</ThemedText>
                <ThemedText style={styles.muted}>Kursi: {item.seats?.join(', ') || '-'}</ThemedText>
                <ThemedText style={styles.muted}>Jumlah: {item.quantity} tiket</ThemedText>
                <ThemedText style={styles.muted}>Pemesan: {item.customerName}</ThemedText>
                <ThemedText style={styles.total}>Total: Rp {item.totalPrice.toLocaleString('id-ID')}</ThemedText>
                <ThemedText type="link" style={styles.removeLink} onPress={() => removeBooking(item.id)}>
                  Hapus
                </ThemedText>
              </ThemedView>
            );
          }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clearLink: {
    alignSelf: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 6,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  muted: {
    opacity: 0.75,
  },
  total: {
    marginTop: 6,
  },
  removeLink: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});