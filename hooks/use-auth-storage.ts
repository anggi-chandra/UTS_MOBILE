import { supabase } from '@/lib/supabase';
import { create } from 'zustand';

export type UserRole = 'admin' | 'user';

export type User = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar_url?: string;
};

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
    syncSession: (session?: any) => Promise<void>;
};

export const useAuthStorage = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
    logout: async () => {
        // Clear local state immediately for UI responsiveness
        set({ user: null, isAuthenticated: false });
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    },
    syncSession: async (inputSession?: any) => {
        try {
            let session = inputSession;

            if (!session) {
                const { data } = await supabase.auth.getSession();
                session = data.session;
            }

            if (session?.user) {
                const initialUser: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                    role: (session.user.user_metadata?.role?.toLowerCase() as UserRole) || 'user',
                    avatar_url: session.user.user_metadata?.avatar_url
                };

                const currentUser = get().user;
                const isSameUser = currentUser?.id === session.user.id;

                // Only reset state if it's a new user or no user exists
                if (!isSameUser) {
                    set({
                        user: initialUser,
                        isAuthenticated: true,
                        isLoading: false
                    });
                }

                try {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profile) {
                        set(state => ({
                            user: {
                                ...state.user!,
                                name: profile.full_name || state.user!.name,
                                role: profile.role?.toLowerCase() || state.user!.role,
                                avatar_url: profile.avatar_url || state.user!.avatar_url
                            }
                        }));
                    }
                } catch (profileError) {
                    console.error('Unexpected error fetching profile:', profileError);
                }

            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Sync session error:', error);
            set({ isLoading: false });
        }
    },
    initialize: async () => {
        try {
            await useAuthStorage.getState().syncSession();

            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
                    set({ user: null, isAuthenticated: false, isLoading: false });
                    return;
                }

                await useAuthStorage.getState().syncSession(session);
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false });
        }
    }
}));
