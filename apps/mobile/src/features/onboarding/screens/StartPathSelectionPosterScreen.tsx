import { FontAwesome5 } from '@expo/vector-icons';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import logoFinal from '../../../assets/brand/logo-final.png';
import phoneLandscapeContainer from '../../../assets/start-path/containers/container-celular-landscape.png';
import phonePortraitContainer from '../../../assets/start-path/containers/container-celular-portrait.png';
import tabletLandscapeContainer from '../../../assets/start-path/containers/container-tablet-landscape.png';
import tabletPortraitContainer from '../../../assets/start-path/containers/container-tablet-portrait.png';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { colors } from '../../../theme/colors';
import { components } from '../../../theme/components';

type DevicePreset = 'phonePortrait' | 'phoneLandscape' | 'tabletPortrait' | 'tabletLandscape';

type ButtonLayout = {
  label: string;
  left: number;
  top: number;
  width: number;
};

type ContainerLayout = {
  buttons: ButtonLayout[];
  headerDirection: 'column' | 'row';
  image: ImageSourcePropType;
  imageHeight: number;
  imageWidth: number;
  logoHeight: number;
  logoWidth: number;
  subtitleSize: number;
  titleSize: number;
};

type StartPathSelectionPosterScreenProps = {
  onBack?: () => void;
  onChoice?: (choice: 'CREATE_TEAM' | 'JOIN_TEAM' | 'EXPLORE') => void;
};

const GOLD = colors.brand.gold;

const LAYOUTS: Record<DevicePreset, ContainerLayout> = {
  phonePortrait: {
    image: phonePortraitContainer,
    imageWidth: 428,
    imageHeight: 671,
    headerDirection: 'column',
    logoWidth: 156,
    logoHeight: 136,
    titleSize: 39,
    subtitleSize: 17,
    buttons: [
      { label: 'Criar', left: 0.687, top: 0.257, width: 0.275 },
      { label: 'Buscar', left: 0.075, top: 0.535, width: 0.275 },
      { label: 'Explorar', left: 0.684, top: 0.895, width: 0.29 },
    ],
  },
  phoneLandscape: {
    image: phoneLandscapeContainer,
    imageWidth: 927,
    imageHeight: 417,
    headerDirection: 'row',
    logoWidth: 108,
    logoHeight: 94,
    titleSize: 42,
    subtitleSize: 18,
    buttons: [
      { label: 'Criar', left: 0.132, top: 0.798, width: 0.13 },
      { label: 'Buscar', left: 0.496, top: 0.798, width: 0.13 },
      { label: 'Explorar', left: 0.843, top: 0.798, width: 0.13 },
    ],
  },
  tabletPortrait: {
    image: tabletPortraitContainer,
    imageWidth: 1024,
    imageHeight: 1199,
    headerDirection: 'row',
    logoWidth: 142,
    logoHeight: 124,
    titleSize: 54,
    subtitleSize: 24,
    buttons: [
      { label: 'Criar', left: 0.762, top: 0.236, width: 0.197 },
      { label: 'Buscar', left: 0.048, top: 0.548, width: 0.197 },
      { label: 'Explorar', left: 0.73, top: 0.896, width: 0.197 },
    ],
  },
  tabletLandscape: {
    image: tabletLandscapeContainer,
    imageWidth: 1364,
    imageHeight: 611,
    headerDirection: 'row',
    logoWidth: 168,
    logoHeight: 146,
    titleSize: 58,
    subtitleSize: 27,
    buttons: [
      { label: 'Criar', left: 0.134, top: 0.82, width: 0.126 },
      { label: 'Buscar', left: 0.497, top: 0.82, width: 0.126 },
      { label: 'Explorar', left: 0.843, top: 0.82, width: 0.126 },
    ],
  },
};

