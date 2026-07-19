import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { components, defaultTheme, layout, typography } from '../../theme';
import type { TeamExperienceTheme } from '../../theme/teamExperienceTheme';

type ImagePreviewCardProps = {
  entityType?: 'person' | 'team';
  imageUri?: string | null;
  isUploading?: boolean;
  onEdit: () => void;
  theme?: Pick<TeamExperienceTheme, 'accentOnPrimary' | 'accentPrimary' | 'borderDefault' | 'surfaceBase' | 'surfaceCard' | 'textMuted'>;
  title: string;
};

export function ImagePreviewCard({
  entityType = 'team',
  imageUri,
  isUploading = false,
  onEdit,
  theme,
  title,
}: ImagePreviewCardProps) {
  const fallbackIconName = entityType === 'person' ? 'person-outline' : 'shield-outline';
  const uploadingLabel = entityType === 'person' ? 'Enviando foto...' : 'Enviando escudo...';

  return (
    <View
      // classes="flex items-center justify-center"
      style={[
        styles.card,
        {
          backgroundColor: theme?.surfaceCard ?? defaultTheme.surface.input,
          borderColor: theme?.borderDefault ?? defaultTheme.border.default,
        },
      ]}
    >
      <Pressable accessibilityRole="button" onPress={onEdit} style={styles.previewWrap}>
        <View
          style={[
            styles.previewSurface,
            {
              backgroundColor: theme?.surfaceBase ?? 'rgba(0, 0, 0, 0.14)',
              borderColor: theme?.borderDefault ?? defaultTheme.border.subtle,
            },
          ]}
        >
          {imageUri ? (
            <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <Ionicons color={theme?.accentPrimary ?? defaultTheme.icon.accent} name={fallbackIconName} size={82} />
          )}
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.editBadge,
            {
              backgroundColor: theme?.accentPrimary ?? defaultTheme.surface.primaryAction,
            },
          ]}
        >
          <Ionicons color={theme?.accentOnPrimary ?? components.button.primary.textColor} name="pencil" size={16} />
        </View>
      </Pressable>

      <Text style={[styles.title, { color: theme?.textMuted ?? 'rgb(150, 150, 150)' }]}>{title}</Text>

      {isUploading ? <Text style={[styles.status, { color: theme?.accentPrimary ?? defaultTheme.text.accent }]}>{uploadingLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: layout.spacing.sm,
    paddingHorizontal: layout.spacing.xl,
    paddingVertical: layout.spacing.xl,
  },
  editBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    top: -4,
    width: 34,
  },
  previewImage: {
    borderRadius: 28,
    height: '100%',
    width: '100%',
  },
  previewSurface: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    height: 200,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 200,
  },
  previewWrap: {
    position: 'relative',
  },
  status: {
    fontSize: typography.textStyles.bodySmall.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.bodySmall.lineHeight,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '400',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
    textAlign: 'center',
  },
});
