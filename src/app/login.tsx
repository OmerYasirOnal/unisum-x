import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { colors, radius, shadow } from '@/lib/theme';
import { Button } from '@/components/ui';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!email.trim() || !password) { setError('E-posta ve şifre gerekli.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message === 'error_invalid_credentials' ? 'E-posta veya şifre hatalı.' : (e?.message || 'Giriş başarısız.'));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (k: string) => [styles.input, focus === k && { borderColor: colors.brand, borderWidth: 2 }];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logo}><Text style={{ fontSize: 42 }}>🎓</Text></View>
        <Text style={styles.wordmark}>UniSum</Text>
        <Text style={styles.subtitle}>Akademik başarını her yerde takip et</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="E-posta" placeholderTextColor={colors.textSec} value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" autoComplete="email"
            onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} style={inputStyle('email')} />
          <TextInput
            placeholder="Şifre" placeholderTextColor={colors.textSec} value={password} onChangeText={setPassword}
            secureTextEntry onFocus={() => setFocus('pw')} onBlur={() => setFocus(null)}
            onSubmitEditing={submit} style={inputStyle('pw')} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Giriş Yap" onPress={submit} loading={loading} style={{ marginTop: 4 }} />
        </View>

        <Pressable onPress={() => router.push('/signup')} style={styles.linkRow}>
          <Text style={styles.linkMuted}>Hesabın yok mu? </Text>
          <Text style={styles.link}>Kayıt Ol</Text>
        </Pressable>

        <Text style={styles.hint}>UniSum hesabınla giriş yap — verilerin tüm cihazlarında senkron.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12, maxWidth: 480, width: '100%', alignSelf: 'center' },
  logo: { width: 84, height: 84, borderRadius: 22, backgroundColor: colors.brand, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', ...shadow },
  wordmark: { fontSize: 32, fontWeight: '900', color: colors.brand, textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 15, color: colors.textSec, textAlign: 'center', marginBottom: 12 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.hairline, ...shadow },
  input: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.card },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  linkMuted: { color: colors.textSec, fontSize: 14 },
  link: { color: colors.brand, fontSize: 14, fontWeight: '700' },
  hint: { color: colors.textSec, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
