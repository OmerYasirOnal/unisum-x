import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { colors, radius, shadow } from '@/lib/theme';
import { Button } from '@/components/ui';
import { SearchablePicker } from '@/components/SearchablePicker';
import { universities, cities, countries, departments } from '@/lib/signupData';

function friendlyError(msg?: string): string {
  const m = (msg || '').toLowerCase();
  if (m.includes('error_email_exists') || m.includes('already') || m.includes('exist') || m.includes('kayıt'))
    return 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.';
  if (m.includes('error_invalid_email') || m.includes('email')) return 'Geçerli bir e-posta adresi girin.';
  if (m.includes('password') || m.includes('şifre')) return 'Şifre en az 6 karakter olmalı.';
  if (m.includes('http') || m.includes('failed') || m.includes('network')) return 'Bağlantı hatası. İnternetini kontrol et.';
  return 'Kayıt başarısız. Lütfen bilgileri kontrol edip tekrar deneyin.';
}

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('Türkiye');
  const [city, setCity] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  function validate(): string | null {
    if (!email.trim()) return 'E-posta gerekli.';
    if (!emailValid) return 'Geçerli bir e-posta adresi girin.';
    if (!password) return 'Şifre gerekli.';
    if (password.length < 6) return 'Şifre en az 6 karakter olmalı.';
    if (!country) return 'Lütfen ülke seçin.';
    if (!city) return 'Lütfen şehir seçin.';
    if (!university) return 'Lütfen üniversite seçin.';
    if (!department) return 'Lütfen bölüm seçin.';
    return null;
  }

  async function submit() {
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      await api.signup(email.trim(), password, university, department, city, country);
      setSuccess(true);
    } catch (e: any) {
      setError(friendlyError(e?.message));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (k: string) => [styles.input, focus === k && { borderColor: colors.brand, borderWidth: 2 }];

  if (success) {
    return (
      <View style={styles.successWrap}>
        <View style={styles.logo}><Text style={{ fontSize: 40 }}>✉️</Text></View>
        <Text style={styles.successTitle}>Hesabın oluşturuldu!</Text>
        <Text style={styles.successBody}>
          Sana bir doğrulama e-postası gönderdik. Lütfen gelen kutundaki bağlantıya tıklayıp hesabını doğrula,
          ardından giriş yap.
        </Text>
        <Button title="Giriş ekranına dön" onPress={() => router.replace('/login')} style={{ marginTop: 8 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}><Text style={{ fontSize: 40 }}>🎓</Text></View>
        <Text style={styles.wordmark}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Üniversiteni seç, GPA'ni her cihazda takip et</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="E-posta" placeholderTextColor={colors.textSec} value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" autoComplete="email"
            onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} style={inputStyle('email')} />
          <TextInput
            placeholder="Şifre (en az 6 karakter)" placeholderTextColor={colors.textSec} value={password} onChangeText={setPassword}
            secureTextEntry onFocus={() => setFocus('pw')} onBlur={() => setFocus(null)} style={inputStyle('pw')} />

          <SearchablePicker icon="🌍" placeholder="Ülke" value={country} options={countries} onChange={setCountry} />
          <SearchablePicker icon="📍" placeholder="Şehir" value={city} options={cities} onChange={setCity} />
          <SearchablePicker icon="🏛️" placeholder="Üniversite" value={university} options={universities} onChange={setUniversity} />
          <SearchablePicker icon="📚" placeholder="Bölüm" value={department} options={departments} onChange={setDepartment} />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Kayıt Ol" onPress={submit} loading={loading} style={{ marginTop: 4 }} />
        </View>

        <Pressable onPress={() => router.replace('/login')} style={styles.linkRow}>
          <Text style={styles.linkMuted}>Zaten hesabın var mı? </Text>
          <Text style={styles.link}>Giriş yap</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12, maxWidth: 480, width: '100%', alignSelf: 'center' },
  logo: { width: 84, height: 84, borderRadius: 22, backgroundColor: colors.brand, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', ...shadow },
  wordmark: { fontSize: 30, fontWeight: '900', color: colors.brand, textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 15, color: colors.textSec, textAlign: 'center', marginBottom: 12 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.hairline, ...shadow },
  input: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.card },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  linkMuted: { color: colors.textSec, fontSize: 14 },
  link: { color: colors.brand, fontSize: 14, fontWeight: '700' },

  successWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12, maxWidth: 480, width: '100%', alignSelf: 'center' },
  successTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 8 },
  successBody: { fontSize: 15, color: colors.textSec, textAlign: 'center', lineHeight: 22 },
});
