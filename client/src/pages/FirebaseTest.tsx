import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function FirebaseTest() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("test123456");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        console.log("Auth state changed:", user);
      });
      return unsubscribe;
    }
  }, []);

  const handleSignUp = async () => {
    if (!auth) {
      toast({
        title: "Firebase Error",
        description: "Firebase auth not initialized",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success!",
        description: "Account created successfully",
      });
      console.log("User created:", result.user);
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      console.error("Sign up error:", error);
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!auth) {
      toast({
        title: "Firebase Error",
        description: "Firebase auth not initialized",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success!",
        description: "Signed in successfully",
      });
      console.log("User signed in:", result.user);
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
      console.error("Sign in error:", error);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Firebase Auth Test</h1>
      
      <div className="space-y-4">
        <div>
          <label>Email:</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        
        <div>
          <label>Password:</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSignUp} disabled={loading}>
            Sign Up
          </Button>
          <Button onClick={handleSignIn} disabled={loading}>
            Sign In
          </Button>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded">
          <h3 className="font-semibold mb-2">Current User:</h3>
          {user ? (
            <div>
              <p>Email: {user.email}</p>
              <p>UID: {user.uid}</p>
              <p>✅ Authenticated</p>
            </div>
          ) : (
            <p>❌ Not authenticated</p>
          )}
        </div>

        <div className="mt-4 p-4 bg-muted rounded">
          <h3 className="font-semibold mb-2">Firebase Status:</h3>
          <p>Auth initialized: {auth ? "✅ Yes" : "❌ No"}</p>
          {auth && (
            <p>Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID}</p>
          )}
        </div>
      </div>
    </div>
  );
}
