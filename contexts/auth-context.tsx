// Purpose: Provides a global context for the current user's authentication state.
// This allows any component in the app to access the user object and loading state.

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Define the shape of the context data.
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Create the context with a default value.
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// The provider component that wraps the application.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Unsubscribe on component unmount to prevent memory leaks.
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the auth context.
export const useAuth = () => useContext(AuthContext);
