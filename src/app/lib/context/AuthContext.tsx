'use client';

import { createContext,useContext,useState,useEffect,ReactNode } from "react";

interface User {
    id:number;
    email: string | null;
    username: string;
    role: string;
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
    refreshUser: async () => {},
    logout: () => {}
})

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({children} : {children:ReactNode}){

    const [user, setUser] = useState<User|null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('api/auth/me',{
                method: "GET",
                credentials: "include"
            })

            if(!response.ok) throw new Error('Failed to get user info!');

            const userData = await response.json();
            setUser(userData);
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(userData));

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unknown error');
            setUser(null);
            localStorage.removeItem('user');
        }finally{
            setLoading(false);
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    }

    useEffect(() => {
        // First, check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setLoading(false);
            } catch (error) {
                // If parsing fails, fetch from server
                fetchUser();
            }
        } else {
            // No stored user, fetch from server
            fetchUser();
        }
    }, [])

    return(
        <AuthContext.Provider value={{user,loading,error,refreshUser: fetchUser,logout}}>
            {children}
        </AuthContext.Provider>
    )

}
