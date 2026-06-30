'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'anggota';
  nip?: string;
  address?: string;
  phone?: string;
  status: 'aktif' | 'nonaktif';
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
  switchRole: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    window.location.href = '/login';
  };

  const switchRole = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      if (profile.role === 'admin') {
        // Switch to Anggota (Budi Setiawan)
        // Login with budi's credentials
        const { error } = await supabase.auth.signInWithPassword({
          email: 'guru@koperasi.id',
          password: 'guru123',
        });
        if (error) throw error;
        window.location.href = '/anggota/dashboard';
      } else {
        // Switch to Admin (Administrator)
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@koperasi.id',
          password: 'admin123',
        });
        if (error) throw error;
        window.location.href = '/admin/dashboard';
      }
    } catch (error: any) {
      alert('Gagal berganti role demo: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
