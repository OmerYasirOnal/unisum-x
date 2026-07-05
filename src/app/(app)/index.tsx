import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api, Term, classLevelLabel } from '@/lib/api';
import { colors, radius, gpaColor } from '@/lib/theme';
import { Card, GPACircle, Empty } from '@/components/ui';

const ORDER = ['pre', '1', '2', '3', '4'];

export default function Terms() {
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setErr(null); setTerms(await api.terms()); }
    catch (e: any) { setErr(e?.message || 'Yüklenemedi'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const cumCredits = terms.reduce((s, t) => s + (t.totalCredits || 0), 0);
  const cumGPA = cumCredits ? terms.reduce((s, t) => s + (t.gpa || 0) * (t.totalCredits || 0), 0) / cumCredits : 0;

  const grouped = ORDER.map((lvl) => ({ lvl, items: terms.filter((t) => t.class_level === lvl).sort((a, b) => a.term_number - b.term_number) })).filter((g) => g.items.length);

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.brand} size="large" /></View>;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand} />}>
      <Card style={styles.hero}>
        <GPACircle value={cumGPA} size={96} />
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={styles.heroLabel}>Genel Ortalama (CGPA)</Text>
          <View style={styles.statRow}><Text style={styles.statK}>Toplam Kredi</Text><Text style={styles.statV}>{cumCredits.toFixed(1)}</Text></View>
          <View style={styles.statRow}><Text style={styles.statK}>Dönem</Text><Text style={styles.statV}>{terms.length}</Text></View>
        </View>
      </Card>

      {err ? <Text style={styles.err}>{err}</Text> : null}

      {!terms.length && !err ? (
        <Empty icon="📚" title="Dönem yok" sub="UniSum uygulamasında dönem ekle, burada senkron görünsün." />
      ) : (
        grouped.map((g) => (
          <View key={g.lvl} style={{ gap: 8 }}>
            <Text style={styles.section}>🎓  {classLevelLabel(g.lvl).toUpperCase()}</Text>
            {g.items.map((t) => {
              const c = gpaColor(t.gpa || 0);
              return (
                <Pressable key={t.id} onPress={() => router.push(`/term/${t.id}`)}>
                  <Card style={styles.termRow}>
                    <View style={[styles.termIcon, { backgroundColor: colors.brandTint }]}><Text style={{ fontSize: 20 }}>🗓️</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.termTitle}>Dönem {t.term_number}</Text>
                      <Text style={styles.termSub}>{classLevelLabel(t.class_level)} · {(t.totalCredits || 0).toFixed(0)} kredi</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: c }}>{(t.gpa || 0).toFixed(2)}</Text>
                      <Text style={styles.termSub}>GPA</Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: 16, gap: 14, maxWidth: 620, width: '100%', alignSelf: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 18 },
  heroLabel: { color: colors.textSec, fontWeight: '600' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statK: { color: colors.textSec }, statV: { fontWeight: '800', color: colors.text },
  section: { color: colors.textSec, fontWeight: '800', fontSize: 12, letterSpacing: 0.5, marginTop: 6 },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  termIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  termTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  termSub: { color: colors.textSec, fontSize: 13 },
  err: { color: colors.danger, textAlign: 'center' },
});
