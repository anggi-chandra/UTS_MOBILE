import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export type Booking = {
  id: string;
  movieId?: string;
  title: string;
  showtime: string;
  quantity: number;
  totalPrice: number;
  createdAt: number;
  poster?: string | number;
  customerName: string;
  seats?: string[];
  paymentStatus?: 'pending' | 'paid';
  paymentMethod?: 'cash' | 'qris' | 'card';
};

const STORAGE_KEY = 'BOOKINGS_STORAGE_V1';
const MEMORY_KEY = '__BOOKINGS_STORAGE_MEM__';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readBookings(): Booking[] {
  // Web: gunakan localStorage
  if (Platform.OS === 'web') {
    const ls = typeof window !== 'undefined' ? window.localStorage : undefined;
    const parsed = safeParse<Booking[]>(ls?.getItem(STORAGE_KEY) ?? null);
    return Array.isArray(parsed) ? parsed : [];
  }
  // Native: fallback ke penyimpanan memory per sesi agar tidak crash di Expo Go
  const mem: any = globalThis as any;
  const existing = mem[MEMORY_KEY] as Booking[] | undefined;
  return Array.isArray(existing) ? existing : [];
}

function writeBookings(bookings: Booking[]) {
  if (Platform.OS === 'web') {
    const ls = typeof window !== 'undefined' ? window.localStorage : undefined;
    ls?.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return;
  }
  const mem: any = globalThis as any;
  mem[MEMORY_KEY] = bookings;
}

export function useBookingStorage() {
  const [bookings, setBookings] = useState<Booking[]>(() => readBookings());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sinkronisasi awal dari storage sesuai platform
    setBookings(readBookings());
  }, []);

  const refresh = useCallback(() => {
    setBookings(readBookings());
  }, []);

  const addBooking = useCallback((data: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      ...data,
    };
    setBookings((prev) => {
      const next = [newBooking, ...prev];
      writeBookings(next);
      return next;
    });
    return newBooking;
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings((prev) => {
      const next = prev.filter((b) => b.id !== id);
      writeBookings(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setBookings(() => {
      writeBookings([]);
      return [];
    });
  }, []);

  const byNewest = useMemo(() => {
    return [...bookings].sort((a, b) => b.createdAt - a.createdAt);
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