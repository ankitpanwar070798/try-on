import { createClient } from "./client";

export const signUpWithEmail = async (email: string, password: string, next: string = "/try-on") => {
  const supabase = createClient();
  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (response.error) throw response.error;
  return response.data;
};

export const signInWithEmail = async (email: string, password: string, next: string = "/try-on") => {
  const supabase = createClient();
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (response.error) throw response.error;
  return response.data;
};

export const signInWithProvider = async (provider: "google", next: string = "/try-on") => {
  const supabase = createClient();
  const redirectUrl = `${window.location.origin}/auth/oauth`;

  const response = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${redirectUrl}?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (response.error) throw response.error;
  return response.data;
};

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
