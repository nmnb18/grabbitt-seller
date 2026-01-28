/**
 * Type declarations for modules without built-in types
 */

// Lottie React Native
declare module 'lottie-react-native' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  export interface AnimatedLottieViewProps {
    source: object | string;
    style?: StyleProp<ViewStyle>;
    loop?: boolean;
    autoPlay?: boolean;
    speed?: number;
    progress?: number;
    onAnimationFinish?: () => void;
    colorFilters?: Array<{
      keypath: string;
      color: string;
    }>;
  }

  export default class LottieView extends Component<AnimatedLottieViewProps> {
    play(): void;
    reset(): void;
    pause(): void;
    resume(): void;
  }
}

// Firebase App
declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }

  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
  }

  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

// Firebase Auth
declare module 'firebase/auth' {
  import { FirebaseApp } from 'firebase/app';

  export interface Auth {
    currentUser: User | null;
    tenantId: string | null;
  }

  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    getIdToken(forceRefresh?: boolean): Promise<string>;
  }

  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType: string;
  }

  export interface ConfirmationResult {
    confirm(verificationCode: string): Promise<UserCredential>;
    verificationId: string;
  }

  export interface PhoneAuthProvider {
    providerId: string;
  }

  export function getAuth(app?: FirebaseApp): Auth;
  export function getReactNativePersistence(storage: any): any;
  export function initializeAuth(app: FirebaseApp, config?: object): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function onAuthStateChanged(auth: Auth, callback: (user: User | null) => void): () => void;

  export const PhoneAuthProvider: {
    PROVIDER_ID: string;
  };
}
