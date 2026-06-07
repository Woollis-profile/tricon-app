import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Svg, Polygon, G, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const GOLD      = '#e3b23f';
const GOLD_DEEP = '#cf9a2b';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [modalMode, setModalMode] = useState(null); // null | 'login' | 'signup'
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [info,      setInfo]      = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }
    setError(''); setInfo('');
    setLoading(true);
    try {
      if (modalMode === 'login') {
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
    <ImageBackground
      source={require('../../assets/gym-bg.png')}
      style={s.screen}
      resizeMode="cover"
    >
      {/* Scrim layers */}
      <View style={s.scrimDim} />
      <View style={s.scrim} />

      {/* Top wordmark */}
      <View style={[s.topmark, { paddingTop: insets.top + 20 }]}>
        <Svg width={22} height={22} viewBox="0 0 300 300">
          <Polygon
            points="150,52 248,222 52,222"
            stroke="#ffffff"
            strokeWidth={22}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <Text style={s.tt}>TRICON</Text>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.logo}>
          {/* Barbell SVG — exact rects from web source */}
          <Svg style={StyleSheet.absoluteFill} viewBox="0 0 440 440">
            <G transform="translate(220 220) scale(1.2) translate(-220 -220)">
              <G transform="translate(220 305) rotate(0)" fill="#1b1a18">
                <Rect x={-147.224} y={-3.5} width={294.448} height={7}   rx={3.5}/>
                <Rect x={77}       y={-9}   width={5}       height={18}  rx={2}/>
                <Rect x={88}       y={-27}  width={9.5}     height={54}  rx={3}/>
                <Rect x={101}      y={-22}  width={9}       height={44}  rx={3}/>
                <Rect x={114}      y={-17}  width={8.5}     height={34}  rx={2.5}/>
                <Rect x={-82}      y={-9}   width={5}       height={18}  rx={2}/>
                <Rect x={-97.5}    y={-27}  width={9.5}     height={54}  rx={3}/>
                <Rect x={-110}     y={-22}  width={9}       height={44}  rx={3}/>
                <Rect x={-122.5}   y={-17}  width={8.5}     height={34}  rx={2.5}/>
              </G>
              <G transform="translate(146.388 177.5) rotate(-60)" fill="#1b1a18">
                <Rect x={-147.224} y={-3.5} width={294.448} height={7}   rx={3.5}/>
                <Rect x={77}       y={-9}   width={5}       height={18}  rx={2}/>
                <Rect x={88}       y={-27}  width={9.5}     height={54}  rx={3}/>
                <Rect x={101}      y={-22}  width={9}       height={44}  rx={3}/>
                <Rect x={114}      y={-17}  width={8.5}     height={34}  rx={2.5}/>
                <Rect x={-82}      y={-9}   width={5}       height={18}  rx={2}/>
                <Rect x={-97.5}    y={-27}  width={9.5}     height={54}  rx={3}/>
                <Rect x={-110}     y={-22}  width={9}       height={44}  rx={3}/>
                <Rect x={-122.5}   y={-17}  width={8.5}     height={34}  rx={2.5}/>
              </G>
              <G transform="translate(293.612 177.5) rotate(60)" fill="#1b1a18">
                <Rect x={-147.224} y={-3.5} width={294.448} height={7}   rx={3.5}/>
                <Rect x={77}       y={-9}   width={5}       height={18}  rx={2}/>
                <Rect x={88}       y={-27}  width={9.5}     height={54}  rx={3}/>
                <Rect x={101}      y={-22}  width={9}       height={44}  rx={3}/>
                <Rect x={114}      y={-17}  width={8.5}     height={34}  rx={2.5}/>
                <Rect x={-82}      y={-9}   width={5}       height={18}  rx={2}/>
                <Rect x={-97.5}    y={-27}  width={9.5}     height={54}  rx={3}/>
                <Rect x={-110}     y={-22}  width={9}       height={44}  rx={3}/>
                <Rect x={-122.5}   y={-17}  width={8.5}     height={34}  rx={2.5}/>
              </G>
            </G>
          </Svg>
          {/* Cream cut layer — hides barbell bars behind wordlock */}
          <View style={s.cut} />
          {/* Wordlock */}
          <View style={s.wordlock}>
            <Text style={s.tricon}>TRICON</Text>
            <Text style={s.training}>TRAINING</Text>
          </View>
        </View>
        <Text style={s.tagline}>TRAINING METHOD FOR THE OLDER AND WISER ATHLETE</Text>
      </View>

      {/* Actions */}
      <View style={[s.actions, { paddingBottom: insets.bottom + 30 }]}>
        <TouchableOpacity style={s.btnLight} onPress={() => setModalMode('signup')}>
          <Text style={s.btnLightText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnGold} onPress={() => setModalMode('login')}>
          <Text style={s.btnGoldText}>LOG IN</Text>
        </TouchableOpacity>
        <Text style={s.signin}>
          MEMBER ALREADY? <Text style={s.signinGold}>RESTORE PURCHASE</Text>
        </Text>
      </View>

      {/* Auth Modal */}
      <Modal visible={modalMode !== null} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalSheet}>
              <TouchableOpacity
                onPress={() => { setModalMode(null); setError(''); setInfo(''); }}
                style={s.modalClose}
              >
                <Text style={s.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={s.modalTitle}>
                {modalMode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
              </Text>
              {error ? <View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View> : null}
              {info  ? <View style={s.infoBanner}><Text style={s.infoText}>{info}</Text></View>   : null}
              <TextInput
                style={s.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={s.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={s.btnGold} onPress={handleSubmit} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#2e2206" />
                  : <Text style={s.btnGoldText}>
                      {modalMode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  screen:   { flex: 1 },
  scrimDim: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', opacity: 0.28 },
  scrim:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },

  // Top wordmark
  topmark: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 30 },
  tt: { fontFamily: 'Oswald_600SemiBold', fontSize: 16, letterSpacing: 6, color: GOLD },

  // Hero
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30, paddingHorizontal: 24 },
  logo: {
    width: 300, height: 300, borderRadius: 150,
    borderWidth: 4, borderColor: GOLD,
    backgroundColor: '#f2eee3',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    transform: [{ translateY: -19 }],
  },
  cut: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#f2eee3',
    top: '31%', bottom: '49%', left: '5%', right: '5%',
  },
  wordlock: { alignItems: 'center', transform: [{ translateY: -19 }] },
  tricon:   { fontFamily: 'Oswald_700Bold', fontSize: 58, color: GOLD, lineHeight: 62 },
  training: { fontFamily: 'Oswald_600SemiBold', fontSize: 18, letterSpacing: 8, color: '#1b1a18', marginTop: 3 },
  tagline:  { fontSize: 13, letterSpacing: 2.5, color: 'rgba(255,255,255,0.72)', textAlign: 'center', textTransform: 'uppercase', lineHeight: 20 },

  // Actions
  actions:      { gap: 14, paddingHorizontal: 22 },
  btnLight:     { height: 58, borderRadius: 16, backgroundColor: '#f3f1ea', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 18 },
  btnLightText: { fontFamily: 'Oswald_600SemiBold', fontSize: 17, letterSpacing: 2, color: '#1a1916' },
  btnGold:      { height: 58, borderRadius: 16, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  btnGoldText:  { fontFamily: 'Oswald_600SemiBold', fontSize: 17, letterSpacing: 2, color: '#2e2206' },
  signin:       { textAlign: 'center', marginTop: 6, fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  signinGold:   { color: GOLD, fontFamily: 'Oswald_600SemiBold' },

  // Modal
  modalOverlay:    { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet:      { backgroundColor: '#0d1117', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 28, borderTopWidth: 2, borderTopColor: GOLD, gap: 14 },
  modalClose:      { position: 'absolute', top: 16, right: 20, padding: 8 },
  modalCloseText:  { color: '#666', fontSize: 18 },
  modalTitle:      { fontFamily: 'Oswald_700Bold', fontSize: 22, color: '#fff', letterSpacing: 2, marginBottom: 8, marginTop: 8 },
  errorBanner:     { backgroundColor: 'rgba(224,82,82,0.15)', borderRadius: 8, padding: 10 },
  errorText:       { color: '#e05252', fontSize: 13 },
  infoBanner:      { backgroundColor: 'rgba(76,175,125,0.15)', borderRadius: 8, padding: 10 },
  infoText:        { color: '#4caf7d', fontSize: 13 },
  input:           { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#1e2530', borderRadius: 10, padding: 14, color: '#fff', fontSize: 15, fontFamily: 'Oswald_400Regular' },
});
