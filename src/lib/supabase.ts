import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export const authService = {
  signUp: async (email: string, password: string, name: string, phone?: string, role: string = "traveler") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name,
          phone,
          role,
        },
      },
    });

    return { data, error };
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  getSession: async (): Promise<{ session: Session | null; error: any }> => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },
  onAuthStateChange: (callback: (session: Session | null, user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session, session?.user ?? null);
      }
    );
    return subscription;
  },
  getUserRole: async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (error) return { role: null, error };
    return { role: data?.[0]?.role || null, error: null };
  },
};
