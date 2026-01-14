import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthResponse, authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: Omit<User, 'id'>) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email'>>) => Promise<AuthResponse>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (userData: Omit<User, 'id'>): Promise<AuthResponse> => {
    const result = await authService.register(userData);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const updateProfile = async (updates: Partial<Omit<User, 'id' | 'email'>>): Promise<AuthResponse> => {
    const result = await authService.updateProfile(updates);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    updateProfile,
    logout,
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
