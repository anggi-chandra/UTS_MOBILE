import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuthStorage } from './use-auth-storage';

export type Booking = {
  id: string;
  movieId?: string; // Supabase: movie_id
  title: string;
  showtime: string;
  quantity: number;
  totalPrice: number; // Supabase: total_price
  createdAt: number; // Supabase: created_at (string)
  poster?: string | number;
  customerName: string; // Supabase: customer_name
  seats?: string[];
  paymentStatus?: 'pending' | 'paid'; // Supabase: payment_status
  paymentMethod?: 'cash' | 'qris' | 'card'; // Supabase: payment_method
  userId?: string; // Supabase: user_id
};

export function useBookingStorage() {
  const { user } = useAuthStorage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      // Admin sees all, User sees own.
      // RLS policies on Supabase should handle this, but we can also filter here if needed.
      // However, relying on RLS is safer. We just select * from bookings.

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Booking[] = data.map((item: any) => ({
          id: item.id,
          movieId: item.movie_id,
          title: item.title,
          showtime: item.showtime,
          quantity: item.quantity,
          totalPrice: item.total_price,
          createdAt: new Date(item.created_at).getTime(),
          poster: item.poster,
          customerName: item.customer_name,
          seats: item.seats,
          paymentStatus: item.payment_status,
          paymentMethod: item.payment_method,
          userId: item.user_id,
        }));
        setBookings(mapped);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Toast.show({ type: 'error', text1: 'Gagal memuat riwayat pesanan' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refresh = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = useCallback(async (data: Omit<Booking, 'id' | 'createdAt'>) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Silakan login terlebih dahulu' });
      return null;
    }

    try {
      setLoading(true);
      const payload = {
        user_id: user.id,
        movie_id: data.movieId,
        title: data.title,
        showtime: data.showtime,
        quantity: data.quantity,
        total_price: data.totalPrice,
        poster: typeof data.poster === 'string' ? data.poster : null,
        customer_name: data.customerName,
        seats: data.seats,
        payment_status: data.paymentStatus || 'pending',
        payment_method: data.paymentMethod,
      };

      const { data: inserted, error } = await supabase
        .from('bookings')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (inserted) {
        const newBooking: Booking = {
          id: inserted.id,
          movieId: inserted.movie_id,
          title: inserted.title,
          showtime: inserted.showtime,
          quantity: inserted.quantity,
          totalPrice: inserted.total_price,
          createdAt: new Date(inserted.created_at).getTime(),
          poster: inserted.poster,
          customerName: inserted.customer_name,
          seats: inserted.seats,
          paymentStatus: inserted.payment_status,
          paymentMethod: inserted.payment_method,
          userId: inserted.user_id,
        };

        setBookings(prev => [newBooking, ...prev]);
        return newBooking;
      }
    } catch (error) {
      console.error('Error adding booking:', error);
      Toast.show({ type: 'error', text1: 'Gagal menyimpan pesanan' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Remove booking is not typically allowed for users, maybe admin only?
  // For now we keep it but connected to Supabase delete
  const removeBooking = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error removing booking:', error);
      Toast.show({ type: 'error', text1: 'Gagal menghapus pesanan' });
    }
  }, []);

  const clearAll = useCallback(async () => {
    // Dangerous! Only for local dev or admin maybe?
    // We'll leave it empty or implement if needed.
    // For safety, let's just clear local state.
    setBookings([]);
  }, []);

  const byNewest = useMemo(() => {
    return bookings; // Already sorted by fetch
  }, [bookings]);

  return {
    bookings,
    byNewest,
    loading,
    refresh,
    addBooking,
    removeBooking,
    clearAll,
  };
}