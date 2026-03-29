import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authService } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, phone: string, role: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const subscription = authService.onAuthStateChange((session, user) => {
      setSession(session);
      setUser(user);
      
      if (user) {
        setTimeout(() => {
          authService.getUserRole(user.id).then(({ role }) => {
            setUserRole(role);
          });
        }, 0);
      } else {
        setUserRole(null);
      }
    });

    authService.getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        authService.getUserRole(session.user.id).then(({ role }) => {
          setUserRole(role);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password);
    if (!error) {
      navigate("/");
    }
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, phone: string, role: string = "traveler") => {
    const { error } = await authService.signUp(email, password, name, phone, role);
    if (!error) {
      navigate("/");
    }
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
