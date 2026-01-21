"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
};

// Demo users for testing (in production, this would be from a database)
const DEMO_USERS = [
  {
    id: "user-1",
    name: "John Smith",
    email: "john@example.com",
    password: "Password123",
    company: "Acme Corp",
    role: USER_ROLES.ADMIN,
    createdAt: "2024-01-01",
  },
  {
    id: "user-2",
    name: "Jane Doe",
    email: "jane@example.com",
    password: "Password123",
    company: "Tech Solutions",
    role: USER_ROLES.USER,
    createdAt: "2024-01-15",
  },
  {
    id: "user-3",
    name: "Mike Johnson",
    email: "mike@example.com",
    password: "Password123",
    company: "Industrial Ltd",
    role: USER_ROLES.VIEWER,
    createdAt: "2024-02-01",
  },
];

// Storage keys
const STORAGE_KEYS = {
  TOKEN: "rfp_auth_token",
  USER: "rfp_auth_user",
  USERS: "rfp_users_db",
  PRODUCTS: "rfp_products_db",
  PASSWORD_RESETS: "rfp_password_resets",
};

export { STORAGE_KEYS };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Initialize users database
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!storedUsers) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
        setUsers(DEMO_USERS);
      } else {
        setUsers(JSON.parse(storedUsers));
      }
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (e) {
          // Invalid stored data, clear it
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }
      setLoading(false);
    }
  }, []);

  // Generate simple token
  const generateToken = () => {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get users from storage
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const usersDb = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;

      // Find user
      const foundUser = usersDb.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!foundUser) {
        return { success: false, error: "Invalid email or password" };
      }

      // Create session
      const newToken = generateToken();
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        company: foundUser.company,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
      };

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSession));

      setToken(newToken);
      setUser(userSession);

      return { success: true, user: userSession };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  }, []);

  // Signup function
  const signup = useCallback(async (name, email, password, company) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get existing users
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const usersDb = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;

      // Check if email already exists
      const existingUser = usersDb.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        return { success: false, error: "Email already registered" };
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        company,
        role: USER_ROLES.USER, // Default role for new users
        createdAt: new Date().toISOString().split("T")[0],
      };

      // Add to users database
      const updatedUsers = [...usersDb, newUser];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      // Create session
      const newToken = generateToken();
      const userSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        company: newUser.company,
        role: newUser.role,
        createdAt: newUser.createdAt,
      };

      // Store session
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSession));

      setToken(newToken);
      setUser(userSession);

      return { success: true, user: userSession };
    } catch (error) {
      return { success: false, error: error.message || "Signup failed" };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const usersDb = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;

      const foundUser = usersDb.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      const expiresAt = Date.now() + 15 * 60 * 1000;

      const storedResets = localStorage.getItem(STORAGE_KEYS.PASSWORD_RESETS);
      const resetsDb = storedResets ? JSON.parse(storedResets) : [];

      const updatedResets = [
        ...resetsDb.filter((r) => r.email.toLowerCase() !== email.toLowerCase()),
        {
          token,
          email,
          expiresAt,
          createdAt: Date.now(),
          valid: !!foundUser,
        },
      ];

      localStorage.setItem(STORAGE_KEYS.PASSWORD_RESETS, JSON.stringify(updatedResets));

      return {
        success: true,
        resetUrl: `/forgot-password?token=${encodeURIComponent(token)}`,
      };
    } catch (error) {
      return { success: false, error: error.message || "Failed to request password reset" };
    }
  }, []);

  const resetPassword = useCallback(async (resetToken, newPassword) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const storedResets = localStorage.getItem(STORAGE_KEYS.PASSWORD_RESETS);
      const resetsDb = storedResets ? JSON.parse(storedResets) : [];

      const resetEntry = resetsDb.find((r) => r.token === resetToken);
      if (!resetEntry || !resetEntry.valid) {
        return { success: false, error: "Invalid reset link" };
      }

      if (Date.now() > resetEntry.expiresAt) {
        return { success: false, error: "Reset link expired" };
      }

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const usersDb = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;

      const userIndex = usersDb.findIndex(
        (u) => u.email.toLowerCase() === resetEntry.email.toLowerCase()
      );

      if (userIndex === -1) {
        return { success: false, error: "Account not found" };
      }

      const updatedUsers = [...usersDb];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      const updatedResets = resetsDb.filter((r) => r.token !== resetToken);
      localStorage.setItem(STORAGE_KEYS.PASSWORD_RESETS, JSON.stringify(updatedResets));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Failed to reset password" };
    }
  }, []);

  // Check if user owns a resource
  const isOwner = useCallback(
    (resourceOwnerId) => {
      return user && user.id === resourceOwnerId;
    },
    [user]
  );

  // Check if user has specific role
  const hasRole = useCallback(
    (requiredRole) => {
      if (!user) return false;
      if (user.role === USER_ROLES.ADMIN) return true; // Admin has all permissions
      return user.role === requiredRole;
    },
    [user]
  );

  // Check if user can edit (owner or admin)
  const canEdit = useCallback(
    (resourceOwnerId) => {
      if (!user) return false;
      if (user.role === USER_ROLES.ADMIN) return true;
      return user.id === resourceOwnerId;
    },
    [user]
  );

  // Check if user can delete (owner or admin)
  const canDelete = useCallback(
    (resourceOwnerId) => {
      if (!user) return false;
      if (user.role === USER_ROLES.ADMIN) return true;
      return user.id === resourceOwnerId;
    },
    [user]
  );

  // Check if user can create resources
  const canCreate = useCallback(() => {
    if (!user) return false;
    return user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.USER;
  }, [user]);

  // Get auth headers for API calls
  const getAuthHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    isOwner,
    hasRole,
    canEdit,
    canDelete,
    canCreate,
    getAuthHeader,
    USER_ROLES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
