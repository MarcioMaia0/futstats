import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import logoFinal from '../../../assets/brand/logo-final.png';
import phoneLandscapeContainer from '../../../assets/start-path/containers/container-celular-landscape.png';
import phonePortraitContainer from '../../../assets/start-path/containers/container-celular-portrait.png';
import tabletLandscapeContainer from '../../../assets/start-path/containers/container-tablet-landscape.png';
import tabletPortraitContainer from '../../../assets/start-path/containers/container-tablet-portrait.png';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';

type DevicePreset = 'phonePortrait' | 'phoneLandscape' | 'tabletPortrait' | 'tabletLandscape';

type ButtonLayout = {
  action: 'CREATE_TEAM' | 'JOIN_TEAM' | 'EXPLORE';
  hookSuffix: string;
  label: string;
  buttonClassName: string;
};

type ContainerLayout = {
  buttons: ButtonLayout[];
  headerClassName: string;
  headerTextClassName: string;
  image: ImageSourcePropType;
  logoClassName: string;
  posterClassName: string;
  scrollContentClassName: string;
  subtitleClassName: string;
  titleClassName: string;
};

type StartPathSelectionPosterScreenProps = {
  onBack?: () => void;
  onChoice?: (choice: 'CREATE_TEAM' | 'JOIN_TEAM' | 'EXPLORE') => void;
};

