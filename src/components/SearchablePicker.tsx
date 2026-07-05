import { useMemo, useState } from 'react';
import {
  View, Text, TextInput, Modal, Pressable, FlatList, StyleSheet, Platform,
} from 'react-native';
import { colors, radius, shadow } from '@/lib/theme';

type Props = {
  icon: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
};

/** A form field that opens a searchable modal list to pick one string value. */
export function SearchablePicker({ icon, placeholder, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return options;
    return options.filter((o) => o.toLocaleLowerCase('tr').includes(q));
  }, [query, options]);

  function pick(v: string) {
    onChange(v);
    setQuery('');
    setOpen(false);
  }

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{placeholder}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Text style={styles.cancel}>İptal</Text>
              </Pressable>
            </View>
            <TextInput
              placeholder="Ara"
              placeholderTextColor={colors.textSec}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.search}
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              style={{ flexGrow: 0 }}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => pick(item)}>
                  <Text style={styles.rowText}>{item}</Text>
                  {item === value ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.empty}>Sonuç bulunamadı</Text>}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.card,
  },
  icon: { fontSize: 16, width: 22, textAlign: 'center' },
  value: { flex: 1, fontSize: 16, color: colors.text },
  placeholder: { color: colors.textSec },
  chevron: { fontSize: 18, color: colors.textSec, marginTop: -4 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '82%', ...shadow,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  cancel: { fontSize: 16, color: colors.brand, fontWeight: '600' },
  search: {
    borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text,
    backgroundColor: colors.card, marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  rowText: { fontSize: 16, color: colors.text, flex: 1, paddingRight: 12 },
  check: { fontSize: 16, color: colors.brand, fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.textSec, paddingVertical: 24 },
});
