import 'react-native-url-polyfill/auto';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Oswald_400Regular,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';

import { AppProvider, useAppContext } from './src/context';
import { C } from './src/constants';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tb.bar,
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
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Oswald_700Bold', fontSize: 28, color: C.accent }}>TRICON</Text>
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

export default function App() {
  const [fontsLoaded] = useFonts({ Oswald_400Regular, Oswald_600SemiBold, Oswald_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, color: C.accent }}>TRICON</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const tb = StyleSheet.create({
  bar: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: 60,
    paddingBottom: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: { fontSize: 18, lineHeight: 20, color: C.muted },
  label: { fontSize: 9, fontFamily: 'Oswald_700Bold', letterSpacing: 1, color: C.muted },
  indicator: { width: 16, height: 2, backgroundColor: C.accent, borderRadius: 1, marginTop: 1 },
});
