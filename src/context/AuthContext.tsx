import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { saveBirthProfile } from '../utils/birthStorage';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'CLIENT' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN';
  phone?: string;
  avatarUrl?: string;
  plan?: string;
  themePreference?: string;
  chartStylePreference?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, requiredRole?: 'user' | 'admin', masterPasscode?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  login: (email: string, password: string, requiredRole?: 'user' | 'admin', masterPasscode?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  continueAsGuest: () => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ success: false }),
  login: async () => ({ success: false }),
  signInWithGoogle: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  continueAsGuest: async () => ({ success: false }),
  signOut: async () => {},
  logout: async () => {},
  register: async () => ({ success: false }),
  resetPassword: async () => ({ success: false, message: '' }),
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deepastro_token') || localStorage.getItem('token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncSupabaseSession = async (sbSession: any) => {
    if (!sbSession || !sbSession.user) return;
    try {
      const res = await fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: sbSession.access_token,
          user: sbSession.user,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('deepastro_token', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('deepastro_user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.warn('[AuthContext] syncSupabaseSession error:', err);
    }
  };

  // Authenticate and verify profile from server on mount
  const refreshProfile = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? (localStorage.getItem('deepastro_token') || localStorage.getItem('token')) : null);
    if (!activeToken) {
      // Check if Supabase has an active OAuth session
      try {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession?.user) {
          await syncSupabaseSession(sbSession);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[AuthContext] Error reading Supabase session:', err);
      }
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('deepastro_user', JSON.stringify(data.user));
          if (data.birthProfile && data.birthProfile.birthDate) {
            saveBirthProfile(data.birthProfile);
          }
        } else {
          throw new Error('Invalid user profile');
        }
      } else {
        localStorage.removeItem('deepastro_token');
        localStorage.removeItem('token');
        localStorage.removeItem('deepastro_user');
        setToken(null);
        setUser(null);
      }
    } catch {
      const cached = localStorage.getItem('deepastro_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();

    // Listen to Supabase auth state changes (e.g. after Google OAuth redirect)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (event === 'SIGNED_IN' && sbSession?.user) {
        await syncSupabaseSession(sbSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('deepastro_token');
        localStorage.removeItem('token');
        localStorage.removeItem('deepastro_user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [token]);

  const signIn = async (
    email: string, 
    password: string, 
    requiredRole: 'user' | 'admin' = 'user',
    masterPasscode?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email ? email.trim() : (masterPasscode ? 'admin@deepastro.internal' : '');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, masterPasscode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || "We couldn't sign you in. Please check your credentials and try again." };
      }

      const receivedUser: UserProfile = data.user;
      const receivedToken: string = data.token;

      if (requiredRole === 'admin') {
        const isDbAdmin = receivedUser.role === 'ADMIN' || receivedUser.role === 'SUPER_ADMIN';
        if (!isDbAdmin) {
          setIsLoading(false);
          return {
            success: false,
            error: 'Administrator access is required for this account.',
          };
        }
      }

      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('deepastro_token', receivedToken);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('deepastro_user', JSON.stringify(receivedUser));

      setIsLoading(false);
      return { success: true, user: receivedUser };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: 'Connection issue. Please try again.' };
    }
  };

  const register = async (
    fullName: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Registration failed.' };
      }

      const receivedUser: UserProfile = data.user;
      const receivedToken: string = data.token;

      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('deepastro_token', receivedToken);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('deepastro_user', JSON.stringify(receivedUser));

      setIsLoading(false);
      return { success: true, user: receivedUser };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: 'Connection issue. Please try again.' };
    }
  };

  const continueAsGuest = async (): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/guest-session', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('deepastro_token', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('deepastro_user', JSON.stringify(data.user));
          setIsLoading(false);
          return { success: true, user: data.user };
        }
      }
      setIsLoading(false);
      return { success: false, error: 'Could not create guest session.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Guest session failed.' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.url) {
        if (typeof window !== 'undefined') {
          window.location.href = data.url;
        }
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Google sign-in could not be initiated.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Google OAuth failed.' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      return {
        success: true,
        message: data.message || "If an account exists for this email, you'll receive password reset instructions.",
      };
    } catch {
      return {
        success: true,
        message: "If an account exists for this email, you'll receive password reset instructions.",
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthContext] Supabase signOut error:', err);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('deepastro_token');
    localStorage.removeItem('token');
    localStorage.removeItem('deepastro_user');
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const role = user?.role || null;
  const session: AuthSession | null = (token && user) ? { token, user } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        signIn,
        login: signIn,
        signInWithGoogle,
        loginWithGoogle: signInWithGoogle,
        continueAsGuest,
        signOut,
        logout: signOut,
        register,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
