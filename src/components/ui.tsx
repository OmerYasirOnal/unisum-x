import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, shadow } from '@/lib/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ title, onPress, loading, disabled, variant = 'primary', style }:
  { title: string; onPress?: () => void; loading?: boolean; disabled?: boolean; variant?: 'primary' | 'secondary'; style?: ViewStyle }) {
  const sec = variant === 'secondary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        sec ? styles.btnSec : styles.btnPrimary,
        (disabled || loading) && { opacity: 0.55 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        style,
      ]}>
      {loading ? <ActivityIndicator color={sec ? colors.brand : '#fff'} /> :
        <Text style={[styles.btnText, { color: sec ? colors.brand : '#fff' }]}>{title}</Text>}
    </Pressable>
  );
}

export function GPACircle({ value, max = 4, size = 92, label }: { value: number; max?: number; size?: number; label?: string }) {
  const c = require('@/lib/theme').gpaColor(value) as string;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 7, borderColor: c,
      alignItems: 'center', justifyContent: 'center', backgroundColor: c + '14' }}>
      {label ? <Text style={{ fontSize: size * 0.3, fontWeight: '800', color: c }}>{label}</Text> : null}
      <Text style={{ fontSize: label ? size * 0.13 : size * 0.26, fontWeight: '800', color: label ? colors.textSec : c }}>
        {value.toFixed(2)}
      </Text>
      {!label && <Text style={{ fontSize: size * 0.11, color: colors.textSec, fontWeight: '600' }}>/ {max.toFixed(1)}</Text>}
    </View>
  );
}

export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={{ backgroundColor: color + '22', paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill }}>
      <Text style={{ color, fontWeight: '800', fontSize: 13 }}>{text}</Text>
    </View>
  );
}

export function Bar({ fraction, color = colors.brand }: { fraction: number; color?: string }) {
  return (
    <View style={{ height: 7, backgroundColor: colors.hairline, borderRadius: 4, overflow: 'hidden', flex: 1 }}>
      <View style={{ height: 7, width: `${Math.min(Math.max(fraction, 0), 1) * 100}%`, backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

export function Empty({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 32, gap: 10 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 36 }}>{icon}</Text>
      </View>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>{title}</Text>
      {sub ? <Text style={{ color: colors.textSec, textAlign: 'center' }}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.hairline, ...shadow } as ViewStyle,
  btn: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.brand },
  btnSec: { backgroundColor: colors.brandTint },
  btnText: { fontWeight: '700', fontSize: 16 } as TextStyle,
});
