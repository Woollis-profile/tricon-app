import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants';

export default function FridayPickerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const onSelect = (type) => navigation.navigate('Workout', { type });

  return (
    <ScrollView style={s.scroll} contentContainerStyle={[s.content, { paddingTop: insets.top + 16 }]}>
      <Text style={s.hint}>Choose your session for today</Text>

      {/* AMRAP card */}
      <TouchableOpacity onPress={() => onSelect('amrap')} activeOpacity={0.85}>
        <LinearGradient colors={[C.purple + '18', C.purple + '06']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.card, { borderColor: C.purple + '50' }]}>
          <View style={s.cardTop}>
            <View>
              <Text style={[s.cardSub, { color: C.purple }]}>TREVOR'S INSTINCT</Text>
              <Text style={s.cardTitle}>KB BENCHMARK</Text>
              <Text style={s.cardMeta}>AMRAP · 30 minutes · 1 kettlebell</Text>
            </View>
            <View style={s.cardRight}>
              <Text style={[s.cardNum, { color: C.purple }]}>30</Text>
              <Text style={s.cardNumLabel}>MINUTES</Text>
            </View>
          </View>
          <View style={s.bullets}>
            {['· 10× KB Swings', '· 5× Shoulder Press L + 5× R', '· 5× Squat R + 5× L', '· ½ max Push-Ups'].map((b, i) => (
              <Text key={i} style={s.bullet}>{b}</Text>
            ))}
          </View>
          <View style={[s.selectBtn, { backgroundColor: C.purple }]}>
            <Text style={[s.selectBtnText, { color: '#fff' }]}>SELECT →</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Flow card */}
      <TouchableOpacity onPress={() => onSelect('circuit')} activeOpacity={0.85}>
        <LinearGradient colors={[C.green + '18', C.green + '06']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.card, { borderColor: C.green + '50' }]}>
          <View style={s.cardTop}>
            <View>
              <Text style={[s.cardSub, { color: C.green }]}>TREVOR'S INSTINCT</Text>
              <Text style={s.cardTitle}>KETTLEBELL FLOW</Text>
              <Text style={s.cardMeta}>3 Rounds For Time · 1 kettlebell</Text>
            </View>
            <View style={s.cardRight}>
              <Text style={[s.cardNum, { color: C.green }]}>3</Text>
              <Text style={s.cardNumLabel}>ROUNDS</Text>
            </View>
          </View>
          <View style={s.bullets}>
            {['· 10× Helicopters CCW + CW', '· 10× Halos CCW + CW', '· 10× Pullovers'].map((b, i) => (
              <Text key={i} style={s.bullet}>{b}</Text>
            ))}
          </View>
          <View style={[s.selectBtn, { backgroundColor: C.green }]}>
            <Text style={[s.selectBtnText, { color: '#0a0c0f' }]}>SELECT →</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { padding: 14, gap: 12 },
  hint: { fontSize: 11, color: C.muted, marginBottom: 4 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardSub: { fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 5 },
  cardTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: C.text, lineHeight: 20 },
  cardMeta: { fontSize: 11, color: C.muted, marginTop: 5 },
  cardRight: { alignItems: 'flex-end' },
  cardNum: { fontFamily: 'Oswald_700Bold', fontSize: 20, lineHeight: 20 },
  cardNumLabel: { fontSize: 9, color: C.muted, letterSpacing: 1 },
  bullets: { marginBottom: 12 },
  bullet: { fontSize: 11, color: C.sub, lineHeight: 21 },
  selectBtn: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  selectBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 13, letterSpacing: 1 },
});
