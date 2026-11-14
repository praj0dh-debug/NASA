import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export interface CadetProfile {
  id: string;
  nickname: string;
  callsign: string;
  avatar: string;
  ageGroup: '5-7' | '8-10' | '11+';
  consentGranted: boolean;
  parentEmail?: string;
  classCode?: string;
  role: 'cadet' | 'teacher';
  createdAt: string;
}

interface UserContextType {
  profile: CadetProfile | null;
  setProfile: (profile: CadetProfile | null) => void;
  updateProfile: (updates: Partial<CadetProfile>) => void;
  isLoggedIn: boolean;
  logout: () => void;
  isTeacherMode: boolean;
  setTeacherMode: (val: boolean) => void;
}

const STORAGE_KEY = 'junior_astronaut_profile_v1';

const defaultCadet: CadetProfile = {
  id: 'cadet-nova-001',
  nickname: 'Cadet Nova',
  callsign: 'STAR-SEEKER',
  avatar: '👨‍🚀',
  ageGroup: '8-10',
  classCode: 'NASA-CADET-5A',
  consentGranted: true,
  role: 'cadet',
  createdAt: new Date().toISOString()
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<CadetProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultCadet;
    } catch {
      return defaultCadet;
    }
  });

  const [isTeacherMode, setTeacherMode] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      // Sync cadet profile to backend roster
      apiClient.enrollCadet({
        id: profile.id,
        nickname: profile.nickname,
        callsign: profile.callsign,
        avatar: profile.avatar,
        classCode: profile.classCode || 'NASA-CADET-5A',
        ageGroup: profile.ageGroup
      }).catch(() => {
        // Fall back gracefully offline
      });
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [profile]);

  const setProfile = (newProfile: CadetProfile | null) => {
    setProfileState(newProfile);
  };

  const updateProfile = (updates: Partial<CadetProfile>) => {
    setProfileState(prev => (prev ? { ...prev, ...updates } : null));
  };

  const logout = () => {
    setProfileState(null);
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        isLoggedIn: !!profile,
        logout,
        isTeacherMode,
        setTeacherMode
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
