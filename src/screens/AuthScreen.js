import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ImageBackground, StyleSheet,
  Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Polygon, G, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// ── Design tokens (exact from web/index.html :root) ──────────────────────────
const GOLD      = '#e3b23f';
const GOLD_DEEP = '#cf9a2b';
const BADGE     = 240; // web .logo { width: 240px; height: 240px }

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [modalMode, setModalMode] = useState(null); // null | 'login' | 'signup'
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [info,      setInfo]      = useState('');

  // ── Supabase auth logic (preserved exactly) ───────────────────────────────
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
      {/* .scrim-dim — flat black at opacity 0.28 */}
      <View style={s.scrimDim} />

      {/* .scrim — gradient: dark top → clear → dark bottom
          web: linear-gradient(to bottom,
            rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 22%,
            rgba(0,0,0,0.00) 42%, rgba(0,0,0,0.45) 70%,
            rgba(0,0,0,0.92) 100%) */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.55)',
          'rgba(0,0,0,0.10)',
          'rgba(0,0,0,0.00)',
          'rgba(0,0,0,0.45)',
          'rgba(0,0,0,0.92)',
        ]}
        locations={[0, 0.22, 0.42, 0.70, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      {/* .content — flex column filling screen */}
      <View style={s.content}>

        {/* .topmark — gap:11 padding:60px 30px 0 (uses insets for safe area) */}
        <View style={[s.topmark, { paddingTop: Math.max(insets.top + 8, 36) }]}>
          {/* .topglyph — 26×26 white-stroke triangle SVG */}
          <Svg width={26} height={26} viewBox="0 0 300 300">
            <Polygon
              points="150,52 248,222 52,222"
              stroke="#ffffff"
              strokeWidth={22}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          {/* .tt — 16px weight-600 letter-spacing:0.42em (#e3b23f) */}
          <Text style={s.tt}>TRICON</Text>
        </View>

        {/* .hero — flex:1 centre column gap:30 */}
        <View style={s.hero}>

          {/* .logo — 340px circle, gold border 4px, translateY(-38px) */}
          <View style={s.logo}>

            {/* barbell SVG mark — absoluteFill viewBox 0 0 440 440 */}
            <Svg style={StyleSheet.absoluteFill} viewBox="0 0 440 440">
              <G transform="translate(220 220) scale(1.2) translate(-220 -220)">
                <G transform="translate(220 305) rotate(0)" fill="#1b1a18">
                  <Rect x={-147.224} y={-3.5} width={294.448} height={7}  rx={3.5}/>
                  <Rect x={77}       y={-9}   width={5}       height={18} rx={2}/>
                  <Rect x={88}       y={-27}  width={9.5}     height={54} rx={3}/>
                  <Rect x={101}      y={-22}  width={9}       height={44} rx={3}/>
                  <Rect x={114}      y={-17}  width={8.5}     height={34} rx={2.5}/>
                  <Rect x={-82}      y={-9}   width={5}       height={18} rx={2}/>
                  <Rect x={-97.5}    y={-27}  width={9.5}     height={54} rx={3}/>
                  <Rect x={-110}     y={-22}  width={9}       height={44} rx={3}/>
                  <Rect x={-122.5}   y={-17}  width={8.5}     height={34} rx={2.5}/>
                </G>
                <G transform="translate(146.388 177.5) rotate(-60)" fill="#1b1a18">
                  <Rect x={-147.224} y={-3.5} width={294.448} height={7}  rx={3.5}/>
                  <Rect x={77}       y={-9}   width={5}       height={18} rx={2}/>
                  <Rect x={88}       y={-27}  width={9.5}     height={54} rx={3}/>
                  <Rect x={101}      y={-22}  width={9}       height={44} rx={3}/>
                  <Rect x={114}      y={-17}  width={8.5}     height={34} rx={2.5}/>
                  <Rect x={-82}      y={-9}   width={5}       height={18} rx={2}/>
                  <Rect x={-97.5}    y={-27}  width={9.5}     height={54} rx={3}/>
                  <Rect x={-110}     y={-22}  width={9}       height={44} rx={3}/>
                  <Rect x={-122.5}   y={-17}  width={8.5}     height={34} rx={2.5}/>
                </G>
                <G transform="translate(293.612 177.5) rotate(60)" fill="#1b1a18">
                  <Rect x={-147.224} y={-3.5} width={294.448} height={7}  rx={3.5}/>
                  <Rect x={77}       y={-9}   width={5}       height={18} rx={2}/>
                  <Rect x={88}       y={-27}  width={9.5}     height={54} rx={3}/>
                  <Rect x={101}      y={-22}  width={9}       height={44} rx={3}/>
                  <Rect x={114}      y={-17}  width={8.5}     height={34} rx={2.5}/>
                  <Rect x={-82}      y={-9}   width={5}       height={18} rx={2}/>
                  <Rect x={-97.5}    y={-27}  width={9.5}     height={54} rx={3}/>
                  <Rect x={-110}     y={-22}  width={9}       height={44} rx={3}/>
                  <Rect x={-122.5}   y={-17}  width={8.5}     height={34} rx={2.5}/>
                </G>
              </G>
            </Svg>

            {/* .cut — clip-path: inset(31% 5% 49% 5%) over same cream bg */}
            <View style={s.cut} />

            {/* .wordlock — translateY(-19px) */}
            <View style={s.wordlock}>
              {/* .tricon — 66px bold letter-spacing:0.01em */}
              <Text style={s.tricon}>TRICON</Text>
              {/* .workout — 20px weight-500 letter-spacing:0.46em */}
              <Text style={s.training}>TRAINING</Text>
            </View>

          </View>{/* /.logo */}

          {/* .tagline — 16px weight-400 letter-spacing:0.16em line-height:1.55 */}
          <Text style={s.tagline}>TRAINING METHOD FOR THE OLDER AND WISER ATHLETE</Text>

        </View>{/* /.hero */}

        {/* .actions — gap:14 padding:0 22px 30px */}
        <View style={[s.actions, { paddingBottom: Math.max(insets.bottom, 10) + 30 }]}>

          {/* .btn.btn-light — #f3f1ea height:58 borderRadius:16 */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => setModalMode('signup')}
          >
            <View style={s.btnLight}>
              <Text style={s.btnLightText}>CREATE ACCOUNT</Text>
            </View>
          </TouchableOpacity>

          {/* .btn.btn-gold — gradient #e3b23f→#cf9a2b height:58 borderRadius:16 */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => setModalMode('login')}
          >
            <LinearGradient
              colors={[GOLD, GOLD_DEEP]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={s.btnGold}
            >
              <Text style={s.btnGoldText}>LOG IN</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* .signin — 12.5px letter-spacing:0.14em */}
          <Text style={s.signin}>
            MEMBER ALREADY?{'  '}<Text style={s.signinBold}>RESTORE PURCHASE</Text>
          </Text>

        </View>

      </View>{/* /.content */}

      {/* Auth modal — slides up from bottom */}
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

              {error ? (
                <View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View>
              ) : null}
              {info ? (
                <View style={s.infoBanner}><Text style={s.infoText}>{info}</Text></View>
              ) : null}

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
                autoComplete={modalMode === 'login' ? 'password' : 'new-password'}
              />

              <TouchableOpacity
                activeOpacity={0.82}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={[GOLD, GOLD_DEEP]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={s.btnGold}
                >
                  {loading
                    ? <ActivityIndicator color="#2e2206" />
                    : <Text style={s.btnGoldText}>
                        {modalMode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
                      </Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ImageBackground>
  );
}

// ── Styles — CSS values converted to React Native units ──────────────────────
const s = StyleSheet.create({
  // .screen
  screen: { flex: 1 },

  // .scrim-dim
  scrimDim: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', opacity: 0.28 },

  // .content
  content: { flex: 1, flexDirection: 'column' },

  // .topmark — padding: 60px 30px 0 → safe-area-aware paddingTop
  topmark: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             11,
    paddingHorizontal: 30,
  },

  // .tt — 16px weight-600 letter-spacing:0.42em (0.42×16=6.72)
  tt: {
    fontFamily:    'Oswald_600SemiBold',
    fontSize:      16,
    letterSpacing: 6.7,
    lineHeight:    16,
    color:         GOLD,
  },

  // .hero — flex:1, logo positioned via translateY to sit at 2/3 screen
  hero: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            22,
    paddingHorizontal: 24,
    paddingBottom:  0,
  },

  // .logo — 340px circle, 4px gold border, cream bg, translateY(-38px)
  // overflow:'visible' so the circular borderRadius does not clip Oswald glyph tops
  logo: {
    width:           BADGE,
    height:          BADGE,
    borderRadius:    BADGE / 2,
    borderWidth:     4,
    borderColor:     GOLD,
    backgroundColor: '#f2eee3', // mid-stop of web radial-gradient
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'visible',
    transform:       [{ translateY: -80 }],
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 22 },
    shadowOpacity:   0.55,
    shadowRadius:    60,
    elevation:       20,
  },

  // .cut — clip-path: inset(31% 5% 49% 5%) on 240px badge
  cut: {
    position:        'absolute',
    top:             74,
    bottom:          118,
    left:            12,
    right:           12,
    backgroundColor: '#f2eee3',
  },

  // .wordlock — translateY lowered to align TRICON with cut layer
  wordlock: {
    alignItems: 'center',
    overflow:   'visible',
    transform:  [{ translateY: -22 }],
  },

  // .wordlock .tricon — 66px weight-700 letter-spacing:0.01em (0.01×66=0.66)
  // paddingTop:6 + paddingLeft:4 + lineHeight:80 prevent glyph clipping
  tricon: {
    fontFamily:    'Oswald_700Bold',
    fontSize:      46,
    color:         GOLD,
    lineHeight:    50,
    paddingTop:    4,
    paddingLeft:   4,
    letterSpacing: 0.5,
  },

  // .wordlock .workout — 20px weight-500 letter-spacing:0.46em (0.46×20=9.2)
  // Oswald_600SemiBold used as closest to web's weight-500
  training: {
    fontFamily:    'Oswald_600SemiBold',
    fontSize:      14,
    letterSpacing: 9,
    color:         '#1b1a18',
    marginTop:     3,
  },

  // .tagline — 16px weight-400 letter-spacing:0.16em (0.16×16=2.56) line-height:1.55 (24.8)
  tagline: {
    maxWidth:      320,
    fontSize:      16,
    letterSpacing: 2.5,
    lineHeight:    25,
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.72)',
    textAlign:     'center',
  },

  // .actions — gap:14 padding:0 22px (bottom set inline with insets)
  actions: {
    gap:             14,
    paddingHorizontal: 22,
  },

  // .btn.btn-light — #f3f1ea height:58 borderRadius:16
  btnLight: {
    height:         58,
    borderRadius:   16,
    backgroundColor: '#f3f1ea',
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 6 },
    shadowOpacity:  0.3,
    shadowRadius:   18,
    elevation:      6,
  },

  // .btn text — 17px weight-600 letter-spacing:0.12em (0.12×17=2.04) uppercase
  btnLightText: {
    fontFamily:    'Oswald_600SemiBold',
    fontSize:      17,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         '#1a1916',
  },

  // .btn.btn-gold — gradient height:58 borderRadius:16 (LinearGradient wraps this)
  btnGold: {
    height:         58,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    'rgba(227,178,63,1)',
    shadowOffset:   { width: 0, height: 8 },
    shadowOpacity:  0.45,
    shadowRadius:   26,
    elevation:      8,
  },

  btnGoldText: {
    fontFamily:    'Oswald_600SemiBold',
    fontSize:      17,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         '#2e2206',
  },

  // .signin — 12.5px weight-400 letter-spacing:0.14em (0.14×12.5=1.75)
  signin: {
    textAlign:     'center',
    marginTop:     6,
    fontSize:      12.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.5)',
  },
  // .signin b
  signinBold: {
    color:      GOLD,
    fontFamily: 'Oswald_600SemiBold',
  },

  // ── Modal ───────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex:            1,
    justifyContent:  'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor:     '#0d1117',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    padding:              28,
    paddingBottom:        44,
    borderTopWidth:       2,
    borderTopColor:       GOLD,
    gap:                  14,
  },
  modalClose: {
    position: 'absolute',
    top:      16,
    right:    20,
    padding:  8,
  },
  modalCloseText: {
    color:    '#666',
    fontSize: 18,
  },
  modalTitle: {
    fontFamily:    'Oswald_700Bold',
    fontSize:      22,
    color:         '#fff',
    letterSpacing: 2,
    marginBottom:  8,
    marginTop:     8,
  },
  errorBanner: {
    backgroundColor: 'rgba(224,82,82,0.15)',
    borderRadius:    8,
    padding:         10,
  },
  errorText: { color: '#e05252', fontSize: 13 },
  infoBanner: {
    backgroundColor: 'rgba(76,175,125,0.15)',
    borderRadius:    8,
    padding:         10,
  },
  infoText: { color: '#4caf7d', fontSize: 13 },
  input: {
    backgroundColor: '#161b22',
    borderWidth:     1,
    borderColor:     '#1e2530',
    borderRadius:    10,
    padding:         14,
    color:           '#fff',
    fontSize:        15,
    fontFamily:      'Oswald_400Regular',
  },
});
