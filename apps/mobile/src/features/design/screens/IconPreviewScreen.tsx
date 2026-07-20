import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { ThemedTextureBackground } from '../../../components/layout/ThemedTextureBackground';
import {
  resolveExperienceTheme,
  type TeamExperienceTheme,
  type TeamExperienceThemeOverrides,
  type UserThemePreferenceKey,
} from '../../../theme/teamExperienceTheme';

type IconPreviewScreenProps = {
  onBack?: () => void;
  preferredThemeKey?: UserThemePreferenceKey | null;
  themeOverrides?: TeamExperienceThemeOverrides | null;
};

type IconPreviewItem = {
  family: 'ionicons' | 'material-community';
  icon: string;
  label: string;
};

const ICON_PREVIEW_ITEMS_BASE: IconPreviewItem[] = [
  { family: 'ionicons', icon: 'add', label: 'Adicionar' },
  { family: 'ionicons', icon: 'calendar-outline', label: 'Agenda' },
  { family: 'material-community', icon: 'run-fast', label: 'Atleta' },
  { family: 'ionicons', icon: 'search', label: 'Buscar' },
  { family: 'ionicons', icon: 'people-outline', label: 'Comissão' },
  { family: 'ionicons', icon: 'checkmark-circle-outline', label: 'Confirmar presença' },
  { family: 'ionicons', icon: 'settings-outline', label: 'Configurações' },
  { family: 'ionicons', icon: 'football-outline', label: 'Criar jogo' },
  { family: 'ionicons', icon: 'briefcase-outline', label: 'Diretoria' },
  { family: 'ionicons', icon: 'create-outline', label: 'Editar' },
  { family: 'ionicons', icon: 'people-circle-outline', label: 'Elenco' },
  { family: 'ionicons', icon: 'ticket-outline', label: 'Evento' },
  { family: 'ionicons', icon: 'people-outline', label: 'Gerenciar integrantes' },
  { family: 'material-community', icon: 'badge-account-horizontal-outline', label: 'Identidade' },
  { family: 'ionicons', icon: 'home-outline', label: 'Início' },
  { family: 'ionicons', icon: 'notifications-outline', label: 'Notificações' },
  { family: 'ionicons', icon: 'person-outline', label: 'Perfil' },
  { family: 'ionicons', icon: 'person-circle-outline', label: 'Pessoa' },
  { family: 'ionicons', icon: 'megaphone-outline', label: 'Publicação' },
  { family: 'material-community', icon: 'crown-outline', label: 'Presidente' },
  { family: 'ionicons', icon: 'trash-outline', label: 'Remover' },
  { family: 'ionicons', icon: 'share-social-outline', label: 'Compartilhar' },
];

const ICON_PREVIEW_ITEMS = [...ICON_PREVIEW_ITEMS_BASE].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function IconPreviewScreen({
  onBack,
  preferredThemeKey = null,
  themeOverrides = null,
}: IconPreviewScreenProps) {
  const experienceAppearance = resolveExperienceTheme({
    context: 'team',
    preferredThemeKey,
    teamOverrides: themeOverrides,
  });
  const theme = experienceAppearance.theme;

  return (
    <ThemedTextureBackground baseColor={theme.surfaceBase} mode={experienceAppearance.mode}>
      <View className="flex-1 bg-transparent" {...hookProps('icon-preview-container-main')}>
        <View className="flex-row items-center justify-between px-4 pb-4 pt-3" {...hookProps('icon-preview-container-header')}>
          <BackCircleButton onPress={onBack} theme={theme} {...hookProps('icon-preview-button-back')} />
          <View className="items-end gap-1" {...hookProps('icon-preview-container-header-text')}>
            <Text className="font-slab text-[1.5rem] leading-[1.8rem]" style={{ color: theme.accentPrimary }} {...hookProps('icon-preview-text-title')}>
              Icon Preview
            </Text>
            <Text className="text-[0.85rem] leading-5" style={{ color: theme.textMuted }} {...hookProps('icon-preview-text-subtitle')}>
              Referência visual do app
            </Text>
          </View>
          <View className="h-[42px] w-[42px]" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-4 pb-[120px]"
          showsVerticalScrollIndicator={false}
          {...hookProps('icon-preview-container-scroll')}
        >
          <View
            className="rounded-[26px] border p-4"
            style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
            {...hookProps('icon-preview-card-list')}
          >
            <View className="gap-3" {...hookProps('icon-preview-container-list')}>
              {ICON_PREVIEW_ITEMS.map((item) => (
                <IconPreviewRow item={item} key={item.label} theme={theme} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ThemedTextureBackground>
  );
}

function IconPreviewRow({ item, theme }: { item: IconPreviewItem; theme: TeamExperienceTheme }) {
  const hookKey = item.label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <View
      className="flex-row items-center gap-3 rounded-[18px] border px-4 py-3"
      style={{ backgroundColor: theme.surfaceBase, borderColor: theme.borderDefault }}
      {...hookProps(`icon-preview-row-${hookKey}`)}
    >
      <View
        className="h-[44px] w-[44px] items-center justify-center rounded-full"
        style={{ backgroundColor: `${theme.accentPrimary}18`, borderColor: theme.accentPrimary, borderWidth: 1 }}
        {...hookProps(`icon-preview-row-${hookKey}-icon-shell`)}
      >
        <PreviewIcon item={item} theme={theme} hookId={`icon-preview-row-${hookKey}-icon`} />
      </View>
      <View className="min-w-0 flex-1" {...hookProps(`icon-preview-row-${hookKey}-copy`)}>
        <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }} {...hookProps(`icon-preview-row-${hookKey}-label`)}>
          {item.label}
        </Text>
        <Text className="text-[0.85rem] leading-5" style={{ color: theme.textMuted }} {...hookProps(`icon-preview-row-${hookKey}-icon-name`)}>
          {item.family}/{item.icon}
        </Text>
      </View>
    </View>
  );
}

function PreviewIcon({ hookId, item, theme }: { hookId: string; item: IconPreviewItem; theme: TeamExperienceTheme }) {
  if (item.family === 'material-community') {
    return (
      <MaterialCommunityIcons
        color={theme.accentPrimary}
        name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={22}
        {...hookProps(hookId)}
      />
    );
  }

  return <Ionicons color={theme.accentPrimary} name={item.icon as keyof typeof Ionicons.glyphMap} size={22} {...hookProps(hookId)} />;
}
