import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants';

export default function TopBar({ title, onBack, right }) {
  return (
    <View style={s.bar}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={s.back}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={s.title} numberOfLines={1}>{title}</Text>
      {right || <View style={s.rightPlaceholder} />}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
    flexShrink: 0,
  },
  back: { padding: 12, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontFamily: 'Oswald_400Regular', fontSize: 22, color: C.accent },
  title: { fontFamily: 'Oswald_700Bold', fontSize: 16, fontWeight: undefined, color: C.text, letterSpacing: 0.8, flex: 1 },
  rightPlaceholder: { width: 0 },
});
