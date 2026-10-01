'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  phone?: string;
  address?: string;
  savedAddresses?: SavedAddress[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  addAddress: (address: Omit<SavedAddress, 'id'>) => SavedAddress;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const DEFAULT_SAMPLE_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    name: 'Gulmohar Customer',
    phone: '+91 98765 43210',
    street: 'Flat 402, Royal Residency, Hill Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'Work',
    name: 'Gulmohar Customer',
    phone: '+91 98765 43210',
    street: 'Suite 12, Corporate Tower, BKC Commercial Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    isDefault: false
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('gulmohar_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (!parsed.savedAddresses || parsed.savedAddresses.length === 0) {
          parsed.savedAddresses = DEFAULT_SAMPLE_ADDRESSES;
        }
        setUser(parsed);
      } catch (e) {
        console.error('Failed to load user');
      }
    }
  }, []);

  const saveUserToStorage = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('gulmohar_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('gulmohar_user');
    }
  };

  const login = (email: string, name = 'Customer') => {
    const newUser: UserProfile = {
      id: Date.now(),
      name: name || 'Customer',
      email: email || '',
      phone: '+91 98765 43210',
      address: 'Flat 402, Royal Residency, Hill Road, Mumbai 400050',
      savedAddresses: DEFAULT_SAMPLE_ADDRESSES
    };
    saveUserToStorage(newUser);
  };

  const logout = () => {
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
        isAuthenticated: Boolean(user),
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

