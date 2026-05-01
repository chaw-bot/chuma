import { NativeModules } from 'react-native';

type AuthModule = {
  signInWithPhoneNumber(
    phone: string,
    forceResend?: boolean
  ): Promise<{ confirm(code: string): Promise<unknown> }>;
  signOut(): Promise<void>;
};

const demoAuth: AuthModule = {
  async signInWithPhoneNumber() {
    return {
      async confirm(code) {
        if (code.length < 6) {
          throw new Error('[auth/invalid-verification-code]');
        }
      },
    };
  },
  async signOut() {},
};

let firebaseAuth: AuthModule = demoAuth;

if (NativeModules.RNFBAppModule) {
  const { getAuth, signInWithPhoneNumber, signOut } = require('@react-native-firebase/auth');
  const auth = getAuth();
  firebaseAuth = {
    signInWithPhoneNumber: (phone, forceResend) =>
      signInWithPhoneNumber(auth, phone, forceResend),
    signOut: () => signOut(auth),
  };
}

export default firebaseAuth;
