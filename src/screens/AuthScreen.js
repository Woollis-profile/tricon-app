import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, ImageBackground,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { G, Rect } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const GOLD  = '#c8a96e';
const CREAM = '#f5f0e8';
const DARK  = '#1b1a18';
const BADGE = 280;

export default function AuthScreen() {
  const [modal,      setModal]      = useState(null); // null | 'signup' | 'login'
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [info,       setInfo]       = useState(null);
  const [restoreMsg, setRestoreMsg] = useState(false);

  const openModal = (mode) => {
    setEmail(''); setPassword('');
    setError(null); setInfo(null);
    setModal(mode);
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }
    setError(null); setInfo(null);
    setLoading(true);
    try {
      if (modal === 'login') {
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
      style={s.bg}
      resizeMode="cover"
      imageStyle={{ transform: [{ scale: 0.85 }] }}
    >
      <View style={s.overlay} />

      {/* ── Badge + tagline ─────────────────────────────────────────── */}
      <View style={s.center}>
        <View style={s.badge}>
          {/* Barbell triangle mark */}
          <Svg
            viewBox="0 0 440 440"
            width={120}
            height={120}
            style={{ marginTop: 20 }}
          >
            <G transform="translate(220 220) scale(1.2) translate(-220 -220)">
              <G transform="translate(220 305) rotate(0)" fill={DARK}>
                <Rect x="-147.224" y="-3.5" width="294.448" height="7" rx="3.5"/>
                <Rect x="77"      y="-9"  width="5"   height="18" rx="2"/>
                <Rect x="88"      y="-27" width="9.5" height="54" rx="3"/>
                <Rect x="101"     y="-22" width="9"   height="44" rx="3"/>
                <Rect x="114"     y="-17" width="8.5" height="34" rx="2.5"/>
                <Rect x="-82"     y="-9"  width="5"   height="18" rx="2"/>
                <Rect x="-97.5"   y="-27" width="9.5" height="54" rx="3"/>
                <Rect x="-110"    y="-22" width="9"   height="44" rx="3"/>
                <Rect x="-122.5"  y="-17" width="8.5" height="34" rx="2.5"/>
              </G>
              <G transform="translate(146.388 177.5) rotate(-60)" fill={DARK}>
                <Rect x="-147.224" y="-3.5" width="294.448" height="7" rx="3.5"/>
                <Rect x="77"      y="-9"  width="5"   height="18" rx="2"/>
                <Rect x="88"      y="-27" width="9.5" height="54" rx="3"/>
                <Rect x="101"     y="-22" width="9"   height="44" rx="3"/>
                <Rect x="114"     y="-17" width="8.5" height="34" rx="2.5"/>
                <Rect x="-82"     y="-9"  width="5"   height="18" rx="2"/>
                <Rect x="-97.5"   y="-27" width="9.5" height="54" rx="3"/>
                <Rect x="-110"    y="-22" width="9"   height="44" rx="3"/>
                <Rect x="-122.5"  y="-17" width="8.5" height="34" rx="2.5"/>
              </G>
              <G transform="translate(293.612 177.5) rotate(60)" fill={DARK}>
                <Rect x="-147.224" y="-3.5" width="294.448" height="7" rx="3.5"/>
                <Rect x="77"      y="-9"  width="5"   height="18" rx="2"/>
                <Rect x="88"      y="-27" width="9.5" height="54" rx="3"/>
                <Rect x="101"     y="-22" width="9"   height="44" rx="3"/>
                <Rect x="114"     y="-17" width="8.5" height="34" rx="2.5"/>
                <Rect x="-82"     y="-9"  width="5"   height="18" rx="2"/>
                <Rect x="-97.5"   y="-27" width="9.5" height="54" rx="3"/>
                <Rect x="-110"    y="-22" width="9"   height="44" rx="3"/>
                <Rect x="-122.5"  y="-17" width="8.5" height="34" rx="2.5"/>
              </G>
            </G>
          </Svg>

          <Text style={s.tricon}>TRICON</Text>
          <Text style={s.training}>TRAINING</Text>
        </View>

        <Text style={s.tagline}>TRAINING METHOD FOR THE OLDER AND WISER ATHLETE</Text>
      </View>

      {/* ── Buttons ─────────────────────────────────────────────────── */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.btnCream}
          onPress={() => openModal('signup')}
          activeOpacity={0.85}
        >
          <Text style={s.btnCreamText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnGold}
          onPress={() => openModal('login')}
          activeOpacity={0.85}
        >
          <Text style={s.btnGoldText}>LOG IN</Text>
        </TouchableOpacity>

        {restoreMsg ? (
          <Text style={s.restoreInfo}>
            Restore purchase will be available when the app launches on the App Store
          </Text>
        ) : (
          <TouchableOpacity onPress={() => setRestoreMsg(true)} activeOpacity={0.7}>
            <Text style={s.restoreLink}>
              {'MEMBER ALREADY?  '}
              <Text style={s.restoreLinkGold}>RESTORE PURCHASE</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Auth modal (slides up from bottom) ──────────────────────── */}
      <Modal
        visible={modal !== null}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={s.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={s.modalBackdrop} onPress={closeModal} activeOpacity={1} />

          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>
                {modal === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

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
              placeholderTextColor="rgba(255,255,255,0.3)"
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
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={modal === 'login' ? 'password' : 'new-password'}
            />

            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={DARK} />
              ) : (
                <Text style={s.submitBtnText}>
                  {modal === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg:      { flex: 1, backgroundColor: '#0a0a0b' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },

  // ── Badge area ────────────────────────────────────────────────────
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width:           BADGE,
    height:          BADGE,
    borderRadius:    BADGE / 2,
    backgroundColor: CREAM,
    borderWidth:     3,
    borderColor:     GOLD,
    overflow:        'hidden',
    alignItems:      'center',
    justifyContent:  'center',
  },
  tricon: {
    fontFamily:    'Oswald_700Bold',
    fontSize:      42,
    color:         GOLD,
    letterSpacing: 0.5,
    marginTop:     -8,
  },
  training: {
    fontFamily:    'Oswald_600SemiBold',
    fontSize:      13,
    letterSpacing: 6,
    color:         DARK,
    marginTop:     2,
  },
  tagline: {
    marginTop:     24,
    fontSize:      10,
    color:         'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textAlign:     'center',
    paddingHorizontal: 40,
    lineHeight:    16,
  },

  // ── Buttons ───────────────────────────────────────────────────────
  actions: {
    paddingHorizontal: 32,
    paddingBottom:     48,
  },
  btnCream: {
    backgroundColor: CREAM,
    borderRadius:    4,
    paddingVertical: 16,
    alignItems:      'center',
  },
  btnCreamText: {
    fontFamily:    'Oswald_700Bold',
    fontSize:      14,
    letterSpacing: 2,
    color:         DARK,
  },
  btnGold: {
    backgroundColor: GOLD,
    borderRadius:    4,
    paddingVertical: 16,
    alignItems:      'center',
    marginTop:       12,
  },
  btnGoldText: {
    fontFamily:    'Oswald_700Bold',
    fontSize:      14,
    letterSpacing: 2,
    color:         DARK,
  },
  restoreLink: {
    marginTop:     16,
    fontSize:      11,
    color:         'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    textAlign:     'center',
  },
  restoreLinkGold: { color: GOLD },
  restoreInfo: {
    marginTop:     16,
    fontSize:      11,
    color:         'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    textAlign:     'center',
    lineHeight:    16,
  },

  // ── Modal sheet ───────────────────────────────────────────────────
  modalWrap: {
    flex:           1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: { flex: 1 },
  sheet: {
    backgroundColor:     '#0d1117',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    padding:              28,
    paddingBottom:        48,
    borderTopWidth:       1,
    borderTopColor:       'rgba(200,169,110,0.2)',
  },
  sheetHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   24,
  },
  sheetTitle: {
    fontFamily:    'Oswald_700Bold',
    fontSize:      20,
    color:         '#fff',
    letterSpacing: 1,
  },
  closeBtn: {
    fontSize: 18,
    color:    'rgba(255,255,255,0.5)',
  },
  errorBox: {
    backgroundColor: 'rgba(224,82,82,0.1)',
    borderWidth:     1,
    borderColor:     'rgba(224,82,82,0.3)',
    borderRadius:    8,
    padding:         12,
    marginBottom:    16,
  },
  errorText: { fontSize: 13, color: '#e05252', lineHeight: 18 },
  infoBox: {
    backgroundColor: 'rgba(76,175,125,0.1)',
    borderWidth:     1,
    borderColor:     'rgba(76,175,125,0.3)',
    borderRadius:    8,
    padding:         12,
    marginBottom:    16,
  },
  infoText: { fontSize: 13, color: '#4caf7d', lineHeight: 18 },
  label: {
    fontSize:      10,
    color:         'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    fontFamily:    'Oswald_400Regular',
    marginBottom:  6,
  },
  input: {
    backgroundColor: '#161b22',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.1)',
    borderRadius:    8,
    color:           '#fff',
    paddingVertical:   13,
    paddingHorizontal: 14,
    fontSize:        15,
    marginBottom:    16,
  },
  submitBtn: {
    backgroundColor: GOLD,
    borderRadius:    8,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:       4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontFamily:    'Oswald_700Bold',
    fontSize:      15,
    color:         DARK,
    letterSpacing: 1,
  },
});
