import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyAb1aSDCkyxJd6lkLJ4JzRgmtOL-QxA9J4',
  projectId: 'chuma-26',
  storageBucket: 'chuma-26.firebasestorage.app',
  messagingSenderId: '854743456929',
  appId: '1:854743456929:android:adf9c8fef359cd170964e0',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
