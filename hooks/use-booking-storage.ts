import { useCallback, useEffect, useMemo, useState } from 'react';

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
};

const STORAGE_KEY = 'BOOKINGS_STORAGE_V1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  const parsed = safeParse<Booking[]>(window.localStorage.getItem(STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

function writeBookings(bookings: Booking[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function useBookingStorage() {
  const [bookings, setBookings] = useState<Booking[]>(() => readBookings());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync from localStorage on mount
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