const LAYOUTS: Record<DevicePreset, ContainerLayout> = {
  phonePortrait: {
    image: phonePortraitContainer,
    headerClassName: 'relative w-full items-center gap-2 px-4 pb-2 pt-4',
    headerTextClassName: 'items-center',
    logoClassName: 'h-[136px] w-[156px] overflow-hidden',
    posterClassName: 'relative w-full aspect-[428/671] overflow-hidden',
    scrollContentClassName: 'items-center',
    subtitleClassName: 'text-center text-[17px] font-bold leading-[21.25px] text-white',
    titleClassName: 'text-center font-brand text-[35px] leading-[43.68px] text-white',
    buttons: [
      {
        action: 'CREATE_TEAM',
        hookSuffix: 'create-team',
        label: 'Criar',
        buttonClassName:
          'absolute left-[68.7%] top-[25.7%] w-[27.5%] min-h-[42px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'JOIN_TEAM',
        hookSuffix: 'join-team',
        label: 'Buscar',
        buttonClassName:
          'absolute left-[4.5%] top-[58.5%] w-[27.5%] min-h-[42px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'EXPLORE',
        hookSuffix: 'explore',
        label: 'Explorar',
        buttonClassName:
          'absolute left-[66.4%] top-[90.5%] w-[29%] min-h-[42px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
    ],
  },
  phoneLandscape: {
    image: phoneLandscapeContainer,
    headerClassName: 'relative w-full flex-row justify-center gap-[26px] px-4 pb-[10px] pt-3',
    headerTextClassName: 'items-start',
    logoClassName: 'h-[94px] w-[108px] overflow-hidden',
    posterClassName: 'relative w-full aspect-[927/417] overflow-hidden',
    scrollContentClassName: 'items-center pt-0',
    subtitleClassName: 'text-center text-[18px] font-bold leading-[22.5px] text-white',
    titleClassName: 'text-center font-brand text-[42px] leading-[47.04px] text-white',
    buttons: [
      {
        action: 'CREATE_TEAM',
        hookSuffix: 'create-team',
        label: 'Criar',
        buttonClassName:
          'absolute left-[13.2%] top-[84.8%] w-[13%] min-h-[36px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'JOIN_TEAM',
        hookSuffix: 'join-team',
        label: 'Buscar',
        buttonClassName:
          'absolute left-[49.6%] top-[84.8%] w-[13%] min-h-[36px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'EXPLORE',
        hookSuffix: 'explore',
        label: 'Explorar',
        buttonClassName:
          'absolute left-[84.3%] top-[84.8%] w-[13%] min-h-[36px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
    ],
  },
  tabletPortrait: {
    image: tabletPortraitContainer,
    headerClassName: 'relative w-full flex-row justify-center gap-[26px] px-4 pb-[10px] pt-3',
    headerTextClassName: 'items-start',
    logoClassName: 'h-[124px] w-[142px] overflow-hidden',
    posterClassName: 'relative w-full aspect-[1024/1199] overflow-hidden',
    scrollContentClassName: 'items-center pt-[10px]',
    subtitleClassName: 'text-center text-[24px] font-bold leading-[30px] text-white',
    titleClassName: 'text-center font-brand text-[54px] leading-[60.48px] text-white',
    buttons: [
      {
        action: 'CREATE_TEAM',
        hookSuffix: 'create-team',
        label: 'Criar',
        buttonClassName:
          'absolute left-[76.2%] top-[23.6%] w-[19.7%] min-h-[56px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'JOIN_TEAM',
        hookSuffix: 'join-team',
        label: 'Buscar',
        buttonClassName:
          'absolute left-[4.8%] top-[54.8%] w-[19.7%] min-h-[56px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'EXPLORE',
        hookSuffix: 'explore',
        label: 'Explorar',
        buttonClassName:
          'absolute left-[73%] top-[89.6%] w-[19.7%] min-h-[56px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
    ],
  },
  tabletLandscape: {
    image: tabletLandscapeContainer,
    headerClassName: 'relative w-full flex-row justify-center gap-[26px] px-4 pb-[10px] pt-3',
    headerTextClassName: 'items-start',
    logoClassName: 'h-[146px] w-[168px] overflow-hidden',
    posterClassName: 'relative w-full aspect-[1364/611] overflow-hidden',
    scrollContentClassName: 'items-center pt-0',
    subtitleClassName: 'text-center text-[27px] font-bold leading-[33.75px] text-white',
    titleClassName: 'text-center font-brand text-[58px] leading-[64.96px] text-white',
    buttons: [
      {
        action: 'CREATE_TEAM',
        hookSuffix: 'create-team',
        label: 'Criar',
        buttonClassName:
          'absolute left-[13.4%] top-[82%] w-[12.6%] min-h-[40px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'JOIN_TEAM',
        hookSuffix: 'join-team',
        label: 'Buscar',
        buttonClassName:
          'absolute left-[49.7%] top-[82%] w-[12.6%] min-h-[40px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
      {
        action: 'EXPLORE',
        hookSuffix: 'explore',
        label: 'Explorar',
        buttonClassName:
          'absolute left-[84.3%] top-[82%] w-[12.6%] min-h-[40px] items-center justify-center rounded-[14px] bg-brand-gold px-3',
      },
    ],
  },
};

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function StartPathSelectionPosterScreen({ onBack, onChoice }: StartPathSelectionPosterScreenProps) {
  const { width, height } = useWindowDimensions();
  const preset = getPreset(width, height);
  const layout = LAYOUTS[preset];

  return (
    <ScrollView className="flex-1" contentContainerClassName={layout.scrollContentClassName} {...hookProps('start-path-container-scroll')}>
      <View className="w-full items-center flex-1" {...hookProps('start-path-container-content')}>
        <View className={layout.headerClassName} {...hookProps('start-path-container-header')}>
          {onBack && <BackCircleButton className="absolute left-[18px] top-5 z-10" onPress={onBack} />}

          <View className={layout.logoClassName} {...hookProps('start-path-container-logo')}>
            <Image
              accessibilityLabel="Logo FUTSTATS"
              className="h-full w-full"
              resizeMode="contain"
              source={logoFinal}
              style={{ height: '100%', width: '100%' }}
              {...hookProps('start-path-image-logo')}
            />
          </View>

          <View className={layout.headerTextClassName} {...hookProps('start-path-container-header-text')}>
            <Text  className={layout.titleClassName}  {...hookProps('start-path-text-title')}>
              Como você quer <Text className="text-brand-gold">começar?</Text>
            </Text>
            <Text className={layout.subtitleClassName} {...hookProps('start-path-text-subtitle')}>
              Escolha seu caminho. Dá para mudar depois!
            </Text>
          </View>
        </View>

        <View className={layout.posterClassName} {...hookProps('start-path-container-poster')}>
          <ImageBackground
            className="h-full w-full"
            resizeMode="cover"
            source={layout.image}
            style={{ height: '100%', width: '100%' }}
            {...hookProps('start-path-image-poster')}
          />

          {layout.buttons.map((button) => (
            <Pressable
              accessibilityRole="button"
              key={button.label}
              onPress={() => onChoice?.(button.action)}
              className={button.buttonClassName}
              {...hookProps(`start-path-button-${button.hookSuffix}`)}
            >
              <View className="flex-row items-center justify-center gap-[10px]" {...hookProps(`start-path-button-content-${button.hookSuffix}`)}>
                <Text className="text-[19px] font-bold leading-6 text-[#1E1E1E]" {...hookProps(`start-path-button-text-${button.hookSuffix}`)}>
                  {button.label}
                </Text>
                <View {...hookProps(`start-path-button-icon-${button.hookSuffix}`)}>
                  <Ionicons color="#1E1E1E" name="arrow-forward" size={16} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
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
