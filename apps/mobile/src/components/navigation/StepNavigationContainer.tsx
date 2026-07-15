import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { defaultTheme } from '../../theme/tokens';

type StepNavigationContainerProps = {
  children: ReactNode;
  currentStep: number;
  style?: StyleProp<ViewStyle>;
  totalSteps: number;
};

export function StepNavigationContainer({
  children,
  currentStep,
  style,
  totalSteps,
}: StepNavigationContainerProps) {
  const safeTotalSteps = Math.max(1, totalSteps);
  const safeCurrentStep = clamp(currentStep, 0, safeTotalSteps - 1);

  return (
    <View style={[styles.shell, style]}>
      <View style={styles.card}>{children}</View>

      <View style={styles.progressArea}>
        <View style={styles.markersRow}>
          {Array.from({ length: safeTotalSteps }, (_, index) => {
            const isActive = index === safeCurrentStep;

            return <View key={`step-marker-${index}`} style={[styles.marker, isActive && styles.markerActive]} />;
          })}
        </View>

        <Text style={styles.counterText}>
          {String(safeCurrentStep + 1).padStart(2, '0')}/{String(safeTotalSteps).padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: defaultTheme.surface.card,
    borderColor: defaultTheme.border.default,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    width: '100%',
  },
  counterText: {
    color: defaultTheme.text.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  marker: {
    backgroundColor: defaultTheme.wizard.markerInactive,
    borderRadius: 999,
    height: 3,
    width: 22,
  },
  markerActive: {
    backgroundColor: defaultTheme.wizard.markerActive,
    width: 18,
  },
  markersRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  progressArea: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 14,
  },
  shell: {
    alignItems: 'center',
    width: '100%',
  },
});
