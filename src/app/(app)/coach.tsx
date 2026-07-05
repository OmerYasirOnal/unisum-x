import { useCallback, useState } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api, classLevelLabel } from '@/lib/api';
import { colors, radius, gpaColor } from '@/lib/theme';
import { Card, Button, GPACircle } from '@/components/ui';
import { Markdown } from '@/components/Markdown';

const SITE = process.env.EXPO_PUBLIC_SITE_URL || '';

export default function Coach() {
  const [summary, setSummary] = useState('');
  const [cgpa, setCgpa] = useState(0);
  const [credits, setCredits] = useState(0);
  const [ready, setReady] = useState(false);

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const [target, setTarget] = useState('3.00');
  const [nextCredits, setNextCredits] = useState('30');

  const build = useCallback(async () => {
    try {
      const terms = await api.terms();
      const cc = terms.reduce((s, t) => s + (t.totalCredits || 0), 0);
      const cg = cc ? terms.reduce((s, t) => s + (t.gpa || 0) * (t.totalCredits || 0), 0) / cc : 0;
      setCgpa(cg); setCredits(cc);
      const lines: string[] = [`Genel Ortalama (CGPA): ${cg.toFixed(2)} / 4.00 · Toplam ${cc.toFixed(0)} kredi · ${terms.length} dönem.`];
      for (const t of terms) {
        lines.push(`\n${classLevelLabel(t.class_level)} - Dönem ${t.term_number}: GPA ${(t.gpa || 0).toFixed(2)}, ${(t.totalCredits || 0).toFixed(0)} kredi`);
        try {
          const courses = await api.courses(t.id);
          for (const c of courses) lines.push(`  • ${c.name}: ort ${c.average.toFixed(0)}, harf ${c.letterGrade || '-'}, GPA ${(c.gpa || 0).toFixed(2)}, ${c.credits} kredi`);
        } catch {}
      }
      setSummary(lines.join('\n'));
    } finally { setReady(true); }
  }, []);

  useFocusEffect(useCallback(() => { setReady(false); build(); }, [build]));

  async function callAI(mode: 'analyze' | 'chat', q?: string) {
    const res = await fetch(`${SITE}/api/coach`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, summary, question: q }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || 'AI hatası');
    return j.answer as string;
  }

  async function analyze() {
    setAnalyzing(true); setAnalysis(null);
    try { setAnalysis(await callAI('analyze')); }
    catch (e: any) { setAnalysis('⚠️ ' + (e?.message || 'AI şu an yanıt veremedi.')); }
    finally { setAnalyzing(false); }
  }
  async function ask() {
    if (!question.trim()) return;
    setAsking(true); setAnswer(null);
    try { setAnswer(await callAI('chat', question.trim())); }
    catch (e: any) { setAnswer('⚠️ ' + (e?.message || 'AI şu an yanıt veremedi.')); }
    finally { setAsking(false); }
  }

  // Goal GPA math
  const tgt = parseFloat(target) || 0;
  const nc = parseFloat(nextCredits) || 0;
  const neededGPA = nc > 0 ? (tgt * (credits + nc) - cgpa * credits) / nc : 0;
  const feasible = neededGPA <= 4.0001 && neededGPA >= 0;

  if (!ready) return <View style={styles.center}><ActivityIndicator color={colors.brand} size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Card style={styles.hero}>
        <Text style={{ fontSize: 34 }}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroT}>AI Akademik Koç</Text>
          <Text style={styles.heroS}>Verine göre kişisel tavsiye, hedef planı ve “ne gerekir” hesapları.</Text>
        </View>
      </Card>

      {/* Overview */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <GPACircle value={cgpa} size={80} />
        <View style={{ flex: 1 }}>
          <Text style={styles.k}>Şu anki CGPA</Text>
          <Text style={{ color: colors.textSec }}>{credits.toFixed(0)} kredi üzerinden</Text>
        </View>
      </Card>

      {/* Goal planner */}
      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>🎯  Hedef GPA Planlayıcı</Text>
        <View style={styles.inline}>
          <View style={{ flex: 1 }}>
            <Text style={styles.k}>Hedef CGPA</Text>
            <TextInput value={target} onChangeText={setTarget} keyboardType="decimal-pad" style={styles.input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.k}>Ek kredi</Text>
            <TextInput value={nextCredits} onChangeText={setNextCredits} keyboardType="number-pad" style={styles.input} />
          </View>
        </View>
        <View style={[styles.result, { backgroundColor: (feasible ? colors.success : colors.danger) + '14' }]}>
          <Text style={{ color: colors.textSec, fontWeight: '600' }}>Gereken dönem ortalaması</Text>
          <Text style={{ fontSize: 26, fontWeight: '900', color: feasible ? colors.success : colors.danger }}>
            {isFinite(neededGPA) ? neededGPA.toFixed(2) : '—'}
          </Text>
          <Text style={{ color: colors.textSec, fontSize: 13 }}>
            {feasible ? `Sonraki ${nc.toFixed(0)} kredide bu GPA ile hedefe ulaşırsın.` : neededGPA > 4 ? 'Bu hedef tek dönemde ulaşılamıyor — daha fazla kredi gerekir.' : 'Hedefi zaten geçtin! 🎉'}
          </Text>
        </View>
      </Card>

      {/* AI analysis */}
      <Card style={{ gap: 10 }}>
        <Text style={styles.title}>✨  Dönem Analizi</Text>
        <Text style={{ color: colors.textSec }}>AI, tüm derslerini ve notlarını inceleyip kişisel öneriler versin.</Text>
        <Button title={analyzing ? 'Analiz ediliyor…' : 'Beni Analiz Et'} onPress={analyze} loading={analyzing} />
        {analysis ? <Markdown source={analysis} /> : null}
      </Card>

      {/* Chat */}
      <Card style={{ gap: 10 }}>
        <Text style={styles.title}>💬  Koça Sor</Text>
        <TextInput
          value={question} onChangeText={setQuestion} placeholder="ör. Bu dönem hangi derse odaklanmalıyım?"
          placeholderTextColor={colors.textSec} style={[styles.input, { minHeight: 44 }]} multiline onSubmitEditing={ask} />
        <Button title={asking ? 'Düşünüyor…' : 'Sor'} onPress={ask} loading={asking} variant="secondary" />
        {answer ? <Markdown source={answer} /> : null}
      </Card>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: 16, gap: 14, maxWidth: 620, width: '100%', alignSelf: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.brand, borderColor: colors.brand },
  heroT: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroS: { color: '#fff', opacity: 0.9, fontSize: 13, marginTop: 2 },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  k: { color: colors.textSec, fontWeight: '600', marginBottom: 4 },
  inline: { flexDirection: 'row', gap: 12 },
  input: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, backgroundColor: colors.card },
  result: { borderRadius: radius.md, padding: 14, gap: 2 },
  ai: { color: colors.text, lineHeight: 22, backgroundColor: colors.brandTint, padding: 14, borderRadius: radius.md, marginTop: 4 },
});
