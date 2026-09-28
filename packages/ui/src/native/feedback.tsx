import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  EmptyStateBaseProps,
  ErrorStateBaseProps,
  LoadingStateBaseProps,
  SkeletonBaseProps,
} from '../shared';
import { Button } from './button';
import { t, text } from './theme';

export type EmptyStateProps = EmptyStateBaseProps;

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <View style={styles.state}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

export type LoadingStateProps = LoadingStateBaseProps;

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <View
      style={styles.state}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator color={t.color.action.primary.bg} />
      <Text style={styles.description}>{label}</Text>
    </View>
  );
}

export interface ErrorStateProps extends ErrorStateBaseProps {
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this information. Please try again.',
  retryLabel = 'Try again',
  requestId,
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.state} accessibilityRole="alert">
      <View style={[styles.icon, styles.iconDanger]}>
        <Text style={styles.iconDangerGlyph}>!</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {requestId ? <Text style={styles.meta}>Reference: {requestId}</Text> : null}
      {onRetry ? (
        <View style={styles.action}>
          <Button variant="secondary" onPress={onRetry}>
            {retryLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export type SkeletonProps = SkeletonBaseProps;

/** Pulsing placeholder; static when the user prefers reduced motion. */
export function Skeleton({ width = '100%', height = 14, radius = 'sm' }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: width as number | `${number}%`,
        height,
        borderRadius: t.radius[radius],
        backgroundColor: t.color.skeleton,
        opacity,
      }}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space[2],
    paddingVertical: t.space[10],
    paddingHorizontal: t.space[6],
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    marginBottom: t.space[1],
    borderRadius: t.radius.full,
    backgroundColor: t.color.bg.muted,
  },
  iconDanger: { backgroundColor: t.color.status.danger.bg },
  iconDangerGlyph: { ...text('h2'), color: t.color.status.danger.fg },
  title: { ...text('h3'), color: t.color.text.primary, textAlign: 'center' },
  description: { ...text('body'), color: t.color.text.tertiary, textAlign: 'center' },
  meta: { ...text('caption'), color: t.color.text.tertiary },
  action: { marginTop: t.space[3] },
});
