'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '@/lib/api';

export interface AppUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const data = await api.getSession();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const data = await api.signup({ email, password, first_name: firstName, last_name: lastName });
      setUser(data.user ?? null);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Signup failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.signin({ email, password });
      setUser(data.user ?? null);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      await api.signout();
      setUser(null);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Sign out failed' } };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
