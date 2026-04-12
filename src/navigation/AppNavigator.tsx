import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/Home';
import DashcamScreen from '../screens/Dashcam';
import ProfileScreen from '../screens/Profile';
import NearbyScreen from '../screens/Nearby';
import ReportScreen from '../screens/Report';

// Define types to prevent typos
export type RootStackParamList = {
  Home: undefined;
  Dashcam: undefined;
  Profile: undefined;
  Nearby: undefined;
  Report: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashcam" component={DashcamScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Nearby" component={NearbyScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;