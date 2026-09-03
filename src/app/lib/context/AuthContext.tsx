'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
    id: number;
    email: string | null;
    username: string;
    role: string;
    hasRestaurant: boolean;
    passwordChangeRequired: boolean;
    profilePhotoUrl?: string | null;
    restaurantLogoUrl?: string | null;
    restaurantName: string;
    restaurantLocation: string;
    latitude: number;
    longitude: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    refreshUser: async () => { },
    logout: () => { }
})

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);

            const response = await fetch('/api/auth/me', {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            })

            // If unauthorized or not found, the backend session is invalid
            if (response.status === 401 || response.status === 404) {
                // Clear everything
                setUser(null);
                sessionStorage.removeItem('user');

                // Clear the JWT cookie by calling logout endpoint
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                setLoading(false);
                return;
            }

            if (!response.ok) throw new Error('Failed to get user info!');

            const userData = await response.json();

            setUser(userData);
            // Save to sessionStorage
            sessionStorage.setItem('user', JSON.stringify(userData));

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unknown error');

            // Keep the current session during a transient background refresh failure.
            if (showLoading) {
                setUser(null);
                sessionStorage.removeItem('user');
            }
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, [])

    const refreshUser = useCallback(() => fetchUser(false), [fetchUser]);

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
    }

    useEffect(() => {
        // Always fetch from server to ensure we have the latest user data
        // This is important for role-based access control
        fetchUser(true);
    }, [fetchUser])

    return (
        <AuthContext.Provider value={{ user, loading, error, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
