import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

export function Chip({
  label,
  onRemove,
  tone = 'brand',
}: {
  label: string;
  onRemove?: () => void;
  tone?: 'brand' | 'danger';
}) {
  const isDanger = tone === 'danger';
  return (
    <Pressable
      onPress={onRemove}
      style={[styles.chip, { backgroundColor: isDanger ? colors.dangerLight : colors.brandLight, borderColor: isDanger ? colors.danger : colors.brand }]}
    >
      <Text style={[styles.label, { color: isDanger ? colors.danger : colors.brandDark }]}>{label}</Text>
      {onRemove ? <Text style={[styles.remove, { color: isDanger ? colors.danger : colors.brandDark }]}>✕</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: spacing(4),
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    marginRight: spacing(2),
    marginBottom: spacing(2),
  },
  label: { fontSize: 12, fontWeight: '600' },
  remove: { marginLeft: spacing(1.5), fontWeight: '700', fontSize: 12 },
});
