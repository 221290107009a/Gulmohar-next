'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { revokeWebLoginToken } from '@/lib/api';

export interface SavedAddress {
  id: string;
  label: string; // 'Home' | 'Work' | 'Other'
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  accessToken?: string;
  referralCode?: string;
  referredByCode?: string;
  referralShareSource?: string;
  phone?: string;
  address?: string;
  savedAddresses?: SavedAddress[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (email: string, name?: string, options?: {
    userId?: number;
    accessToken?: string;
    phone?: string;
    referralCode?: string;
    referredByCode?: string;
    referralShareSource?: string;
  }) => void;
  logout: () => void;
  addAddress: (address: Omit<SavedAddress, 'id'>) => SavedAddress;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createReferralCode(email: string): string {
  let hash = 2166136261;
  for (const character of email.trim().toLowerCase()) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return `GUL${(hash >>> 0).toString(36).toUpperCase().padStart(7, '0')}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const incomingReferralCode = searchParams.get('ref');
    if (incomingReferralCode) {
      sessionStorage.setItem('gulmohar_referral_code', incomingReferralCode);
      const incomingSource = searchParams.get('source');
      if (incomingSource) sessionStorage.setItem('gulmohar_referral_source', incomingSource);
    }

    const savedUser = localStorage.getItem('gulmohar_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserProfile;
        parsed.referralCode ||= createReferralCode(parsed.email || String(parsed.id));
        parsed.savedAddresses ||= [];
        // Restore persisted state after client hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsed);
        localStorage.setItem('gulmohar_user', JSON.stringify(parsed));
      } catch {
        console.error('Failed to load user');
      }
    }
    // Mark local session hydration complete before protected routes decide where to send the user.
    setIsAuthReady(true);
  }, []);

  const saveUserToStorage = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('gulmohar_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('gulmohar_user');
    }
  };

  const login = (email: string, name = 'Customer', options?: {
    userId?: number;
    accessToken?: string;
    phone?: string;
    referralCode?: string;
    referredByCode?: string;
    referralShareSource?: string;
  }) => {
    const referralCode = options?.referredByCode || sessionStorage.getItem('gulmohar_referral_code') || undefined;
    const shareSource = options?.referralShareSource || sessionStorage.getItem('gulmohar_referral_source') || undefined;
    const newUser: UserProfile = {
      id: options?.userId || Date.now(),
      name: name || 'Customer',
      email: email || '',
      accessToken: options?.accessToken,
      referralCode: options?.referralCode || createReferralCode(email),
      referredByCode: referralCode,
      referralShareSource: shareSource,
      phone: options?.phone || '',
      address: '',
      savedAddresses: []
    };
    saveUserToStorage(newUser);
  };

  const logout = () => {
    if (user?.accessToken) {
      void revokeWebLoginToken(user.accessToken);
    }
    saveUserToStorage(null);
  };

  const addAddress = (addrInput: Omit<SavedAddress, 'id'>): SavedAddress => {
    const newAddr: SavedAddress = {
      ...addrInput,
      id: `addr-${Date.now()}`
    };

    if (!user) {
      return newAddr;
    }

    const currentAddrs = user.savedAddresses || [];
    const isFirst = currentAddrs.length === 0;

    let updatedAddrs = [...currentAddrs];
    if (newAddr.isDefault || isFirst) {
      newAddr.isDefault = true;
      updatedAddrs = updatedAddrs.map(a => ({ ...a, isDefault: false }));
    }

    updatedAddrs.push(newAddr);

    const updatedUser: UserProfile = {
      ...user,
      address: newAddr.isDefault ? `${newAddr.street}, ${newAddr.city} - ${newAddr.pincode}` : user.address,
      savedAddresses: updatedAddrs
    };

    saveUserToStorage(updatedUser);
    return newAddr;
  };

  const removeAddress = (id: string) => {
    if (!user || !user.savedAddresses) return;
    const updatedAddrs = user.savedAddresses.filter(a => a.id !== id);
    saveUserToStorage({ ...user, savedAddresses: updatedAddrs });
  };

  const setDefaultAddress = (id: string) => {
    if (!user || !user.savedAddresses) return;
    let selectedStr = user.address;
    const updatedAddrs = user.savedAddresses.map(a => {
      if (a.id === id) {
        selectedStr = `${a.street}, ${a.city} - ${a.pincode}`;
        return { ...a, isDefault: true };
      }
      return { ...a, isDefault: false };
    });
    saveUserToStorage({ ...user, address: selectedStr, savedAddresses: updatedAddrs });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user?.accessToken),
        isAuthReady,
        login,
        logout,
        addAddress,
        removeAddress,
        setDefaultAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

