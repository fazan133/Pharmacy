import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { authApi } from '../api/authApi';
import type { Profile, UserRole } from '@/types/database.types';
import { Box, CircularProgress } from '@mui/material';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!profile;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authApi.getSession();

        if (session?.user) {
          setUser(session.user);
          const userProfile = await authApi.getProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange(async (event, session) => {
    //   if (event === 'SIGNED_IN' && session?.user) {
    //     setUser(session.user);
    //     const userProfile = await authApi.getProfile(session.user.id);
    //     setProfile(userProfile);
    //   } else if (event === 'SIGNED_OUT') {
    //     setUser(null);
    //     setProfile(null);
    //   } else if (event === 'TOKEN_REFRESHED' && session?.user) {
    //     setUser(session.user);
    //   }
    // });

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: authUser } = await authApi.signIn({ email, password });

    if (authUser) {
      setUser(authUser);
      const userProfile = await authApi.getProfile(authUser.id);
      
      // Check if user is active and admin
      if (!userProfile?.is_active) {
        await authApi.signOut();
        setUser(null);
        setProfile(null);
        throw new Error('Your account is inactive. Please contact administrator.');
      }

      if (userProfile?.role !== 'admin') {
        await authApi.signOut();
        setUser(null);
        setProfile(null);
        throw new Error('Access denied. Admin privileges required.');
      }

      setProfile(userProfile);
    }
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated,
        signIn,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
