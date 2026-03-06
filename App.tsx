import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigation from './src/navigation/AppNavigation';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  useEffect(() => {
    useAuthStore.getState().initAuth();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigation />
    </>
  );
}
