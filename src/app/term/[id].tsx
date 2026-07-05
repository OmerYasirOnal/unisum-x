import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { api, Course } from '@/lib/api';
import { colors, radius, scoreColor, gpaColor } from '@/lib/theme';
import { Card, GPACircle, Badge, Empty } from '@/components/ui';
import { termGPA, totalCredits } from '@/lib/gpa';

export default function TermCourses() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const termId = Number(id);
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setCourses(await api.courses(termId)); } finally { setLoading(false); }
  }, [termId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const gpa = termGPA(courses);
  const credits = totalCredits(courses);

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.brand} size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Stack.Screen options={{ title: 'Dersler' }} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <GPACircle value={gpa} size={80} />
        <View style={{ flex: 1 }}>
          <Text style={styles.k}>Dönem Ortalaması</Text>
          <View style={styles.row}><Text style={{ color: colors.textSec }}>Kredi</Text><Text style={styles.v}>{credits.toFixed(1)}</Text></View>
          <View style={styles.row}><Text style={{ color: colors.textSec }}>Ders</Text><Text style={styles.v}>{courses.length}</Text></View>
        </View>
      </Card>

      {!courses.length ? <Empty icon="📖" title="Ders yok" /> :
        courses.map((c) => (
          <Pressable key={c.id} onPress={() => router.push({ pathname: '/course/[id]', params: { id: c.id, name: c.name, credits: c.credits, average: c.average, letter: c.letterGrade || '' } })}>
            <Card style={styles.courseRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{c.name}</Text>
                <Text style={styles.sub}>💳 {c.credits.toFixed(1)} kredi</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={{ fontSize: 19, fontWeight: '800', color: scoreColor(c.average) }}>{c.average.toFixed(1)}</Text>
                {c.letterGrade ? <Badge text={c.letterGrade} color={gpaColor(c.gpa || 0)} /> : null}
              </View>
            </Card>
          </Pressable>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: 16, gap: 12, maxWidth: 620, width: '100%', alignSelf: 'center' },
  k: { color: colors.textSec, fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  v: { fontWeight: '800', color: colors.text },
  courseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseName: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { color: colors.textSec, fontSize: 13, marginTop: 3 },
});
