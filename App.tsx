import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/Firebase/FirebaseConfig';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/Context/Themecontext';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <ThemeProvider>
       <SafeAreaProvider>
         <AppNavigator />
       </SafeAreaProvider>
    </ThemeProvider>
  );
}
 