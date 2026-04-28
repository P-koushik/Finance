import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as GoogleSignInModule from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '../config/auth';

type AuthContextValue = {
  initializing: boolean;
  user: FirebaseAuthTypes.User | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type GoogleSigninApi = {
  configure: (options: { webClientId: string; offlineAccess: boolean }) => void;
  hasPlayServices: (options: {
    showPlayServicesUpdateDialog: boolean;
  }) => Promise<boolean>;
  signIn: () => Promise<
    | { type: 'cancelled'; data: null }
    | { type: 'success'; data: { idToken: string | null } }
  >;
  getTokens?: () => Promise<{ idToken: string; accessToken: string }>;
  signOut: () => Promise<null>;
};

const getGoogleSignin = () => {
  const module = GoogleSignInModule as typeof GoogleSignInModule & {
    default?: { GoogleSignin?: GoogleSigninApi };
  };
  const googleSignin = module.GoogleSignin ?? module.default?.GoogleSignin;

  if (!googleSignin) {
    throw new Error(
      'Google Sign-In is not available. Rebuild the native app after installing @react-native-google-signin/google-signin.',
    );
  }

  return googleSignin;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      getGoogleSignin().configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      });
    } catch {
      // Email/password auth can still work when Google Sign-In is unavailable.
    }

    try {
      return onAuthStateChanged(getAuth(), nextUser => {
        setUser(nextUser);
        setInitializing(false);
      });
    } catch {
      setInitializing(false);
      return undefined;
    }
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      await signInWithEmailAndPassword(getAuth(), email.trim(), password);
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const credential = await createUserWithEmailAndPassword(
        getAuth(),
        email.trim(),
        password,
      );

      await updateProfile(credential.user, { displayName: name.trim() });
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    const googleSignin = getGoogleSignin();

    await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await googleSignin.signIn();

    if (response.type === 'cancelled') {
      throw new Error('Google sign-in was cancelled.');
    }

    const idToken =
      response.data.idToken ?? (await googleSignin.getTokens?.())?.idToken;

    if (!idToken) {
      throw new Error('Google did not return an ID token.');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(getAuth(), googleCredential);
  }, []);

  const logout = useCallback(async () => {
    await Promise.allSettled([
      getGoogleSignin()
        .signOut()
        .catch(() => null),
      signOut(getAuth()),
    ]);
  }, []);

  const value = useMemo(
    () => ({
      initializing,
      user,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      logout,
    }),
    [
      initializing,
      user,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export function getAuthErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.';
  }

  const code =
    'code' in error && error.code ? String(error.code) : 'unknown-error';
  const message =
    'message' in error && error.message ? String(error.message) : '';

  switch (code) {
    case 'SIGN_IN_CANCELLED':
      return 'Google sign-in was cancelled.';
    case 'IN_PROGRESS':
      return 'Google sign-in is already in progress.';
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return 'Google Play Services is not available or needs to be updated.';
    case '10':
    case 'DEVELOPER_ERROR':
      return 'Google Sign-In configuration is invalid. Check Firebase SHA fingerprints and google-services.json.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase Authentication.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'The credentials were rejected. Check your Firebase Google provider and SHA setup.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return message
        ? `${message} (${code})`
        : `Authentication failed. Error code: ${code}`;
  }
}
