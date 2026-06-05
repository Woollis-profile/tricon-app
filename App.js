import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import * as Updates from 'expo-updates';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Oswald_400Regular,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';

import { supabase } from './lib/supabase';
import { AppProvider, useAppContext } from './src/context';
import { C } from './src/constants';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import StatsScreen from './src/screens/StatsScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import FridayPickerScreen from './src/screens/FridayPickerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { id: 'Home', icon: '⌂', label: 'HOME', component: HomeScreen },
  { id: 'Plan', icon: '▦', label: 'PLAN', component: CalendarScreen },
  { id: 'Stats', icon: '◎', label: 'STATS', component: StatsScreen },
  { id: 'Library', icon: '≡', label: 'LIBRARY', component: LibraryScreen },
  { id: 'Settings', icon: '⚙', label: 'SETTINGS', component: SettingsScreen },
];

function TabIcon({ icon, label, focused }) {
  return (
    <View style={tb.iconWrap}>
      <Text style={[tb.icon, focused && { color: C.accent }]}>{icon}</Text>
      <Text style={[tb.label, focused && { color: C.accent }]}>{label}</Text>
      {focused && <View style={tb.indicator} />}
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [tb.bar, { position: 'absolute', paddingBottom: insets.bottom }],
        tabBarShowLabel: false,
      }}
    >
      {TABS.map(({ id, icon, label, component }) => (
        <Tab.Screen key={id} name={id} component={component}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={icon} label={label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isReady } = useAppContext();
  if (!isReady) {
    return (
      <View style={s.splash}>
        <Text style={s.splashText}>TRICON</Text>
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="FridayPicker" component={FridayPickerScreen}
        options={{ presentation: 'modal', title: 'FRIDAY KETTLEBELL' }} />
    </Stack.Navigator>
  );
}

function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading

  useEffect(() => {
    // Restore persisted session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Keep session in sync with Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still checking for a persisted session
  if (session === undefined) {
    return (
      <View style={s.splash}>
        <Text style={s.splashText}>TRICON</Text>
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return children;
}

async function checkForUpdates() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (e) {
    // silently fail — never block the user
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({ Oswald_400Regular, Oswald_600SemiBold, Oswald_700Bold });

  useEffect(() => {
    checkForUpdates();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={s.splash}>
        <Text style={{ fontSize: 28, color: C.accent }}>TRICON</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthGate>
        <AppProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </AuthGate>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  splashText: { fontFamily: 'Oswald_700Bold', fontSize: 28, color: C.accent },
});

const tb = StyleSheet.create({
  bar: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: 60,
    paddingBottom: 0,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  icon: { fontSize: 18, lineHeight: 20, color: C.muted },
  label: { fontSize: 9, fontFamily: 'Oswald_700Bold', letterSpacing: 1, color: C.muted },
  indicator: { width: 16, height: 2, backgroundColor: C.accent, borderRadius: 1, marginTop: 1 },
});
