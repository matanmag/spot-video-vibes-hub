
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🔐 AuthProvider initializing');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', { 
          event, 
          userEmail: session?.user?.email || 'No user',
          hasSession: !!session
        });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', { 
        userEmail: session?.user?.email || 'No user',
        hasSession: !!session
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('🔐 Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    try {
      // Use the current origin for redirect URL
      const redirectUrl = `${window.location.origin}/home`;
      console.log('🔐 Signing in with redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('🔐 Sign in error:', error);
      } else {
        console.log('🔐 Sign in successful, magic link sent');
      }
      
      return { error };
    } catch (error) {
      console.error('🔐 Unexpected error during sign in:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Signing out user');
      await supabase.auth.signOut();
      console.log('🔐 Sign out successful');
    } catch (error) {
      console.error('🔐 Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signOut,
  };

  console.log('🔐 AuthProvider rendering with state:', {
    hasUser: !!user,
    userEmail: user?.email || 'No user',
    loading
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
