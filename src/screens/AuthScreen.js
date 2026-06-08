import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ImageBackground, StyleSheet,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
  Image, Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const GOLD     = '#c8a96e';
const BG_DARK  = '#111318';
const BTN_TEXT = '#0a0c0f';

export default function AuthScreen() {
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) setError(err.message);
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) setError(err.message);
      }
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={require('../../assets/gym-bg.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={s.overlay} />

        <View style={s.content}>
          <Image
            source={require('../../assets/tricon-logo.png')}
            style={s.logo}
            resizeMode="contain"
          />

          <Image
            source={require('../../assets/tricon-wordmark.png')}
            style={s.wordmark}
            resizeMode="contain"
          />

          <Text style={s.tagline}>
            TRAINING METHOD FOR THE OLDER AND WISER ATHLETE
          </Text>

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'login' ? 'password' : 'new-password'}
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity
            style={s.btn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading ? (
              <ActivityIndicator color={GOLD} />
            ) : (
              <Text style={s.btnText}>
                {mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
            <Text style={s.toggle}>
              {mode === 'login' ? 'New here? Create Account' : 'Already a member? Log In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Restore Purchase', 'This feature is coming soon.')}
            activeOpacity={0.7}
          >
            <Text style={s.restore}>MEMBER ALREADY? RESTORE PURCHASE</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 140,
    height: 140,
  },
  wordmark: {
    width: 220,
    height: 48,
    marginTop: 10,
  },
  tagline: {
    fontSize: 10,
    color: GOLD,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 36,
    paddingHorizontal: 30,
    fontWeight: '600',
  },
  input: {
    backgroundColor: BG_DARK,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    color: '#fff',
    padding: 14,
    fontSize: 15,
    marginBottom: 10,
    width: 340,
    alignSelf: 'center',
  },
  error: {
    color: '#e05252',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  btn: {
    backgroundColor: GOLD,
    width: 340,
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: BTN_TEXT,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  toggle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
  },
  restore: {
    fontSize: 11,
    color: GOLD,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 1.5,
    opacity: 0.7,
  },
});
