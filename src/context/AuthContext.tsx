
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

// Real API functions to interact with the backend
const apiLogin = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store the token
    localStorage.setItem('token', data.token);
    
    // Get user profile with the token
    const userResponse = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${data.token}`,
      },
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const userData = await userResponse.json();
    
    return {
      id: userData._id,
      email: userData.email,
      name: userData.name,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const apiSignup = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  try {
    // Validate password
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    // After successful registration, login the user
    return await apiLogin(email, password);
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
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
      const user = await apiLogin(email, password);
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
      const user = await apiSignup(email, password, name);
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
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
