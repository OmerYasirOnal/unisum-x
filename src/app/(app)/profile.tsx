import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Card, Button } from '@/components/ui';
import { colors, radius } from '@/lib/theme';

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <Text style={{ color: colors.textSec }}>{k}</Text>
      <Text style={{ color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{v}</Text>
    </View>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 24 }}>
        <View style={styles.avatar}><Text style={{ fontSize: 32, color: '#fff', fontWeight: '800' }}>{(user?.email || '?')[0].toUpperCase()}</Text></View>
        <Text style={styles.email}>{user?.email}</Text>
        {!!user?.department && <View style={styles.chip}><Text style={{ color: colors.brand, fontWeight: '700' }}>{user.department}</Text></View>}
      </Card>
      <Card style={{ padding: 0 }}>
        <Row k="Üniversite" v={user?.university || '-'} />
        <Row k="Bölüm" v={user?.department || '-'} />
        <Row k="E-posta" v={user?.email || '-'} last />
      </Card>
      <Button title="Çıkış Yap" variant="secondary" onPress={async () => { await logout(); router.replace('/login'); }} />
      <Text style={styles.footer}>UniSum · her cihazda senkron</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 14, maxWidth: 620, width: '100%', alignSelf: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  email: { fontSize: 17, fontWeight: '700', color: colors.text },
  chip: { backgroundColor: colors.brandTint, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, gap: 12 },
  footer: { color: colors.textSec, fontSize: 12, textAlign: 'center', marginTop: 4 },
});
