import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, profileImage?: string | null) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth not initialized");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get or create user in database
          const token = await firebaseUser.getIdToken();
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Firebase-UID": firebaseUser.uid,
            },
          });

          if (response.status === 404) {
            // User doesn't exist in database, create them
            await apiRequest("POST", "/api/auth/register", {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              profileImage: firebaseUser.photoURL || null, // Get Google profile image
              role: "customer",
            });
          }

          const userData = await response.json();
          setIsAdmin(userData.role === "admin");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, profileImage?: string | null) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user in database
    await apiRequest("POST", "/api/auth/register", {
      firebaseUid: result.user.uid,
      email: result.user.email!,
      name,
      profileImage: profileImage || null, // Use provided image or null
      role: "customer",
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Create user in database if they don't exist
    try {
      await apiRequest("POST", "/api/auth/register", {
        firebaseUid: result.user.uid,
        email: result.user.email!,
        name: result.user.displayName || result.user.email!.split("@")[0],
        profileImage: result.user.photoURL || null, // Get Google profile image
        role: "customer",
      });
    } catch (error) {
      // User might already exist, that's OK
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
