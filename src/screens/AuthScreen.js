import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { C } from '../constants';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const isLogin = mode === 'login';

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) setError(err.message);
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) setError(err.message);
        else setInfo('Check your email for a confirmation link.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <Text style={s.heroSub}>GARY WALKER METHOD · OVER 50s</Text>
          <Text style={s.heroTitle}>TRICON</Text>
          <Text style={s.heroSub2}>WORKOUT</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</Text>

          {error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}
          {info && (
            <View style={s.infoBox}>
              <Text style={s.infoText}>{info}</Text>
            </View>
          )}

          <Text style={s.label}>EMAIL</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor={C.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={s.label}>PASSWORD</Text>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor={C.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isLogin ? 'password' : 'new-password'}
          />

          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#0a0c0f" />
              : <Text style={s.submitBtnText}>{isLogin ? 'SIGN IN →' : 'CREATE ACCOUNT →'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setMode(isLogin ? 'signup' : 'login'); setError(null); setInfo(null); }} style={s.switchRow}>
            <Text style={s.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={s.switchLink}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  hero: { alignItems: 'center', marginBottom: 36 },
  heroSub: { fontSize: 10, color: C.dim, letterSpacing: 2, fontFamily: 'Oswald_400Regular', marginBottom: 4 },
  heroTitle: { fontFamily: 'Oswald_700Bold', fontSize: 52, color: C.text, lineHeight: 48, letterSpacing: 2 },
  heroSub2: { fontFamily: 'Oswald_700Bold', fontSize: 52, color: C.accent, lineHeight: 48, letterSpacing: 2 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24 },
  cardTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: C.text, letterSpacing: 1, marginBottom: 20 },
  errorBox: { backgroundColor: 'rgba(224,82,82,0.1)', borderWidth: 1, borderColor: 'rgba(224,82,82,0.3)', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: C.red, lineHeight: 18 },
  infoBox: { backgroundColor: 'rgba(76,175,125,0.1)', borderWidth: 1, borderColor: 'rgba(76,175,125,0.3)', borderRadius: 8, padding: 12, marginBottom: 16 },
  infoText: { fontSize: 13, color: C.green, lineHeight: 18 },
  label: { fontSize: 10, color: C.muted, letterSpacing: 1, fontFamily: 'Oswald_400Regular', marginBottom: 6 },
  input: {
    backgroundColor: '#0d1117', borderWidth: 1, borderColor: C.border,
    borderRadius: 10, color: C.text, paddingVertical: 13, paddingHorizontal: 14,
    fontSize: 15, marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: C.accent, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 15, color: '#0a0c0f', letterSpacing: 1 },
  switchRow: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 13, color: C.muted },
  switchLink: { color: C.accent, fontWeight: '700' },
});
