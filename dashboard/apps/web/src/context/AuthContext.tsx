import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';

const API_BASE = 'http://localhost:4000';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  loginAs: (user: User) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (res.ok) {
          const users = (await res.json()) as User[];
          setAllUsers(users);
          // Default initial user to Amara (Admin)
          setCurrentUser(users[0] ?? null);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  async function loginAs(user: User) {
    setCurrentUser(user);
    try {
      await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (err) {
      console.error('Login error:', err);
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, allUsers, loginAs, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
