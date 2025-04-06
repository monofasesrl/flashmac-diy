import { supabase } from '../supabase';

export async function signIn(email: string, password: string) {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Handle authentication error
      throw error;
    }

    if (!data.user) throw new Error('No user data returned');

    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Email o password non validi');
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.clear();
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Errore durante il logout');
  }
}
