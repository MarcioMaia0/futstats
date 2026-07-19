import type { PropsWithChildren } from 'react';
import { Image, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

import backgroundPatternDark from '../../assets/backgrounds/background-pattern-dark.png';
import backgroundPatternLight from '../../assets/backgrounds/background-pattern-light.png';
import type { ExperienceThemeMode } from '../../theme/teamExperienceTheme';

const PATTERN_TILE_SIZE = 420;

type ThemedTextureBackgroundProps = PropsWithChildren<{
  baseColor: string;
  mode?: ExperienceThemeMode;
}>;

export function ThemedTextureBackground({ baseColor, children, mode }: ThemedTextureBackgroundProps) {
  const colorScheme = useColorScheme();
  const { height, width } = useWindowDimensions();
  const isLight = mode ? mode === 'light' : colorScheme === 'light';
  const pattern = isLight ? backgroundPatternLight : backgroundPatternDark;
  const columns = Math.ceil(width / PATTERN_TILE_SIZE) + 1;
  const rows = Math.ceil(height / PATTERN_TILE_SIZE) + 1;
  const tiles = Array.from({ length: columns * rows }, (_, index) => ({
    column: index % columns,
    row: Math.floor(index / columns),
  }));

  return (
    <View style={[styles.container, { backgroundColor: baseColor }]}>
      <View pointerEvents="none" style={styles.patternLayer}>
        {tiles.map((tile) => (
          <Image
            key={`${tile.row}-${tile.column}`}
            resizeMode="cover"
            source={pattern}
            style={[
              styles.patternTile,
              {
                left: tile.column * PATTERN_TILE_SIZE,
                top: tile.row * PATTERN_TILE_SIZE,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  patternLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  patternTile: {
    position: 'absolute',
    height: PATTERN_TILE_SIZE,
    width: PATTERN_TILE_SIZE,
    opacity: 1,
  },
  contentLayer: {
    flex: 1,
  },
});