export function StartPathSelectionPosterScreen({ onBack, onChoice }: StartPathSelectionPosterScreenProps) {
  const { width, height } = useWindowDimensions();
  const preset = getPreset(width, height);
  const layout = LAYOUTS[preset];
  const imageHeight = width * (layout.imageHeight / layout.imageWidth);
  const isLandscape = preset === 'phoneLandscape' || preset === 'tabletLandscape';
  const headerScale = Math.min(width / (isLandscape ? 920 : 428), 1);

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, isLandscape && styles.landscapeScrollContent]}>
      <View style={[styles.header, layout.headerDirection === 'row' && styles.headerRow]}>
        {onBack && (
          <BackCircleButton onPress={onBack} style={styles.backButton} />
        )}

        <Image
          accessibilityLabel="Logo FUTSTATS"
          resizeMode="contain"
          source={logoFinal}
          style={{
            height: layout.logoHeight * headerScale,
            width: layout.logoWidth * headerScale,
          }}
        />

        <View style={[styles.headerText, layout.headerDirection === 'row' && styles.headerTextRow]}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.headerTitle,
              {
                fontSize: layout.titleSize * headerScale,
                lineHeight: layout.titleSize * 1.12 * headerScale,
              },
            ]}
          >
            Como você quer <Text style={styles.headerTitleAccent}>começar?</Text>
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.headerSubtitle,
              {
                fontSize: layout.subtitleSize * headerScale,
                lineHeight: layout.subtitleSize * 1.25 * headerScale,
              },
            ]}
          >
            Escolha seu caminho. Dá para mudar depois!
          </Text>
        </View>
      </View>

      <View style={[styles.containerFrame, { height: imageHeight, width }]}>
        <ImageBackground resizeMode="cover" source={layout.image} style={styles.containerImage} />

        {layout.buttons.map((button) => (
          <Pressable
            accessibilityRole="button"
            key={button.label}
            onPress={() => onChoice?.(getChoiceByLabel(button.label))}
            style={[
              styles.cardButton,
              {
                left: width * button.left,
                minHeight: Math.max(36, imageHeight * 0.065),
                top: imageHeight * button.top,
                width: width * button.width,
              },
            ]}
          >
            <View style={styles.cardButtonContent}>
              <Text
                style={[
                  styles.cardButtonText,
                  {
                    fontSize: Math.max(components.button.primary.textStyle.fontSize, width * 0.017),
                  },
                ]}
              >
                {button.label}
              </Text>
              <FontAwesome5 color={colors.text.onGold} name="arrow-right" size={Math.max(13, width * 0.016)} />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function getChoiceByLabel(label: string) {
  if (label === 'Criar') {
    return 'CREATE_TEAM' as const;
  }

  if (label === 'Buscar') {
    return 'JOIN_TEAM' as const;
  }

  return 'EXPLORE' as const;
}

function getPreset(width: number, height: number): DevicePreset {
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 768;

  if (isTablet && isLandscape) {
    return 'tabletLandscape';
  }

  if (isTablet) {
    return 'tabletPortrait';
  }

  return isLandscape ? 'phoneLandscape' : 'phonePortrait';
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  landscapeScrollContent: {
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    paddingTop: 8,
    position: 'relative',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    gap: 26,
    justifyContent: 'center',
    paddingBottom: 10,
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.82)',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    left: 18,
    position: 'absolute',
    top: 20,
    width: 42,
    zIndex: 10,
  },
  headerText: {
    alignItems: 'center',
  },
  headerTextRow: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: colors.text.primary,
    fontFamily: 'SedgwickAve_400Regular',
    textAlign: 'center',
  },
  headerTitleAccent: {
    color: GOLD,
  },
  headerSubtitle: {
    color: colors.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  containerFrame: {
    overflow: 'hidden',
    position: 'relative',
  },
  containerImage: {
    height: '100%',
    width: '100%',
  },
  cardButton: {
    alignItems: 'center',
    backgroundColor: GOLD,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'absolute',
  },
  cardButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: components.button.primary.iconGap,
    justifyContent: 'center',
  },
  cardButtonText: {
    color: components.button.primary.textColor,
    fontWeight: components.button.primary.textStyle.fontWeight,
    lineHeight: components.button.primary.textStyle.lineHeight,
  },
});
