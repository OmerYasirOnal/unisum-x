import React, { Fragment } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/lib/theme';

/** Split a line into <Text> spans, rendering **bold** and `code` inline. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== '');
  return parts.map((p, i) => {
    const k = `${keyPrefix}-${i}`;
    if (p.startsWith('**') && p.endsWith('**')) {
      return <Text key={k} style={styles.bold}>{p.slice(2, -2)}</Text>;
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return <Text key={k} style={styles.code}>{p.slice(1, -1)}</Text>;
    }
    return <Fragment key={k}>{p}</Fragment>;
  });
}

/**
 * Lightweight Markdown renderer for the AI coach output.
 * Handles: # / ## / ### headings, • / - / * bullets, 1. numbered lists,
 * **bold**, `code`, and blank-line spacing. Pure JS — works on web and native.
 */
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r/g, '').split('\n');
  const blocks: React.ReactNode[] = [];

  lines.forEach((raw, idx) => {
    const line = raw.replace(/\s+$/, '');
    const key = `l${idx}`;

    if (!line.trim()) {
      blocks.push(<View key={key} style={{ height: 6 }} />);
      return;
    }

    let m: RegExpMatchArray | null;

    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      const level = m[1].length;
      const style = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3;
      blocks.push(<Text key={key} style={style}>{renderInline(m[2], key)}</Text>);
      return;
    }

    if ((m = line.match(/^\s*[•\-*]\s+(.*)$/))) {
      blocks.push(
        <View key={key} style={styles.li}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.liText}>{renderInline(m[1], key)}</Text>
        </View>
      );
      return;
    }

    if ((m = line.match(/^\s*(\d+)\.\s+(.*)$/))) {
      blocks.push(
        <View key={key} style={styles.li}>
          <Text style={styles.num}>{m[1]}.</Text>
          <Text style={styles.liText}>{renderInline(m[2], key)}</Text>
        </View>
      );
      return;
    }

    blocks.push(<Text key={key} style={styles.p}>{renderInline(line, key)}</Text>);
  });

  return <View style={styles.container}>{blocks}</View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.brandTint, borderRadius: radius.md, padding: 16, gap: 3, marginTop: 4 },
  h1: { fontSize: 19, fontWeight: '900', color: colors.text, marginTop: 4, marginBottom: 4 },
  h2: { fontSize: 16, fontWeight: '800', color: colors.brandDeep, marginTop: 10, marginBottom: 2 },
  h3: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 8, marginBottom: 2 },
  p: { fontSize: 15, lineHeight: 22, color: colors.text },
  bold: { fontWeight: '800', color: colors.text },
  code: { fontFamily: 'monospace', fontSize: 13, color: colors.brandDeep, backgroundColor: '#00000010', borderRadius: 4 },
  li: { flexDirection: 'row', gap: 8, paddingRight: 4, marginVertical: 1 },
  bullet: { fontSize: 15, lineHeight: 22, color: colors.brand, fontWeight: '900' },
  num: { fontSize: 15, lineHeight: 22, color: colors.brand, fontWeight: '800', minWidth: 20 },
  liText: { flex: 1, fontSize: 15, lineHeight: 22, color: colors.text },
});
