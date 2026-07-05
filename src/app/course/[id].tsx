import { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { api, Grade, gradeTypeLabel } from '@/lib/api';
import { colors, radius, scoreColor, gpaColor } from '@/lib/theme';
import { Card, Bar, Badge, Empty } from '@/components/ui';
import { currentAverage, usedWeight, whatIf, requiredScore, letterFor } from '@/lib/gpa';

export default function CourseDetail() {
  const p = useLocalSearchParams<{ id: string; name?: string; credits?: string; average?: string; letter?: string }>();
  const courseId = Number(p.id);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatIfScore, setWhatIfScore] = useState('70');
  const [target, setTarget] = useState('60');

  const load = useCallback(async () => {
    try { setGrades(await api.grades(courseId)); } finally { setLoading(false); }
  }, [courseId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const avg = useMemo(() => (grades.length ? currentAverage(grades) : Number(p.average) || 0), [grades, p.average]);
  const used = usedWeight(grades);
  const remaining = 100 - used;
  const { letter, gpa } = letterFor(avg);

  const wiScore = parseFloat(whatIfScore) || 0;
  const projected = whatIf(grades, wiScore);
  const req = requiredScore(grades, parseFloat(target) || 0);

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.brand} size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Stack.Screen options={{ title: p.name || 'Ders' }} />

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={[styles.circle, { borderColor: gpaColor(gpa), backgroundColor: gpaColor(gpa) + '14' }]}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: gpaColor(gpa) }}>{letter}</Text>
          <Text style={{ fontSize: 12, color: colors.textSec, fontWeight: '700' }}>{gpa.toFixed(2)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{p.name}</Text>
          <View style={styles.row}><Text style={{ color: colors.textSec }}>Ortalama</Text><Text style={{ color: scoreColor(avg), fontWeight: '800' }}>{avg.toFixed(1)}</Text></View>
          <View style={styles.row}><Text style={{ color: colors.textSec }}>İşlenen ağırlık</Text><Text style={styles.v}>%{used.toFixed(0)}</Text></View>
        </View>
      </Card>

      {/* Grades */}
      <Text style={styles.section}>NOTLAR</Text>
      {!grades.length ? <Empty icon="📝" title="Not yok" /> :
        grades.map((g) => (
          <Card key={g.id} style={{ gap: 8 }}>
            <View style={styles.row}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{gradeTypeLabel(g.grade_type)}</Text>
              <Text style={{ fontWeight: '800', color: scoreColor(g.score) }}>{g.score.toFixed(0)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Bar fraction={g.weight / 100} />
              <Text style={{ color: colors.textSec, fontWeight: '700', fontSize: 12 }}>%{g.weight.toFixed(0)}</Text>
            </View>
          </Card>
        ))}

      {/* What-if calculator */}
      {remaining > 0 && (
        <Card style={{ gap: 12, borderColor: colors.brand + '55' }}>
          <Text style={styles.title}>🔮  “Ne Gerekir?” Hesaplayıcı</Text>
          <Text style={{ color: colors.textSec }}>Kalan %{remaining.toFixed(0)} ağırlık üzerinden.</Text>

          <View>
            <Text style={styles.k}>Kalanlarda alırsam:</Text>
            <View style={styles.inline}>
              <TextInput value={whatIfScore} onChangeText={setWhatIfScore} keyboardType="number-pad" style={[styles.input, { width: 90 }]} />
              <View style={[styles.badge, { backgroundColor: scoreColor(projected) + '18' }]}>
                <Text style={{ color: colors.textSec, fontSize: 12 }}>Ortalaman</Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: scoreColor(projected) }}>{projected.toFixed(1)}</Text>
                <Text style={{ fontSize: 12, color: colors.textSec }}>{letterFor(projected).letter} · {letterFor(projected).gpa.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: colors.hairline }} />

          <View>
            <Text style={styles.k}>Hedef ortalama için gereken puan:</Text>
            <View style={styles.inline}>
              <TextInput value={target} onChangeText={setTarget} keyboardType="number-pad" style={[styles.input, { width: 90 }]} />
              <View style={[styles.badge, { backgroundColor: (req.needed != null && req.feasible ? colors.success : colors.danger) + '18' }]}>
                {req.alreadyMet ? (
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.success }}>Hedefi zaten tuttun 🎉</Text>
                ) : req.needed == null ? (
                  <Text style={{ color: colors.textSec }}>Tüm ağırlık işlendi.</Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 12, color: colors.textSec }}>Kalanlarda en az</Text>
                    <Text style={{ fontSize: 22, fontWeight: '900', color: req.feasible ? colors.success : colors.danger }}>{req.needed.toFixed(1)}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSec }}>{req.feasible ? 'almalısın' : 'gerekiyor (imkânsız)'}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </Card>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: 16, gap: 12, maxWidth: 620, width: '100%', alignSelf: 'center' },
  circle: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  v: { fontWeight: '700', color: colors.text },
  section: { color: colors.textSec, fontWeight: '800', fontSize: 12, letterSpacing: 0.5, marginTop: 6, marginLeft: 4 },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  k: { color: colors.textSec, fontWeight: '600', marginBottom: 6 },
  inline: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, color: colors.text, textAlign: 'center', backgroundColor: colors.card },
  badge: { flex: 1, borderRadius: radius.md, padding: 12, alignItems: 'center' },
});
