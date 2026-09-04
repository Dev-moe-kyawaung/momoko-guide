import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../store';
import { radius, shadow, spacing, Theme } from '../theme';
import type { Crowding } from '../types';
import { CROWDING_COLOR } from '../lib/gtfs';

interface TxtProps {
  children: React.ReactNode;
  theme: Theme;
  size?: number;
  weight?: '400' | '500' | '600' | '700' | '800';
  color?: string;
  dim?: boolean;
  center?: boolean;
  numberOfLines?: number;
  style?: TextStyle;
  mono?: boolean;
}

/** Themed text that honours the accessibility text-size multiplier. */
export function Txt({ children, theme, size = 14, weight = '500', color, dim, center, numberOfLines, style, mono }: TxtProps) {
  const { settings } = useApp();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: color ?? (dim ? theme.textDim : theme.text),
          fontSize: size * settings.fontScale,
          fontWeight: weight,
          textAlign: center ? 'center' : undefined,
          fontFamily: mono ? 'monospace' : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({ children, theme, style, elevated }: { children: React.ReactNode; theme: Theme; style?: ViewStyle; elevated?: boolean }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, elevated ? shadow(4) : null, style]}>{children}</View>
  );
}

export function IconBadge({ name, color, bg, size = 18, box = 38 }: { name: any; color: string; bg: string; size?: number; box?: number }) {
  return (
    <View style={[styles.iconBox, { width: box, height: box, borderRadius: box / 3, backgroundColor: bg }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export function Chip({
  label,
  theme,
  active,
  onPress,
  icon,
  color,
}: {
  label: string;
  theme: Theme;
  active?: boolean;
  onPress?: () => void;
  icon?: any;
  color?: string;
}) {
  const { settings } = useApp();
  const tint = color ?? theme.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? (color ? `${color}26` : theme.primarySoft) : theme.cardAlt,
          borderColor: active ? tint : theme.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={13} color={active ? tint : theme.textDim} /> : null}
      <Text style={{ color: active ? tint : theme.textDim, fontSize: 12.5 * settings.fontScale, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  theme,
}: {
  options: { id: T; label: string; icon?: any }[];
  value: T;
  onChange: (v: T) => void;
  theme: Theme;
}) {
  const { settings } = useApp();
  return (
    <View style={[styles.segment, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[styles.segmentItem, active ? { backgroundColor: theme.card, ...shadow(2) } : null]}
          >
            {o.icon ? <Ionicons name={o.icon} size={14} color={active ? theme.primary : theme.textDim} /> : null}
            <Text style={{ color: active ? theme.text : theme.textDim, fontWeight: active ? '800' : '600', fontSize: 12.5 * settings.fontScale }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeader({
  title,
  theme,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  theme: Theme;
  actionLabel?: string;
  onAction?: () => void;
  icon?: any;
}) {
  const { settings } = useApp();
  return (
    <View style={styles.sectionRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon ? <Ionicons name={icon} size={15} color={theme.primary} /> : null}
        <Txt theme={theme} size={15} weight="800">
          {title}
        </Txt>
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12.5 * settings.fontScale }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function CrowdDots({ level, theme, size = 7 }: { level: Crowding; theme: Theme; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: i <= level ? CROWDING_COLOR[level] : theme.dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)',
          }}
        />
      ))}
    </View>
  );
}

export function Button({
  label,
  theme,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  theme: Theme;
  onPress?: () => void;
  icon?: any;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { settings } = useApp();
  const bg = variant === 'primary' ? theme.primary : variant === 'danger' ? (theme.dark ? '#3A1B22' : '#FBE7E7') : theme.cardAlt;
  const fg = variant === 'primary' ? (theme.dark ? '#04140B' : '#FFFFFF') : variant === 'danger' ? theme.danger : theme.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1, borderColor: theme.border },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={16} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '800', fontSize: 14 * settings.fontScale }}>{label}</Text>
    </Pressable>
  );
}

export function Divider({ theme }: { theme: Theme }) {
  return <View style={{ height: 1, backgroundColor: theme.border }} />;
}

export function EmptyState({ theme, icon, title, body }: { theme: Theme; icon: any; title: string; body?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xl, gap: 6 }}>
      <View style={[styles.iconBox, { width: 52, height: 52, borderRadius: 18, backgroundColor: theme.cardAlt }]}>
        <Ionicons name={icon} size={24} color={theme.textFaint} />
      </View>
      <Txt theme={theme} size={14} weight="700">
        {title}
      </Txt>
      {body ? (
        <Txt theme={theme} size={12.5} dim center>
          {body}
        </Txt>
      ) : null}
    </View>
  );
}

export function Tag({ label, theme, color }: { label: string; theme: Theme; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={{ color, fontSize: 10.5, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.sm },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  segment: { flexDirection: 'row', borderRadius: radius.pill, padding: 3, borderWidth: 1, gap: 2 },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
});
