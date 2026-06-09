import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'member' | 'staff' | 'admin' | null;
export type UserStatus = 'pending' | 'active' | null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan?: string;
  clinicId?: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  loginWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signup: (name: string, email: string, role: UserRole) => void; 
  signUpWithPassword: (email: string, password: string) => Promise<{ data: any, error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google') => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (sessionUser: any) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }
    
    // Fetch profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('portal_role, full_name, clinic_id, is_active')
      .eq('id', sessionUser.id)
      .single();

    if (profile) {
      setUser({
        id: sessionUser.id,
        name: profile.full_name || sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email || '',
        role: profile.portal_role as UserRole,
        status: profile.is_active ? 'active' : 'pending',
        clinicId: profile.clinic_id
      });
    } else {
      // Fallback if profile not created yet
      setUser({
        id: sessionUser.id,
        name: sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email || '',
        role: 'member', 
        status: 'active'
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchProfile(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'magiclink'
    });
    return { error };
  };

  const signup = async (name: string, email: string, role: UserRole) => {
    // Placeholder until we implement the full apply flow with DB
    console.log('Signup called', { name, email, role });
  };

  const signUpWithPassword = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
  };

  const signInWithPassword = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signInWithOAuth = async (provider: 'google') => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      }
    });
  };

  const resetPasswordForEmail = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loginWithOtp, verifyOtp, signup, signUpWithPassword, signInWithPassword, signInWithOAuth, resetPasswordForEmail, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



