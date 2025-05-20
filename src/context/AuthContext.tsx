
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

// Mock API functions - in a real app, these would call your backend
const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Mock authentication - in a real app, this would validate with your backend
  if (password.length < 6) {
    throw new Error("Invalid credentials");
  }
  
  // Return a mock user
  return {
    id: "user-1",
    email,
    name: email.split("@")[0],
  };
};

const mockSignup = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Mock validation
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  
  // Return a mock user
  return {
    id: "new-user-" + Date.now(),
    email,
    name,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const user = await mockLogin(email, password);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      const user = await mockSignup(email, password, name);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
