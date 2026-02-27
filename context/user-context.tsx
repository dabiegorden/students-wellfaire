"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "students";
  studentId?: string;
  faculty?: string;
  programme?: string;
  level?: string;
  staffId?: string;
  department?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data from API based on token
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user data:", data);
        setUser(data.user);
        // Update localStorage with fresh user data
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      } else {
        // Token invalid or expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Load user on mount
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token) {
          // Try to fetch fresh user data
          const userData = await fetchUserData(token);
          if (!userData && storedUser) {
            // Fallback to stored user if API fails
            setUser(JSON.parse(storedUser));
          }
        } else if (storedUser) {
          // Clear stale user data if no token
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Login function to be called after successful login
  const login = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Refresh user data
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await fetchUserData(token);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem("token");

      // Call logout API
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage and state regardless of API result
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
