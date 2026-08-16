// ============================================================
// AuthContext.jsx — Global state untuk autentikasi
// Menyediakan: currentUser, userProfile, role, loading
// ============================================================
import { createContext, useState, useEffect } from 'react';
import { onAuthChange, getUserProfile } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const role = userProfile?.role || null;
  const isAdmin = role === 'Admin';

  const value = {
    currentUser,
    userProfile,
    role,
    isAdmin,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
