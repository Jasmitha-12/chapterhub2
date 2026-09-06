import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  type User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../services/firebase';

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  syncProfile: (firebaseUser: User) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Prevent duplicate concurrent sync calls for the same UID
  const syncingUidRef = useRef<string | null>(null);

  /**
   * Synchronize or create the user profile document in Firestore:
   * chapterhub_users/{firebaseUser.uid}
   */
  const syncProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    if (syncingUidRef.current === firebaseUser.uid && profile) {
      return profile;
    }

    syncingUidRef.current = firebaseUser.uid;
    const userRef = doc(db, 'chapterhub_users', firebaseUser.uid);

    try {
      console.log(`[ChapterHub Auth] Checking profile at chapterhub_users/${firebaseUser.uid}...`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log(`[ChapterHub Auth] Profile does not exist yet. Creating chapterhub_users/${firebaseUser.uid}...`);

        // Strictly sanitized data (no undefined fields allowed in Firestore)
        const newProfileData = {
          name: firebaseUser.displayName || 'GRIET Member',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || null,
          role: 'MEMBER',
          createdAt: serverTimestamp(),
        };

        await setDoc(userRef, newProfileData);
        console.log(`[ChapterHub Auth] Successfully wrote chapterhub_users/${firebaseUser.uid} to Firestore.`);

        const createdProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: newProfileData.name,
          email: newProfileData.email,
          photoURL: newProfileData.photoURL,
          role: newProfileData.role,
        };

        setProfile(createdProfile);
        setAuthError(null);
        return createdProfile;
      } else {
        const data = userSnap.data();
        console.log(`[ChapterHub Auth] Existing profile loaded for UID: ${firebaseUser.uid}`, data);

        const loadedProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: data.name ?? firebaseUser.displayName ?? 'GRIET Member',
          email: data.email ?? firebaseUser.email ?? '',
          photoURL: data.photoURL ?? firebaseUser.photoURL ?? null,
          role: data.role ?? 'MEMBER',
        };

        setProfile(loadedProfile);
        setAuthError(null);
        return loadedProfile;
      }
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      console.error('[ChapterHub Auth Error] Firestore profile operation failed:', err);

      let friendlyMsg = 'Firestore profile creation failed.';
      if (errorObj.code === 'permission-denied') {
        friendlyMsg =
          'Firestore permission denied. Please verify that the rules in Firebase Console -> Firestore -> Rules allow authenticated users to read/create chapterhub_users/{uid}.';
      } else if (errorObj.message) {
        friendlyMsg = errorObj.message;
      }

      setAuthError(friendlyMsg);

      // Still construct an in-memory profile so user is not stuck with blank state
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'GRIET Member',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || null,
        role: 'MEMBER',
      };
      setProfile(fallbackProfile);

      throw err;
    } finally {
      syncingUidRef.current = null;
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthError('Firebase configuration is missing in .env');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            await syncProfile(firebaseUser);
          } catch (syncErr) {
            console.error('[ChapterHub] onAuthStateChanged sync error:', syncErr);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('[ChapterHub] onAuthStateChanged error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    if (!isFirebaseConfigured) {
      setAuthError('Firebase configuration is missing. Please check .env file.');
      return false;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);

      // Explicitly await the Firestore profile creation
      try {
        await syncProfile(result.user);
      } catch (profileErr: unknown) {
        const pErr = profileErr as { code?: string; message?: string };
        console.error('[ChapterHub] Profile sync threw during sign-in:', profileErr);
        if (pErr.code === 'permission-denied') {
          setAuthError(
            'Signed in to Google, but Firestore denied creating your profile. Please deploy the security rules in Firebase Console.'
          );
        }
      }

      return true;
    } catch (err: unknown) {
      console.error('[ChapterHub] Google Sign-in popup error:', err);
      const errorObj = err as { code?: string; message?: string };
      let message = 'Failed to sign in with Google. Please try again.';

      if (errorObj.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in window was closed before completing.';
      } else if (errorObj.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by your browser. Please allow popups for this page.';
      } else if (errorObj.code === 'auth/cancelled-popup-request') {
        message = 'Only one sign-in window can be open at a time.';
      } else if (errorObj.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (errorObj.message) {
        message = errorObj.message;
      }

      setAuthError(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setAuthError(null);
    } catch (err) {
      console.error('[ChapterHub] Sign-out error:', err);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signInWithGoogle,
        logout,
        clearAuthError,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
