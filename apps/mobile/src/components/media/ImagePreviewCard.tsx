import { FontAwesome5 } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { components, defaultTheme, layout, typography } from '../../theme';

type ImagePreviewCardProps = {
  imageUri?: string | null;
  isUploading?: boolean;
  onEdit: () => void;
  title: string;
};

export function ImagePreviewCard({
  imageUri,
  isUploading = false,
  onEdit,
  title,
}: ImagePreviewCardProps) {
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onEdit} style={styles.previewWrap}>
        <View style={styles.previewSurface}>
          {imageUri ? (
            <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <FontAwesome5 color={defaultTheme.icon.accent} name="shield-alt" size={82} />
          )}
        </View>

        <View pointerEvents="none" style={styles.editBadge}>
          <FontAwesome5 color={components.button.primary.textColor} name="pen" size={16} />
        </View>
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      {isUploading ? <Text style={styles.status}>Enviando escudo...</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.default,
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: layout.spacing.sm,
    paddingHorizontal: layout.spacing.xl,
    paddingVertical: layout.spacing.xl,
  },
  editBadge: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.primaryAction,
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
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    borderColor: defaultTheme.border.subtle,
    borderRadius: 28,
    borderWidth: 1,
    height: 116,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 116,
  },
  previewWrap: {
    position: 'relative',
  },
  status: {
    color: defaultTheme.text.accent,
    fontSize: typography.textStyles.bodySmall.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.bodySmall.lineHeight,
    textAlign: 'center',
  },
  title: {
    color: 'rgb(150, 150, 150)',
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '400',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
    textAlign: 'center',
  },
});
