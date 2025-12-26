import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  favorite_genres?: string[];
  theme?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch user if token exists
  const fetchUser = async (token: string) => {
    try {
      const res = await fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token invalid
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (e) {
      console.error("Auth check failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { error: new Error(data.error || 'Signup failed') };
      }

      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      toast.success("Welcome! Account created.");
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { error: new Error(data.error || 'Login failed') };
      }

      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      toast.success("Welcome back!");
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast.info("Signed out");
  };

  const updateProfile = async (updates: Partial<User>) => {
    // Ideally create an /api/auth/update endpoint. 
    // For now we'll just update local state to reflect changes instantly.
    if (!user) return { error: new Error("Not authenticated") };
    
    // Simulate API call success
    setUser({ ...user, ...updates });
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signUp, 
      signIn, 
      signOut,
      updateProfile 
    }}>
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
