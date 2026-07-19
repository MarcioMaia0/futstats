import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ThemeToggle } from '../../../components/inputs/ThemeToggle';
import { ThemedTextureBackground } from '../../../components/layout/ThemedTextureBackground';
import { ImagePreviewCard } from '../../../components/media/ImagePreviewCard';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import {
  resolveAppExperienceTheme,
  resolveExperienceTheme,
  type TeamExperienceTheme,
  type TeamExperienceThemeOverrides,
  type UserThemePreferenceKey,
} from '../../../theme/teamExperienceTheme';
import { createTemporaryImageUpload } from '../../media/services/temporaryUploadService';
import {
  disconnectTeamSocialConnection,
  fetchTeamSocialConnections,
  saveTeamSocialConnection,
  type SocialConnectionStatus,
  type TeamSocialConnection,
} from '../services/teamSocialConnectionsService';
import {
  completeInstagramConnection,
  startInstagramConnection,
  validateInstagramConnection,
} from '../services/teamInstagramConnectionService';
import {
  createTeamVenue,
  deleteTeamVenue,
  fetchTeamVenues,
  saveTeamSettings,
  saveTeamThemeOverrides,
  setTeamPrimaryVenue,
  updateTeamVenue,
  type SaveTeamVenuePayload,
  type SocialPlatform,
  type SportModality,
  type TeamSummary,
  type TeamVenue,
} from '../services/teamService';

type TeamSettingsScreenProps = {
  initialThemeOverrides?: TeamExperienceThemeOverrides | null;
  onBack?: () => void;
  onTeamSaved?: (team: TeamSummary) => void;
  onThemeOverridesChange?: (overrides: TeamExperienceThemeOverrides | null) => void;
  preferredThemeKey?: UserThemePreferenceKey | null;
  team: TeamSummary;
};

type TeamColorKey = 'firstColor' | 'secondColor' | 'thirdColor';
type ThemeTokenKey =
  | 'accentOnPrimary'
  | 'accentPrimary'
  | 'borderDefault'
  | 'surfaceBase'
  | 'surfaceCard'
  | 'textMuted'
  | 'textPrimary';
type LayoutColorSource = 'FIRST_COLOR' | 'SECOND_COLOR' | 'THIRD_COLOR';

type SocialDraft = {
  handle: string;
  channelUrl: string;
  lastValidatedAt: string | null;
  publishEnabled: boolean;
  status: 'Conexâo pendente' | 'Publicação desativada';
};

type SocialAccountDraft = {
  channelUrl: string;
  handle: string;
  lastValidatedAt: string | null;
  publishEnabled: boolean;
  status: SocialConnectionStatus;
};

type TeamSettingsDraft = {
  commentsEnabled: boolean;
  crestUploadToken: string;
  displayName: string;
  firstColor: string;
  modalities: SportModality[];
  name: string;
  primaryVenueLabel: string;
  publicFeedEnabled: boolean;
  reactionsEnabled: boolean;
  secondColor: string;
  socialAccounts: Record<SocialPlatform, SocialAccountDraft>;
  textAccentColorSource: LayoutColorSource;
  textSupportColorSource: LayoutColorSource;
  thirdColor: string;
  uiBackgroundColorSource: LayoutColorSource;
  defaultPublishTeamEvents: boolean;
};

type TeamVenueDraft = {
  addressDistrict: string;
  addressLine: string;
  addressNumber: string;
  id: string | null;
  name: string;
  postalCode: string;
  regionCity: string;
  regionState: string;
  regionZone: string;
};

type ThemeEditorDraft = {
  accentOnPrimary: string;
  accentPrimary: string;
  borderDefault: string;
  surfaceBase: string;
  surfaceCard: string;
  textMuted: string;
  textPrimary: string;
};

type ActiveColorTarget =
  | { field: TeamColorKey; scope: 'official' }
  | { field: ThemeTokenKey; scope: 'theme' }
  | null;

const SOCIAL_PLATFORMS: Array<{ label: string; platform: SocialPlatform; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { label: 'Instagram', platform: 'INSTAGRAM', icon: 'logo-instagram' },
  { label: 'TikTok', platform: 'TIKTOK', icon: 'musical-notes-outline' },
  { label: 'YouTube', platform: 'YOUTUBE', icon: 'logo-youtube' },
] as const;

const MODALITY_OPTIONS: SportModality[] = ['FUTSAL', 'FIELD', 'SOCIETY'];
const NO_COLOR_VALUE = '__NO_COLOR__';
const COLOR_SWATCH_ROWS = buildColorSwatchRows();
const THEME_TOKEN_SECTIONS: Array<{
  items: Array<{ description: string; key: ThemeTokenKey; label: string }>;
  title: string;
}> = [
  {
    title: 'Base do tema',
    items: [
      { key: 'surfaceBase', label: 'Background com textura', description: 'Cor principal do fundo onde a textura aparece.' },
      { key: 'surfaceCard', label: 'Background dos containers', description: 'Cor base dos cards, caixas e áreas de configuração.' },
      { key: 'borderDefault', label: 'Borda padrão', description: 'Cor das bordas e separações visuais do tema.' },
    ],
  },
  {
    title: 'Textos e destaque',
    items: [
      { key: 'textPrimary', label: 'Texto principal', description: 'Texto de leitura principal dentro dos cards e áreas neutras.' },
      { key: 'textMuted', label: 'Texto complementar', description: 'Texto secundário, descrições e estados mais discretos.' },
      { key: 'accentPrimary', label: 'Cor principal', description: 'Cor de destaque usada em títulos, botões e elementos de ação.' },
      { key: 'accentOnPrimary', label: 'Texto sobre destaque', description: 'Cor do texto aplicado sobre a cor principal.' },
    ],
  },
];

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function TeamSettingsScreen({
  initialThemeOverrides = null,
  onBack,
  onTeamSaved,
  onThemeOverridesChange,
  preferredThemeKey = null,
  team,
}: TeamSettingsScreenProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 520;
  const shellWidth = Math.min(width - 32, 760);
  const [draft, setDraft] = useState<TeamSettingsDraft>(() => buildInitialDraft(team));
  const [crestPreviewUrl, setCrestPreviewUrl] = useState<string | null>(team.crest_url);
  const [isCrestUploading, setIsCrestUploading] = useState(false);
  const [isCrestSourceModalOpen, setIsCrestSourceModalOpen] = useState(false);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [activeColorTarget, setActiveColorTarget] = useState<ActiveColorTarget>(null);
  const [colorDraftValue, setColorDraftValue] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSocialConnectionsLoading, setIsSocialConnectionsLoading] = useState(true);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isVenuesLoading, setIsVenuesLoading] = useState(true);
  const [isVenueSaving, setIsVenueSaving] = useState(false);
  const [socialActionPlatform, setSocialActionPlatform] = useState<SocialPlatform | null>(null);
  const [teamVenues, setTeamVenues] = useState<TeamVenue[]>([]);
  const [venueDraft, setVenueDraft] = useState<TeamVenueDraft>(() => buildEmptyVenueDraft());
  const teamModalitiesKey = useMemo(() => normalizeTeamModalities(team.modalities).join('|'), [team.modalities]);
  const appExperienceAppearance = useMemo(() => resolveAppExperienceTheme(preferredThemeKey), [preferredThemeKey]);
  const appExperienceTheme = appExperienceAppearance.theme;
  const baseExperienceAppearance = useMemo(
    () =>
      resolveExperienceTheme({
        context: 'team',
        preferredThemeKey,
        teamOverrides: initialThemeOverrides,
      }),
    [initialThemeOverrides, preferredThemeKey],
  );
  const baseExperienceTheme = baseExperienceAppearance.theme;
  const [appliedThemeDraft, setAppliedThemeDraft] = useState<ThemeEditorDraft>(() => buildThemeEditorDraft(baseExperienceTheme));
  const [themeEditorDraft, setThemeEditorDraft] = useState<ThemeEditorDraft>(() => buildThemeEditorDraft(baseExperienceTheme));
  const experienceAppearance = useMemo(
    () =>
      resolveExperienceTheme({
        context: 'team',
        preferredThemeKey,
        teamOverrides: buildThemeOverrides(appliedThemeDraft, appExperienceTheme),
      }),
    [appliedThemeDraft, appExperienceTheme, preferredThemeKey],
  );
  const experienceTheme = experienceAppearance.theme;

  const colorOptions = useMemo(
    () => ({
      FIRST_COLOR: draft.firstColor || '#F2AD24',
      SECOND_COLOR: draft.secondColor || '#242424',
      THIRD_COLOR: draft.thirdColor || '#8E8E8E',
    }),
    [draft.firstColor, draft.secondColor, draft.thirdColor],
  );

  const layoutPreview = useMemo(
    () => ({
      accent: colorOptions[draft.textAccentColorSource],
      background: colorOptions[draft.uiBackgroundColorSource],
      support: colorOptions[draft.textSupportColorSource],
    }),
    [colorOptions, draft.textAccentColorSource, draft.textSupportColorSource, draft.uiBackgroundColorSource],
  );

  function updateDraft<K extends keyof TeamSettingsDraft>(key: K, value: TeamSettingsDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSocial(platform: SocialPlatform, patch: Partial<SocialAccountDraft>) {
    setDraft((current) => ({
      ...current,
      socialAccounts: {
        ...current.socialAccounts,
        [platform]: {
          ...current.socialAccounts[platform],
          ...patch,
        },
      },
    }));
  }

  useEffect(() => {
    const nextDraft = buildInitialDraft(team);

    setDraft(nextDraft);
    setCrestPreviewUrl(team.crest_url);
  }, [team.id, team.crest_url, teamModalitiesKey]);

  useEffect(() => {
    let isMounted = true;

    async function loadTeamVenues() {
      setIsVenuesLoading(true);

      try {
        const venues = await fetchTeamVenues(team.id, team.primary_venue_id);

        if (isMounted) {
          setTeamVenues(venues);
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Nao foi possivel carregar as quadras do time.';
          setFeedbackMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsVenuesLoading(false);
        }
      }
    }

    void loadTeamVenues();

    return () => {
      isMounted = false;
    };
  }, [team.id, team.primary_venue_id]);

  useEffect(() => {
    let isMounted = true;

    async function loadSocialConnections() {
      setIsSocialConnectionsLoading(true);

      try {
        const connections = await fetchTeamSocialConnections(team.id);

        if (!isMounted || !connections.length) {
          return;
        }

        setDraft((current) => ({
          ...current,
          socialAccounts: mergeSocialConnections(current.socialAccounts, connections),
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Não foi possível carregar as conexões sociais do time.';
        setFeedbackMessage(message);
      } finally {
        if (isMounted) {
          setIsSocialConnectionsLoading(false);
        }
      }
    }

    void loadSocialConnections();

    return () => {
      isMounted = false;
    };
  }, [team.id]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    const provider = url.searchParams.get('social_provider');
    const authorizationCode = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (provider !== 'instagram') {
      return;
    }

    if (error) {
      setFeedbackMessage(errorDescription ?? 'A autorização do Instagram foi cancelada ou falhou.');
      clearInstagramCallbackParams(url);
      return;
    }

    if (!authorizationCode || socialActionPlatform === 'INSTAGRAM') {
      return;
    }

    let isMounted = true;

    async function finishInstagramConnection() {
      setSocialActionPlatform('INSTAGRAM');

      try {
        const result = await completeInstagramConnection(team.id, authorizationCode!, state);
        updateSocial('INSTAGRAM', mapConnectionToDraftFromApi(result.connection));
        setFeedbackMessage('Instagram conectado com sucesso.');
      } catch (completionError) {
        const message =
          completionError instanceof Error
            ? completionError.message
            : 'Não foi possível concluir a conexão do Instagram.';
        setFeedbackMessage(message);
      } finally {
        if (isMounted) {
          setSocialActionPlatform(null);
          clearInstagramCallbackParams(url);
        }
      }
    }

    void finishInstagramConnection();

    return () => {
      isMounted = false;
    };
  }, [socialActionPlatform, team.id]);

  async function persistSocialDraft(
    platform: SocialPlatform,
    options?: {
      connectionStatus?: SocialConnectionStatus;
      lastValidatedAt?: string | null;
      publishEventsEnabled?: boolean;
    },
  ) {
    const socialDraft = draft.socialAccounts[platform];

    const connection = await saveTeamSocialConnection(team.id, platform, {
      channelUrl: socialDraft.channelUrl,
      connectionStatus: options?.connectionStatus,
      handle: socialDraft.handle,
      lastValidatedAt: options?.lastValidatedAt,
      publishEventsEnabled: options?.publishEventsEnabled,
    });

    updateSocial(platform, mapConnectionToDraft(connection));
    return connection;
  }

  async function handleStartSocialConnection(platform: SocialPlatform) {
    const socialDraft = draft.socialAccounts[platform];

    if (!socialDraft.handle.trim() && !socialDraft.channelUrl.trim()) {
      setFeedbackMessage(`Preencha ao menos o handle ou a URL de ${getSocialPlatformLabel(platform)} antes de conectar.`);
      return;
    }

    setSocialActionPlatform(platform);

    try {
      await persistSocialDraft(platform);

      if (platform !== 'INSTAGRAM') {
        setFeedbackMessage(`A conexão oficial de ${getSocialPlatformLabel(platform)} ainda não foi implementada. Só o Instagram entrou neste primeiro passo.`);
        return;
      }

      const startResult = await startInstagramConnection(team.id);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.assign(startResult.authorizationUrl);
        return;
      }

      await Linking.openURL(startResult.authorizationUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Não foi possível iniciar a conexão de ${getSocialPlatformLabel(platform)}.`;
      setFeedbackMessage(message);
    } finally {
      setSocialActionPlatform(null);
    }
  }

  async function handleValidateSocialConnection(platform: SocialPlatform) {
    const socialDraft = draft.socialAccounts[platform];
    const hasPublicReference = socialDraft.handle.trim().length > 0 || socialDraft.channelUrl.trim().length > 0;

    if (!hasPublicReference) {
      updateSocial(platform, { status: 'ERROR' });
      setFeedbackMessage(`Informe um handle ou URL pública para validar ${getSocialPlatformLabel(platform)}.`);
      return;
    }

    setSocialActionPlatform(platform);

    try {
      if (platform !== 'INSTAGRAM') {
        setFeedbackMessage(`A validação oficial ainda não foi implementada para ${getSocialPlatformLabel(platform)}.`);
        return;
      }

      if (socialDraft.status !== 'CONNECTED') {
        await persistSocialDraft(platform, {
          connectionStatus: 'PENDING',
          publishEventsEnabled: false,
        });
        setFeedbackMessage(`${getSocialPlatformLabel(platform)} ainda não pode ser validado porque a autorização oficial não foi concluída.`);
        return;
      }

      const result = await validateInstagramConnection(team.id);
      updateSocial(platform, mapConnectionToDraftFromApi(result.connection));
      setFeedbackMessage(`${getSocialPlatformLabel(platform)} revalidado com sucesso.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Não foi possível validar ${getSocialPlatformLabel(platform)}.`;
      setFeedbackMessage(message);
    } finally {
      setSocialActionPlatform(null);
    }
  }

  async function handleDisconnectSocialConnection(platform: SocialPlatform) {
    setSocialActionPlatform(platform);

    try {
      const connection = await disconnectTeamSocialConnection(team.id, platform);
      updateSocial(platform, mapConnectionToDraft(connection));
      setFeedbackMessage(`Conexão de ${getSocialPlatformLabel(platform)} desconectada com sucesso.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Não foi possível desconectar ${getSocialPlatformLabel(platform)}.`;
      setFeedbackMessage(message);
    } finally {
      setSocialActionPlatform(null);
    }
  }

  async function handleToggleSocialPublish(platform: SocialPlatform, value: boolean) {
    const socialDraft = draft.socialAccounts[platform];

    if (value && socialDraft.status !== 'CONNECTED') {
      setFeedbackMessage(`Conecte e valide ${getSocialPlatformLabel(platform)} antes de liberar publicações automáticas.`);
      return;
    }

    setSocialActionPlatform(platform);

    try {
      const connection = await saveTeamSocialConnection(team.id, platform, {
        channelUrl: socialDraft.channelUrl,
        handle: socialDraft.handle,
        publishEventsEnabled: value,
      });
      updateSocial(platform, mapConnectionToDraft(connection));
      setFeedbackMessage(
        value
          ? `Publicação automática ativada para ${getSocialPlatformLabel(platform)}.`
          : `Publicação automática desativada para ${getSocialPlatformLabel(platform)}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : `Não foi possível atualizar a publicação automática de ${getSocialPlatformLabel(platform)}.`;
      setFeedbackMessage(message);
    } finally {
      setSocialActionPlatform(null);
    }
  }

  function handleToggleModality(modality: SportModality) {
    setDraft((current) => {
      const isSelected = current.modalities.includes(modality);

      return {
        ...current,
        modalities: isSelected
          ? current.modalities.filter((item) => item !== modality)
          : [...current.modalities, modality],
      };
    });
  }

  function handleOpenNewVenueModal() {
    setVenueDraft(buildEmptyVenueDraft());
    setIsVenueModalOpen(true);
  }

  function handleOpenEditVenueModal(venue: TeamVenue) {
    setVenueDraft(mapVenueToDraft(venue));
    setIsVenueModalOpen(true);
  }

  function updateVenueDraft<K extends keyof TeamVenueDraft>(key: K, value: TeamVenueDraft[K]) {
    setVenueDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSaveVenue() {
    setIsVenueSaving(true);
    setFeedbackMessage(null);

    try {
      const payload = buildVenuePayload(venueDraft);
      const savedVenue = venueDraft.id
        ? await updateTeamVenue(venueDraft.id, payload, team.primary_venue_id)
        : await createTeamVenue(team.id, payload, team.primary_venue_id);

      let savedTeam = team;

      if (!team.primary_venue_id) {
        savedTeam = await setTeamPrimaryVenue(team.id, savedVenue.id);
        onTeamSaved?.(savedTeam);
      }

      const venues = await fetchTeamVenues(team.id, savedTeam.primary_venue_id);
      setTeamVenues(venues);
      setIsVenueModalOpen(false);
      setVenueDraft(buildEmptyVenueDraft());
      setFeedbackMessage('Quadra salva com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel salvar a quadra agora.';
      setFeedbackMessage(message);
    } finally {
      setIsVenueSaving(false);
    }
  }

  async function handleSetPrimaryVenue(venueId: string) {
    setIsVenueSaving(true);
    setFeedbackMessage(null);

    try {
      const savedTeam = await setTeamPrimaryVenue(team.id, venueId);
      const venues = await fetchTeamVenues(team.id, savedTeam.primary_venue_id);
      setTeamVenues(venues);
      onTeamSaved?.(savedTeam);
      setFeedbackMessage('Quadra principal atualizada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel definir a quadra principal agora.';
      setFeedbackMessage(message);
    } finally {
      setIsVenueSaving(false);
    }
  }

  function handleDeleteVenue(venue: TeamVenue) {
    Alert.alert('Remover quadra', `Remover ${venue.name}?`, [
      { style: 'cancel', text: 'Cancelar' },
      {
        style: 'destructive',
        text: 'Remover',
        onPress: () => void confirmDeleteVenue(venue.id),
      },
    ]);
  }

  async function confirmDeleteVenue(venueId: string) {
    setIsVenueSaving(true);
    setFeedbackMessage(null);

    try {
      const savedTeam = await deleteTeamVenue(team.id, venueId);
      const venues = await fetchTeamVenues(team.id, savedTeam.primary_venue_id);
      setTeamVenues(venues);
      onTeamSaved?.(savedTeam);
      setFeedbackMessage('Quadra removida.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel remover a quadra agora.';
      setFeedbackMessage(message);
    } finally {
      setIsVenueSaving(false);
    }
  }

  function handleEditCrest() {
    if (Platform.OS === 'web') {
      setIsCrestSourceModalOpen(true);
      return;
    }

    Alert.alert('Alterar escudo', 'Escolha como deseja enviar a imagem do time.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Fazer upload', onPress: () => void handlePickCrestFromLibrary() },
      { text: 'Usar câmera', onPress: () => void handlePickCrestFromCamera() },
    ]);
  }

  async function handlePickCrestFromLibrary() {
    setIsCrestSourceModalOpen(false);
    setFeedbackMessage(null);

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setFeedbackMessage('Permissão para a galeria não foi concedida.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    await handleTemporaryCrestUpload(result.assets[0], 'gallery');
  }

  async function handlePickCrestFromCamera() {
    setIsCrestSourceModalOpen(false);
    setFeedbackMessage(null);

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      setFeedbackMessage('Permissão para a câmera não foi concedida.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      cameraType: ImagePicker.CameraType.back,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    await handleTemporaryCrestUpload(result.assets[0], 'camera');
  }

  async function handleTemporaryCrestUpload(asset: ImagePicker.ImagePickerAsset, source: 'camera' | 'gallery') {
    if (!asset.base64 || !asset.mimeType) {
      setFeedbackMessage('Não foi possível preparar a imagem do escudo.');
      return;
    }

    setIsCrestUploading(true);

    try {
      const dataUrl = `data:${asset.mimeType};base64,${asset.base64}`;
      const byteSize = typeof asset.fileSize === 'number' ? asset.fileSize : Math.ceil((asset.base64.length * 3) / 4);

      const uploadResult = await createTemporaryImageUpload({
        byteSize,
        dataUrl,
        domain: 'TEAMS',
        metadata: {
          assetHeight: asset.height,
          assetName: asset.fileName ?? null,
          assetWidth: asset.width,
          source,
        },
        mimeType: asset.mimeType,
        purpose: 'TEAM_CREST',
      });

      setCrestPreviewUrl(uploadResult.publicUrl);
      updateDraft('crestUploadToken', uploadResult.uploadToken);
      setFeedbackMessage('Escudo atualizado localmente. Falta conectar o salvamento final.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possivel enviar o escudo agora.';
      setFeedbackMessage(message);
    } finally {
      setIsCrestUploading(false);
    }
  }

  function handleOpenOfficialColorPicker(colorKey: TeamColorKey) {
    setActiveColorTarget({ field: colorKey, scope: 'official' });
    setColorDraftValue(draft[colorKey] || '');
  }

  function handleOpenThemeTokenPicker(tokenKey: ThemeTokenKey) {
    setActiveColorTarget({ field: tokenKey, scope: 'theme' });
    setColorDraftValue(themeEditorDraft[tokenKey] || '');
  }

  function handleOpenThemeEditor() {
    setThemeEditorDraft(buildThemeEditorDraft(experienceTheme));
    setIsThemeEditorOpen(true);
  }

  function handleSelectColor(candidate: string) {
    setColorDraftValue(candidate === NO_COLOR_VALUE ? '' : candidate);
  }

  function handleApplyColor() {
    if (!activeColorTarget) {
      return;
    }

    const normalized = normalizeHexColor(colorDraftValue);
    if (!normalized && colorDraftValue.trim()) {
      setFeedbackMessage('Informe uma cor hexadecimal válida, como #F2AD24.');
      return;
    }

    if (activeColorTarget.scope === 'official') {
      updateDraft(activeColorTarget.field, normalized ?? '');
    } else {
      setThemeEditorDraft((current) => ({
        ...current,
        [activeColorTarget.field]: normalized ?? '',
      }));
    }
    setFeedbackMessage(null);
    setActiveColorTarget(null);
  }

  function handleResetThemeEditor() {
    setThemeEditorDraft(buildThemeEditorDraft(appExperienceTheme));
    setFeedbackMessage('Preview do tema restaurado para o padrão do app. Use aplicar para refletir na tela.');
  }

  async function persistThemeDraft(nextDraft: ThemeEditorDraft) {
    const nextOverrides = buildThemeOverrides(nextDraft, appExperienceTheme);
    const persistedTheme = await saveTeamThemeOverrides(team.id, nextOverrides);
    const resolvedPersistedTheme = resolveExperienceTheme({
      context: 'team',
      preferredThemeKey,
      teamOverrides: persistedTheme,
    }).theme;

    setAppliedThemeDraft(buildThemeEditorDraft(resolvedPersistedTheme));
    onThemeOverridesChange?.(persistedTheme);
    return persistedTheme;
  }

  async function handleApplyThemeEditor() {
    const nextOverrides = buildThemeOverrides(themeEditorDraft, appExperienceTheme);
    setAppliedThemeDraft({ ...themeEditorDraft });
    onThemeOverridesChange?.(nextOverrides);
    setIsSavingSettings(true);

    try {
      await persistThemeDraft(themeEditorDraft);
      setIsThemeEditorOpen(false);
      setFeedbackMessage('Tema do time salvo com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o tema do time agora.';
      setFeedbackMessage(message);
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleSaveSettings() {
    setIsSavingSettings(true);
    setFeedbackMessage(null);

    try {
      const nextThemeOverrides = buildThemeOverrides(appliedThemeDraft, appExperienceTheme);
      const savedTeam = await saveTeamSettings(team.id, {
        commentsEnabled: draft.commentsEnabled,
        defaultPublishTeamEvents: draft.defaultPublishTeamEvents,
        firstColor: draft.firstColor,
        modalities: draft.modalities,
        name: draft.name,
        publicFeedEnabled: draft.publicFeedEnabled,
        reactionsEnabled: draft.reactionsEnabled,
        secondColor: draft.secondColor,
        themeOverrides: nextThemeOverrides,
        thirdColor: draft.thirdColor,
      });

      setDraft(buildInitialDraft(savedTeam));
      setCrestPreviewUrl(savedTeam.crest_url);
      onTeamSaved?.(savedTeam);
      onThemeOverridesChange?.(savedTeam.theme ?? null);
      setFeedbackMessage('Configuracoes do time salvas com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel salvar as configuracoes do time agora.';
      setFeedbackMessage(message);
    } finally {
      setIsSavingSettings(false);
    }

    return;

    Alert.alert(
      'Salvar configurações',
      'A tela ja esta pronta visualmente, mas a persistência dessa configuração ainda nâo foi conectada no backend.',
    );
  }

  async function handlePersistThemeSettings() {
    setIsSavingSettings(true);

    try {
      await persistThemeDraft(appliedThemeDraft);
      setFeedbackMessage('Tema do time salvo com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o tema do time agora.';
      setFeedbackMessage(message);
    } finally {
      setIsSavingSettings(false);
    }
  }

  return (
    <ThemedTextureBackground baseColor={experienceTheme.surfaceBase} mode={experienceAppearance.mode}>
      <View className="flex-1 bg-transparent" {...hookProps('team-settings-container-main')}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={isCompact ? 'px-4 pb-10 pt-3' : 'px-4 pb-10 pt-4'}
          showsVerticalScrollIndicator={false}
          {...hookProps('team-settings-container-scroll')}
        >
          <View className="w-full self-center gap-4" style={{ maxWidth: shellWidth }} {...hookProps('team-settings-container-shell')}>
          <View className="min-h-[42px] flex-row items-center justify-between" {...hookProps('team-settings-container-header')}>
            <BackCircleButton onPress={onBack} theme={experienceTheme} {...hookProps('team-settings-button-back')} />
            <Text className="font-slab text-[1.5rem] leading-7" style={{ color: experienceTheme.accentPrimary }} {...hookProps('team-settings-text-title')}>
              Configurações do time
            </Text>
            <View className="h-[42px] w-[42px]" />
          </View>

          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-identity')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Identidade do time</Text>

            <ImagePreviewCard
              imageUri={crestPreviewUrl}
              isUploading={isCrestUploading}
              onEdit={handleEditCrest}
              theme={experienceTheme}
              title="Toque para trocar ou reposicionar o escudo"
            />

            <SettingsField
              hookId="team-settings-field-name"
              label="Nome oficial do time"
              placeholder="Ex.: Old'Dog Futebol Clube"
              value={draft.name}
              onChangeText={(value) => updateDraft('name', value)}
              theme={experienceTheme}
            />

            <SettingsField
              hookId="team-settings-field-display-name"
              label="Nome de exibição"
              placeholder="Ex.: Old'Dog F C"
              value={draft.displayName}
              onChangeText={(value) => updateDraft('displayName', value)}
              theme={experienceTheme}
            />
          </View>

          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-official-colors')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Cores do time</Text>
            <Text className="text-base leading-6" style={{ color: experienceTheme.textMuted }}>
              Defina as cores oficiais do time. A ordem aqui representa a identidade do clube.
            </Text>

            <View className="flex-row gap-3" {...hookProps('team-settings-container-official-swatches')}>
              <ColorPreview theme={experienceTheme} value={draft.firstColor} onPress={() => handleOpenOfficialColorPicker('firstColor')} />
              <ColorPreview theme={experienceTheme} value={draft.secondColor} onPress={() => handleOpenOfficialColorPicker('secondColor')} />
              <ColorPreview theme={experienceTheme} value={draft.thirdColor} onPress={() => handleOpenOfficialColorPicker('thirdColor')} />
            </View>

            <SettingsField
              hookId="team-settings-field-first-color"
              label="Primeira cor"
              placeholder="#F2AD24"
              value={draft.firstColor}
              onChangeText={(value) => updateDraft('firstColor', value)}
              theme={experienceTheme}
            />
            <SettingsField
              hookId="team-settings-field-second-color"
              label="Segunda cor"
              placeholder="#181818"
              value={draft.secondColor}
              onChangeText={(value) => updateDraft('secondColor', value)}
              theme={experienceTheme}
            />
            <SettingsField
              hookId="team-settings-field-third-color"
              label="Terceira cor"
              placeholder="#8E8E8E"
              value={draft.thirdColor}
              onChangeText={(value) => updateDraft('thirdColor', value)}
              theme={experienceTheme}
            />
          </View>

          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-layout-colors')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Cores de tema</Text>
            <Text className="text-base leading-6" style={{ color: experienceTheme.textMuted }}>
              Personalize o tema do time e configure fundo, cards, bordas e textos com preview vivo.
            </Text>

            <Pressable
              accessibilityRole="button"
              className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]"
              onPress={handleOpenThemeEditor}
              style={{ backgroundColor: experienceTheme.accentPrimary }}
              {...hookProps('team-settings-button-open-theme-editor')}
            >
              <Text className="text-[1.2rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>
                Configurar tema do time
              </Text>
            </Pressable>
          </View>

          <>
          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-modalities')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Modalidades</Text>
            <View className="flex-row flex-wrap gap-[10px]">
              {MODALITY_OPTIONS.map((modality) => {
                const isSelected = draft.modalities.includes(modality);
                return (
                  <Pressable
                    accessibilityRole="button"
                    className="rounded-full border px-[14px] py-[10px]"
                    style={{
                      backgroundColor: isSelected ? experienceTheme.accentPrimary : experienceTheme.surfaceBase,
                      borderColor: isSelected ? experienceTheme.accentPrimary : experienceTheme.borderDefault,
                    }}
                    key={modality}
                    onPress={() => handleToggleModality(modality)}
                    {...hookProps(`team-settings-chip-modality-${modality.toLowerCase()}`)}
                  >
                    <Text className="text-base font-bold leading-6" style={{ color: isSelected ? experienceTheme.accentOnPrimary : experienceTheme.textPrimary }}>
                      {getModalityLabel(modality)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-4 rounded-3xl p-4" 
            style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} 
            {...hookProps('team-settings-card-venues')}
          >
            <View className="flex-row  justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Quadras do time</Text>
                <Text className="mt-1 text-base leading-6" style={{ color: experienceTheme.textMuted }}>
                  Cadastre as quadras usadas pelo time e escolha uma como principal.
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                className="h-[42px] min-w-[42px] flex items-center justify-center rounded-full"
                disabled={isVenueSaving}
                onPress={handleOpenNewVenueModal}
                style={{ backgroundColor: experienceTheme.accentPrimary }}
                {...hookProps('team-settings-button-add-venue')}
              >
                <Text className="text-[1.5rem] font-bold mt-[-7px]" style={{ color: experienceTheme.accentOnPrimary }}>+</Text>
              </Pressable>
            </View>

            {isVenuesLoading ? (
              <Text className="text-base leading-6" style={{ color: experienceTheme.textMuted }}>Carregando quadras...</Text>
            ) : teamVenues.length ? (
              <View className="gap-3">
                {teamVenues.map((venue) => (
                  <View
                    key={venue.id}
                    className="rounded-[20px] border p-3"
                    style={{ backgroundColor: experienceTheme.surfaceBase, borderColor: venue.is_primary ? experienceTheme.accentPrimary : experienceTheme.borderDefault }}
                    {...hookProps(`team-settings-venue-${venue.id}`)}
                  >
                    <View className="flex-row flex-wrap items-start justify-between gap-3">
                      <View className="min-w-0 flex-1">
                        <View className="flex-row flex-wrap items-center gap-2">
                          <Text className="text-[1rem] font-bold leading-5" style={{ color: experienceTheme.textPrimary }}>{venue.name}</Text>
                          {venue.is_primary ? (
                            <View className="rounded-full px-2 py-1" style={{ backgroundColor: `${experienceTheme.accentPrimary}22` }}>
                              <Text className="text-[0.75rem] font-bold leading-3" style={{ color: experienceTheme.accentPrimary }}>Principal</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="mt-1 text-[0.9rem] leading-5" style={{ color: experienceTheme.textMuted }}>{formatVenueAddress(venue)}</Text>
                      </View>

                      <View className=" flex-wrap justify-end gap-2">
                        {!venue.is_primary ? (
                          <VenueActionButton
                            disabled={isVenueSaving}
                            label="Definir principal"
                            onPress={() => void handleSetPrimaryVenue(venue.id)}
                            theme={experienceTheme}
                          />
                        ) : null}
                        <VenueActionButton
                          disabled={isVenueSaving}
                          label="Editar"
                          enabledIcon
                          iconType="edit"
                          onPress={() => handleOpenEditVenueModal(venue)}
                          theme={experienceTheme}
                        />
                        <VenueActionButton
                          destructive
                          disabled={isVenueSaving}
                          label="Remover"
                          enabledIcon
                          iconType="remove"
                          onPress={() => handleDeleteVenue(venue)}
                          theme={experienceTheme}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-base leading-6" style={{ color: experienceTheme.textMuted }}>Nenhuma quadra cadastrada ainda.</Text>
            )}

            {/*<Pressable
              accessibilityRole="button"
              className="min-h-[48px] items-center justify-center rounded-[16px] px-4"
              disabled={isVenueSaving}
              onPress={handleOpenNewVenueModal}
              style={{ backgroundColor: experienceTheme.surfaceBase, borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}
              {...hookProps('team-settings-button-add-venue-secondary')}
            >
              <Text className="text-base font-bold leading-6" style={{ color: experienceTheme.accentPrimary }}>Adicionar quadra</Text>
            </Pressable>*/}
          </View>

          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-community')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Comentários e reações</Text>
            <ToggleRow
              hookId="team-settings-toggle-comments"
              label="Permitir comentários"
              value={draft.commentsEnabled}
              onValueChange={(value) => updateDraft('commentsEnabled', value)}
              theme={experienceTheme}
            />
            <ToggleRow
              hookId="team-settings-toggle-reactions"
              label="Permitir reações"
              value={draft.reactionsEnabled}
              onValueChange={(value) => updateDraft('reactionsEnabled', value)}
              theme={experienceTheme}
            />
          </View>

          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-public-feed')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Feed público do time</Text>
            <ToggleRow
              hookId="team-settings-toggle-public-feed"
              label="Permitir feed público"
              value={draft.publicFeedEnabled}
              onValueChange={(value) => updateDraft('publicFeedEnabled', value)}
              theme={experienceTheme}
            />
          </View>

          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-social-connections')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Redes sociais conectadas</Text>
            {isSocialConnectionsLoading ? (
              <Text className="text-base leading-6" style={{ color: experienceTheme.textMuted }}>
                Carregando conexoes salvas...
              </Text>
            ) : null}
            {SOCIAL_PLATFORMS.map((item) => {
              const socialDraft = draft.socialAccounts[item.platform];
              return (
                <View className="gap-3 rounded-[20px] p-4" style={{ backgroundColor: experienceTheme.surfaceBase, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} key={item.platform} {...hookProps(`team-settings-card-social-${item.platform.toLowerCase()}`)}>
                  <View className="flex-row items-center gap-3">
                    <Ionicons color={experienceTheme.accentPrimary} name={item.icon} size={18} />
                    <Text className="font-slab text-[20px] leading-6" style={{ color: experienceTheme.accentPrimary }}>{item.label}</Text>
                  </View>
                  <SettingsField
                    hookId={`team-settings-field-social-handle-${item.platform.toLowerCase()}`}
                    label="Handle ou URL pública"
                    labelFont="system"
                    labelTone="primary"
                    placeholder={`Ex.: @seu${item.label.toLowerCase()}`}
                    value={socialDraft.handle}
                    onChangeText={(value) => updateSocial(item.platform, { handle: value })}
                    theme={experienceTheme}
                  />
                  <SettingsField
                    hookId={`team-settings-field-social-url-${item.platform.toLowerCase()}`}
                    label="URL pública"
                    labelFont="system"
                    labelTone="muted"
                    placeholder="https://..."
                    value={socialDraft.channelUrl}
                    onChangeText={(value) => updateSocial(item.platform, { channelUrl: value })}
                    theme={experienceTheme}
                  />
                  <View className=" gap-3">
                    <Text className="text-sm leading-5" style={{ color: experienceTheme.textMuted }}>
                      Status da conexão
                    </Text>
                    <View className="rounded-full px-3 py-2" style={{ borderColor: getSocialStatusColor(socialDraft.status, experienceTheme), borderWidth: 1 }}>
                      <Text className="text-[13px] leading-[18px]" style={{ color: getSocialStatusColor(socialDraft.status, experienceTheme) }}>
                        {getSocialStatusLabel(socialDraft.status)}
                      </Text>
                    </View>
                    {socialDraft.lastValidatedAt ? (
                      <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textMuted }}>
                        Última validação: {formatValidationDate(socialDraft.lastValidatedAt)}
                      </Text>
                    ) : null}
                    {socialActionPlatform === item.platform ? (
                      <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textMuted }}>
                        Sincronizando com o banco...
                      </Text>
                    ) : null}
                    <View className="flex-row flex-wrap gap-2">
                      <SmallActionButton
                        hookId={`team-settings-button-social-connect-${item.platform.toLowerCase()}`}
                        label={socialDraft.status === 'CONNECTED' ? 'Reconectar conta' : 'Conectar conta'}
                        onPress={() => handleStartSocialConnection(item.platform)}
                        theme={experienceTheme}
                        variant="primary"
                      />
                      <SmallActionButton
                        hookId={`team-settings-button-social-validate-${item.platform.toLowerCase()}`}
                        label="Validar conexão"
                        onPress={() => handleValidateSocialConnection(item.platform)}
                        theme={experienceTheme}
                        variant="secondary"
                      />
                      <SmallActionButton
                        hookId={`team-settings-button-social-disconnect-${item.platform.toLowerCase()}`}
                        label="Desconectar"
                        onPress={() => handleDisconnectSocialConnection(item.platform)}
                        theme={experienceTheme}
                        variant="ghost"
                      />
                    </View>
                    <ToggleRow
                      compact
                      hookId={`team-settings-toggle-social-${item.platform.toLowerCase()}`}
                      label="Publicar eventos nesta rede"
                      value={socialDraft.publishEnabled}
                      onValueChange={(value) => handleToggleSocialPublish(item.platform, value)}
                      theme={experienceTheme}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-card-publish-default')}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Preferência de publicação</Text>
            <ToggleRow
              hookId="team-settings-toggle-default-publish-events"
              label="Sugerir publicação dos eventos do time"
              value={draft.defaultPublishTeamEvents}
              onValueChange={(value) => updateDraft('defaultPublishTeamEvents', value)}
              theme={experienceTheme}
            />
          </View>
          </>

          {feedbackMessage ? (
            <Text className="text-base leading-6" style={{ color: experienceTheme.textMuted }} {...hookProps('team-settings-text-feedback')}>
              {feedbackMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSavingSettings}
            className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]"
            onPress={handleSaveSettings}
            {...hookProps('team-settings-button-save')}
            style={{ backgroundColor: experienceTheme.accentPrimary }}
          >
            <Text className="text-[1.2rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>
              {isSavingSettings ? 'Salvando tema...' : 'Salvar alterações'}
            </Text>
          </Pressable>
          </View>
        </ScrollView>

        <Modal animationType="slide" visible={isThemeEditorOpen} transparent={false} onRequestClose={() => setIsThemeEditorOpen(false)}>
          <ThemedTextureBackground baseColor={themeEditorDraft.surfaceBase}>
            <View className="flex-1 bg-transparent" {...hookProps('team-settings-modal-theme-editor')}>
              <ScrollView
                className="flex-1"
                contentContainerClassName={isCompact ? 'px-4 pb-10 pt-3' : 'px-4 pb-10 pt-4'}
                showsVerticalScrollIndicator={false}
                {...hookProps('team-settings-modal-theme-editor-scroll')}
              >
                <View className="w-full self-center gap-4" style={{ maxWidth: shellWidth }} {...hookProps('team-settings-modal-theme-editor-shell')}>
                  <View className="min-h-[42px] flex-row items-center justify-between" {...hookProps('team-settings-modal-theme-editor-header')}>
                    <BackCircleButton onPress={() => setIsThemeEditorOpen(false)} theme={themeEditorDraft} {...hookProps('team-settings-button-close-theme-editor')} />
                    <Text className="font-slab text-[24px] leading-7" style={{ color: themeEditorDraft.accentPrimary }} {...hookProps('team-settings-modal-theme-editor-title')}>
                      Tema do time
                    </Text>
                    <View className="h-[42px] w-[42px]" />
                  </View>

                  <View className="gap-4 rounded-3xl p-4" style={{ backgroundColor: themeEditorDraft.surfaceCard, borderColor: themeEditorDraft.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-subscreen-theme-editor')}>
                    <Text className="text-base leading-6" style={{ color: themeEditorDraft.textMuted }}>
                      Ajuste todas as variáveis visuais e acompanhe o resultado no preview abaixo.
                    </Text>

                    <View className="h-[260px] overflow-hidden rounded-[24px]" style={{ borderColor: themeEditorDraft.borderDefault, borderWidth: 1 }} {...hookProps('team-settings-theme-preview')}>
                      <ThemedTextureBackground baseColor={themeEditorDraft.surfaceBase}>
                        <View className="flex-1 gap-3 p-4">
                          <View className="gap-2 rounded-[20px] p-4" style={{ backgroundColor: themeEditorDraft.surfaceCard, borderColor: themeEditorDraft.borderDefault, borderWidth: 1 }}>
                            <Text className="font-slab text-[24px] leading-7" style={{ color: themeEditorDraft.accentPrimary }}>
                              Preview do tema
                            </Text>
                            <Text className="text-base leading-6" style={{ color: themeEditorDraft.textPrimary }}>
                              Texto principal aplicado em um card comum.
                            </Text>
                            <Text className="text-sm leading-5" style={{ color: themeEditorDraft.textMuted }}>
                              Texto complementar para validar legibilidade e contraste.
                            </Text>
                          </View>

                          <View className="flex-row gap-3">
                            <View className="flex-1 rounded-[20px] p-4" style={{ backgroundColor: themeEditorDraft.accentPrimary, borderColor: themeEditorDraft.borderDefault, borderWidth: 1 }}>
                              <Text className="font-slab text-[20px] leading-6" style={{ color: themeEditorDraft.accentOnPrimary }}>
                                Destaque principal
                              </Text>
                              <Text className="mt-2 text-sm leading-5" style={{ color: themeEditorDraft.accentOnPrimary }}>
                                Card com cor principal e texto sobre destaque.
                              </Text>
                            </View>

                            <View className="w-[120px] justify-between rounded-[20px] p-4" style={{ backgroundColor: themeEditorDraft.surfaceCard, borderColor: themeEditorDraft.borderDefault, borderWidth: 1 }}>
                              <Text className="text-sm leading-5" style={{ color: themeEditorDraft.textMuted }}>
                                Borda
                              </Text>
                              <View className="h-10 rounded-[14px]" style={{ backgroundColor: themeEditorDraft.surfaceBase, borderColor: themeEditorDraft.borderDefault, borderWidth: 1 }} />
                            </View>
                          </View>
                        </View>
                      </ThemedTextureBackground>
                    </View>

                    <View className="gap-3" {...hookProps('team-settings-theme-token-list')}>
                      {THEME_TOKEN_SECTIONS.map((section) => (
                        <View className="gap-3" key={section.title}>
                          <Text className="font-slab text-[20px] leading-6" style={{ color: themeEditorDraft.accentPrimary }}>
                            {section.title}
                          </Text>
                          {section.items.map((item) => (
                            <ThemeTokenEditorRow
                              description={item.description}
                              hookId={`team-settings-theme-token-${item.key}`}
                              key={item.key}
                              label={item.label}
                              onPress={() => handleOpenThemeTokenPicker(item.key)}
                              theme={themeEditorDraft}
                              value={themeEditorDraft[item.key]}
                            />
                          ))}
                        </View>
                      ))}
                    </View>

                    <View className="flex-row flex-wrap gap-3" {...hookProps('team-settings-theme-editor-actions')}>
                      <Pressable
                        accessibilityRole="button"
                        className="min-h-[50px] flex-1 items-center justify-center rounded-[18px] px-4"
                        disabled={isSavingSettings}
                        onPress={handleResetThemeEditor}
                        style={{ borderColor: themeEditorDraft.borderDefault, borderWidth: 1 }}
                        {...hookProps('team-settings-button-reset-theme-editor')}
                      >
                        <Text className="text-base font-bold leading-6" style={{ color: themeEditorDraft.textPrimary }}>
                          Restaurar padrão
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        className="min-h-[50px] flex-1 items-center justify-center rounded-[18px] px-4"
                        disabled={isSavingSettings}
                        onPress={handleApplyThemeEditor}
                        style={{ backgroundColor: themeEditorDraft.accentPrimary }}
                        {...hookProps('team-settings-button-confirm-theme-editor')}
                      >
                        <Text className="text-base font-bold leading-6" style={{ color: themeEditorDraft.accentOnPrimary }}>
                          {isSavingSettings ? 'Salvando tema...' : 'Aplicar e voltar'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </ThemedTextureBackground>
        </Modal>

        <Modal animationType="fade" visible={activeColorTarget !== null} transparent onRequestClose={() => setActiveColorTarget(null)}>
        <View className="flex-1 items-center justify-center bg-black/75 px-4">
          <View className="w-full max-w-[340px] gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Escolha uma cor</Text>
            <View className="aspect-square overflow-hidden rounded-[18px]" style={{ borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}>
              {COLOR_SWATCH_ROWS.map((row, rowIndex) => (
                <View className="flex-1 flex-row" key={`row-${rowIndex}`}>
                  {row.map((color, columnIndex) => {
                    const isNoColor = color === NO_COLOR_VALUE;
                    const isSelected =
                      isNoColor ? colorDraftValue.trim() === '' : normalizeHexColor(colorDraftValue) === normalizeHexColor(color);

                    return (
                      <Pressable
                        accessibilityRole="button"
                        className="flex-1 items-center justify-center"
                        key={`${rowIndex}-${columnIndex}`}
                        onPress={() => handleSelectColor(color)}
                        style={{
                          borderColor: isSelected ? experienceTheme.accentPrimary : 'transparent',
                          borderWidth: isSelected ? 1 : 0,
                          backgroundColor: isNoColor ? '#FFFFFF' : color,
                        }}
                      >
                        {isNoColor ? <View className="h-[2px] w-8 -rotate-45 bg-[#D72638]" /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            <TextInput
              autoCapitalize="characters"
              className="min-h-[50px] rounded-[18px] px-4 text-base leading-6"
              onChangeText={setColorDraftValue}
              placeholder="#F2AD24"
              placeholderTextColor={experienceTheme.textMuted}
              style={{ backgroundColor: experienceTheme.surfaceBase, borderColor: experienceTheme.borderDefault, borderWidth: 1, color: experienceTheme.textPrimary }}
              value={colorDraftValue}
              {...hookProps('team-settings-input-color-picker')}
            />

            <Pressable className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]" onPress={handleApplyColor} style={{ backgroundColor: experienceTheme.accentPrimary }}>
              <Text className="text-[1.2rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>Aplicar cor</Text>
            </Pressable>
            <Pressable className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]" onPress={() => setActiveColorTarget(null)} style={{ borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}>
              <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.accentPrimary }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" visible={isCrestSourceModalOpen} transparent onRequestClose={() => setIsCrestSourceModalOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/75 px-4">
          <View className="w-full max-w-[340px] gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }}>
            <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>Alterar escudo</Text>
            <Text className="text-base leading-6" style={{ color: experienceTheme.textMuted }}>Escolha como deseja enviar a imagem do time.</Text>
            <Pressable className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]" onPress={() => void handlePickCrestFromLibrary()} style={{ backgroundColor: experienceTheme.accentPrimary }}>
              <Text className="text-[1.2rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>Fazer upload</Text>
            </Pressable>
            <Pressable className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]" onPress={() => void handlePickCrestFromCamera()} style={{ backgroundColor: experienceTheme.accentPrimary }}>
              <Text className="text-[1.2rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>Usar câmera</Text>
            </Pressable>
            <Pressable className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]" onPress={() => setIsCrestSourceModalOpen(false)} style={{ borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}>
              <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.accentPrimary }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" visible={isVenueModalOpen} transparent onRequestClose={() => setIsVenueModalOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/75 px-4">
          <View className="w-full max-w-[420px] gap-4 rounded-3xl p-4" style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="font-slab text-[24px] leading-7" style={{ color: experienceTheme.accentPrimary }}>
                  {venueDraft.id ? 'Editar quadra' : 'Adicionar quadra'}
                </Text>
                <Text className="mt-1 text-base leading-6" style={{ color: experienceTheme.textMuted }}>
                  Nome e localidade bastam para usar a quadra nos proximos fluxos.
                </Text>
              </View>
              <Pressable className="h-9 w-9 items-center justify-center rounded-full" onPress={() => setIsVenueModalOpen(false)}>
                <Text className="text-[1.1rem] font-bold" style={{ color: experienceTheme.textMuted }}>x</Text>
              </Pressable>
            </View>

            <SettingsField
              hookId="team-settings-venue-field-name"
              label="Nome da quadra"
              onChangeText={(value) => updateVenueDraft('name', value)}
              placeholder="Ex.: Arena Vila Matilde"
              theme={experienceTheme}
              value={venueDraft.name}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SettingsField
                  hookId="team-settings-venue-field-state"
                  label="Estado"
                  labelFont="system"
                  onChangeText={(value) => updateVenueDraft('regionState', value)}
                  placeholder="SP"
                  theme={experienceTheme}
                  value={venueDraft.regionState}
                />
              </View>
              <View className="flex-1">
                <SettingsField
                  hookId="team-settings-venue-field-city"
                  label="Cidade"
                  labelFont="system"
                  onChangeText={(value) => updateVenueDraft('regionCity', value)}
                  placeholder="Sao Paulo"
                  theme={experienceTheme}
                  value={venueDraft.regionCity}
                />
              </View>
            </View>
            <SettingsField
              hookId="team-settings-venue-field-zone"
              label="Regiao ou bairro"
              labelFont="system"
              onChangeText={(value) => updateVenueDraft('regionZone', value)}
              placeholder="Leste"
              theme={experienceTheme}
              value={venueDraft.regionZone}
            />
            <SettingsField
              hookId="team-settings-venue-field-address"
              label="Endereco"
              labelFont="system"
              onChangeText={(value) => updateVenueDraft('addressLine', value)}
              placeholder="Rua, avenida ou referencia"
              theme={experienceTheme}
              value={venueDraft.addressLine}
            />
            <View className="flex-row gap-3">
              <View className="w-[112px]">
                <SettingsField
                  hookId="team-settings-venue-field-number"
                  label="Numero"
                  labelFont="system"
                  onChangeText={(value) => updateVenueDraft('addressNumber', value)}
                  placeholder="123"
                  theme={experienceTheme}
                  value={venueDraft.addressNumber}
                />
              </View>
              <View className="flex-1">
                <SettingsField
                  hookId="team-settings-venue-field-postal-code"
                  label="CEP"
                  labelFont="system"
                  onChangeText={(value) => updateVenueDraft('postalCode', value)}
                  placeholder="00000-000"
                  theme={experienceTheme}
                  value={venueDraft.postalCode}
                />
              </View>
            </View>

            <Pressable className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]" disabled={isVenueSaving} onPress={() => void handleSaveVenue()} style={{ backgroundColor: experienceTheme.accentPrimary }}>
              <Text className="text-[1.2rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>{isVenueSaving ? 'Salvando...' : 'Salvar quadra'}</Text>
            </Pressable>
            <Pressable className="min-h-[54px] items-center justify-center rounded-[18px] px-[18px]" disabled={isVenueSaving} onPress={() => setIsVenueModalOpen(false)} style={{ borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}>
              <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.accentPrimary }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      </View>
    </ThemedTextureBackground>
  );
}

function SettingsField({
  hookId,
  label,
  labelFont = 'slab',
  labelTone = 'accent',
  onChangeText,
  placeholder,
  theme,
  value,
}: {
  hookId: string;
  label: string;
  labelFont?: 'slab' | 'system';
  labelTone?: 'accent' | 'muted' | 'primary';
  onChangeText: (value: string) => void;
  placeholder: string;
  theme: TeamExperienceTheme;
  value: string;
}) {
  return (
    <View className="gap-2" {...hookProps(`${hookId}-container`)}>
      <Text
        className={labelFont === 'system' ? 'text-[20px] leading-6' : 'font-slab text-[20px] leading-6'}
        style={{
          color:
            labelTone === 'muted'
              ? theme.textMuted
              : labelTone === 'primary'
                ? theme.textPrimary
                : theme.accentPrimary,
        }}
      >
        {label}
      </Text>
      <TextInput
        className="min-h-[50px] rounded-[18px] px-4 text-base leading-6"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={{ backgroundColor: theme.surfaceBase, borderColor: theme.borderDefault, borderWidth: 1, color: theme.textPrimary }}
        value={value}
        {...hookProps(hookId)}
      />
    </View>
  );
}

function ToggleRow({
  compact = false,
  hookId,
  label,
  onValueChange,
  theme,
  value,
}: {
  compact?: boolean;
  hookId: string;
  label: string;
  onValueChange: (value: boolean) => void;
  theme: TeamExperienceTheme;
  value: boolean;
}) {
  return (
    <View className={`flex-row items-center justify-between gap-3 ${compact ? '' : 'min-h-[44px]'}`} {...hookProps(hookId)}>
      <Text className={`${compact ? 'flex-1 text-[13px] leading-[18px]' : 'flex-1 text-base leading-6'}`} style={{ color: theme.textPrimary }}>{label}</Text>
      <ThemeToggle activeColor={theme.accentPrimary} inactiveColor={theme.borderDefault} onValueChange={onValueChange} value={value} />
    </View>
  );
}

function SmallActionButton({
  hookId,
  label,
  onPress,
  theme,
  variant,
}: {
  hookId: string;
  label: string;
  onPress: () => void;
  theme: TeamExperienceTheme;
  variant: 'ghost' | 'primary' | 'secondary';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[42px] items-center justify-center rounded-full px-3 py-2"
      onPress={onPress}
      style={{
        backgroundColor: variant === 'primary' ? theme.accentPrimary : variant === 'secondary' ? theme.surfaceCard : 'transparent',
        borderColor: variant === 'primary' ? theme.accentPrimary : theme.borderDefault,
        borderWidth: 1,
      }}
      {...hookProps(hookId)}
    >
      <Text
        className="text-[13px] font-bold leading-[18px]"
        style={{ color: variant === 'primary' ? theme.accentOnPrimary : theme.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function VenueActionButton({
  destructive = false,
  disabled = false,
  enabledIcon = false,
  iconType,
  label,
  onPress,
  theme,
}: {
  destructive?: boolean;
  disabled?: boolean;
  enabledIcon?: boolean;
  iconType?: 'edit' | 'remove' | React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  theme: TeamExperienceTheme;
}) {
  const color = destructive ? '#FF7B7B' : theme.accentPrimary;
  const iconName = getVenueActionIconName(iconType);

  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[36px] min-w-[36px] items-center justify-center rounded-full border px-2"
      disabled={disabled}
      onPress={onPress}
      style={{ borderColor: color, opacity: disabled ? 0.55 : 1 }}
    >
      {enabledIcon && iconName ? (
        <Ionicons color={color} name={iconName} size={20} classes="py-2" />
      ) : (
        <Text className="text-[0.85rem] font-bold leading-4" style={{ color }}>{label}</Text>
      )}
    </Pressable>
  );
}

function getVenueActionIconName(iconType?: 'edit' | 'remove' | React.ComponentProps<typeof Ionicons>['name']) {
  if (iconType === 'edit') {
    return 'create-outline';
  }

  if (iconType === 'remove') {
    return 'trash-outline';
  }

  return iconType;
}

function ColorPreview({
  onPress,
  theme,
  value,
}: {
  onPress: () => void;
  theme: TeamExperienceTheme;
  value: string;
}) {
  const normalized = normalizeHexColor(value);

  return (
    <Pressable
      accessibilityRole="button"
      className="h-12 w-12 items-center justify-center overflow-hidden rounded-[16px]"
      onPress={onPress}
      style={{ backgroundColor: normalized ?? theme.surfaceBase, borderColor: theme.borderDefault, borderWidth: 1 }}
    >
      {!normalized ? <View className="h-[3px] w-[72px] -rotate-45 bg-[#D72638]" /> : null}
    </Pressable>
  );
}

function LayoutColorSelect({
  hookId,
  label,
  onChange,
  options,
  theme,
  value,
}: {
  hookId: string;
  label: string;
  onChange: (value: LayoutColorSource) => void;
  options: Record<LayoutColorSource, string>;
  theme: TeamExperienceTheme;
  value: LayoutColorSource;
}) {
  return (
    <View className="gap-2" {...hookProps(hookId)}>
      <Text className="font-slab text-[20px] leading-6" style={{ color: theme.accentPrimary }}>{label}</Text>
      <View className="flex-row gap-3">
        {(['FIRST_COLOR', 'SECOND_COLOR', 'THIRD_COLOR'] as LayoutColorSource[]).map((option) => {
          const isSelected = option === value;
          return (
            <Pressable
              accessibilityRole="button"
              className="flex-1 rounded-[18px] p-3"
              key={option}
              onPress={() => onChange(option)}
              style={{
                backgroundColor: theme.surfaceBase,
                borderColor: isSelected ? theme.accentPrimary : theme.borderDefault,
                borderWidth: 1,
              }}
            >
              <View className="mb-2 h-7 rounded-[12px]" style={{ backgroundColor: options[option] }} />
              <Text className="text-center text-[13px] leading-[18px]" style={{ color: isSelected ? theme.accentPrimary : theme.textPrimary }}>
                {getColorSourceLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ThemeTokenEditorRow({
  description,
  hookId,
  label,
  onPress,
  theme,
  value,
}: {
  description: string;
  hookId: string;
  label: string;
  onPress: () => void;
  theme: ThemeEditorDraft;
  value: string;
}) {
  const normalized = normalizeHexColor(value);

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-[20px] p-4"
      onPress={onPress}
      style={{ backgroundColor: theme.surfaceBase, borderColor: theme.borderDefault, borderWidth: 1 }}
      {...hookProps(hookId)}
    >
      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-[16px]" style={{ backgroundColor: normalized ?? theme.surfaceCard, borderColor: theme.borderDefault, borderWidth: 1 }}>
        {!normalized ? <View className="h-[3px] w-[72px] -rotate-45 bg-[#D72638]" /> : null}
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-slab text-[20px] leading-6" style={{ color: theme.accentPrimary }}>
          {label}
        </Text>
        <Text className="text-sm leading-5" style={{ color: theme.textMuted }}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function buildInitialDraft(team: TeamSummary): TeamSettingsDraft {
  return {
    commentsEnabled: team.settings?.comments_enabled ?? true,
    crestUploadToken: '',
    defaultPublishTeamEvents: team.settings?.default_publish_team_events ?? false,
    displayName: createDisplayNameSuggestion(team.name),
    firstColor: team.colors.first_color ?? '',
    modalities: normalizeTeamModalities(team.modalities),
    name: team.name,
    primaryVenueLabel: team.primary_venue_id
      ? 'Quadra principal ja vinculada ao time. Edicao detalhada entra no proximo passo.'
      : 'Nenhuma quadra principal definida ainda.',
    publicFeedEnabled: team.settings?.public_feed_enabled ?? true,
    reactionsEnabled: team.settings?.reactions_enabled ?? true,
    secondColor: team.colors.second_color ?? '',
    socialAccounts: {
      INSTAGRAM: { channelUrl: '', handle: '', lastValidatedAt: null, publishEnabled: false, status: 'PENDING' },
      TIKTOK: { channelUrl: '', handle: '', lastValidatedAt: null, publishEnabled: false, status: 'PENDING' },
      YOUTUBE: { channelUrl: '', handle: '', lastValidatedAt: null, publishEnabled: false, status: 'PENDING' },
    },
    textAccentColorSource: 'FIRST_COLOR',
    textSupportColorSource: 'THIRD_COLOR',
    thirdColor: team.colors.third_color ?? '',
    uiBackgroundColorSource: 'SECOND_COLOR',
  };
}

function normalizeTeamModalities(modalities: Array<SportModality | string | null | undefined>): SportModality[] {
  const normalized = modalities
    .map((modality) => String(modality ?? '').trim().toUpperCase())
    .map((modality) => {
      if (modality === 'FUTSAL') {
        return 'FUTSAL';
      }

      if (modality === 'FIELD' || modality === 'CAMPO') {
        return 'FIELD';
      }

      if (modality === 'SOCIETY') {
        return 'SOCIETY';
      }

      return null;
    })
    .filter((modality): modality is SportModality => Boolean(modality));

  return Array.from(new Set(normalized));
}

function buildThemeEditorDraft(theme: TeamExperienceTheme): ThemeEditorDraft {
  return {
    accentOnPrimary: theme.accentOnPrimary,
    accentPrimary: theme.accentPrimary,
    borderDefault: theme.borderDefault,
    surfaceBase: theme.surfaceBase,
    surfaceCard: theme.surfaceCard,
    textMuted: theme.textMuted,
    textPrimary: theme.textPrimary,
  };
}

function buildThemeOverrides(draft: ThemeEditorDraft, baseTheme: TeamExperienceTheme): TeamExperienceThemeOverrides | null {
  const overrides: TeamExperienceThemeOverrides = {};

  if (normalizeHexColor(draft.accentOnPrimary) !== normalizeHexColor(baseTheme.accentOnPrimary)) {
    overrides.accentOnPrimary = draft.accentOnPrimary;
  }
  if (normalizeHexColor(draft.accentPrimary) !== normalizeHexColor(baseTheme.accentPrimary)) {
    overrides.accentPrimary = draft.accentPrimary;
  }
  if (normalizeHexColor(draft.borderDefault) !== normalizeHexColor(baseTheme.borderDefault)) {
    overrides.borderDefault = draft.borderDefault;
  }
  if (normalizeHexColor(draft.surfaceBase) !== normalizeHexColor(baseTheme.surfaceBase)) {
    overrides.surfaceBase = draft.surfaceBase;
  }
  if (normalizeHexColor(draft.surfaceCard) !== normalizeHexColor(baseTheme.surfaceCard)) {
    overrides.surfaceCard = draft.surfaceCard;
  }
  if (normalizeHexColor(draft.textMuted) !== normalizeHexColor(baseTheme.textMuted)) {
    overrides.textMuted = draft.textMuted;
  }
  if (normalizeHexColor(draft.textPrimary) !== normalizeHexColor(baseTheme.textPrimary)) {
    overrides.textPrimary = draft.textPrimary;
  }

  return Object.keys(overrides).length ? overrides : null;
}

function createDisplayNameSuggestion(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => (part.length <= 2 ? part.toUpperCase() : part))
    .join(' ');
}

function getModalityLabel(modality: SportModality) {
  if (modality === 'FIELD') {
    return 'Campo';
  }

  if (modality === 'SOCIETY') {
    return 'Society';
  }

  return 'Futsal';
}

function buildEmptyVenueDraft(): TeamVenueDraft {
  return {
    addressDistrict: '',
    addressLine: '',
    addressNumber: '',
    id: null,
    name: '',
    postalCode: '',
    regionCity: '',
    regionState: '',
    regionZone: '',
  };
}

function mapVenueToDraft(venue: TeamVenue): TeamVenueDraft {
  return {
    addressDistrict: venue.address_district ?? '',
    addressLine: venue.address_line ?? '',
    addressNumber: venue.address_number ?? '',
    id: venue.id,
    name: venue.name,
    postalCode: venue.postal_code ?? '',
    regionCity: venue.region_city ?? '',
    regionState: venue.region_state ?? '',
    regionZone: venue.region_zone ?? '',
  };
}

function buildVenuePayload(draft: TeamVenueDraft): SaveTeamVenuePayload {
  return {
    addressDistrict: draft.addressDistrict,
    addressLine: draft.addressLine,
    addressNumber: draft.addressNumber,
    name: draft.name,
    postalCode: draft.postalCode,
    regionCity: draft.regionCity,
    regionState: draft.regionState,
    regionZone: draft.regionZone,
  };
}

function formatVenueAddress(venue: TeamVenue) {
  const address = [venue.address_line, venue.address_number].filter(Boolean).join(', ');
  const location = [venue.region_zone, venue.region_city, venue.region_state].filter(Boolean).join(' - ');

  return [address, location].filter(Boolean).join(' | ') || 'Sem endereco detalhado';
}

function getColorSourceLabel(source: LayoutColorSource) {
  if (source === 'FIRST_COLOR') {
    return 'Primeira cor';
  }

  if (source === 'SECOND_COLOR') {
    return 'Segunda cor';
  }

  return 'Terceira cor';
}

function getSocialPlatformLabel(platform: SocialPlatform) {
  return SOCIAL_PLATFORMS.find((item) => item.platform === platform)?.label ?? platform;
}

function getSocialStatusLabel(status: SocialConnectionStatus) {
  if (status === 'CONNECTED') {
    return 'Conectada';
  }

  if (status === 'EXPIRED') {
    return 'Conexao expirada';
  }

  if (status === 'ERROR') {
    return 'Falha de validação';
  }

  if (status === 'REVOKED') {
    return 'Desconectada';
  }

  return 'Conexao pendente';
}

function getSocialStatusColor(status: SocialConnectionStatus, theme: TeamExperienceTheme) {
  if (status === 'CONNECTED') {
    return '#65B45E';
  }

  if (status === 'EXPIRED') {
    return '#F2AD24';
  }

  if (status === 'ERROR') {
    return '#D72638';
  }

  if (status === 'REVOKED') {
    return theme.textMuted;
  }

  return theme.accentPrimary;
}

function formatValidationDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'agora';
  }

  return parsed.toLocaleDateString('pt-BR');
}

function mergeSocialConnections(
  current: Record<SocialPlatform, SocialAccountDraft>,
  connections: TeamSocialConnection[],
) {
  const next = { ...current };

  for (const connection of connections) {
    next[connection.platform] = mapConnectionToDraft(connection);
  }

  return next;
}

function mapConnectionToDraft(connection: TeamSocialConnection): SocialAccountDraft {
  return {
    channelUrl: connection.channelUrl ?? '',
    handle: connection.handle ?? '',
    lastValidatedAt: connection.lastValidatedAt,
    publishEnabled: connection.publishEventsEnabled,
    status: connection.connectionStatus,
  };
}

function mapConnectionToDraftFromApi(connection: {
  channel_url: string | null;
  connection_status: SocialConnectionStatus;
  handle: string | null;
  last_validated_at: string | null;
  publish_events_enabled: boolean;
}): SocialAccountDraft {
  return {
    channelUrl: connection.channel_url ?? '',
    handle: connection.handle ?? '',
    lastValidatedAt: connection.last_validated_at,
    publishEnabled: connection.publish_events_enabled,
    status: connection.connection_status,
  };
}

function clearInstagramCallbackParams(url: URL) {
  if (typeof window === 'undefined') {
    return;
  }

  url.searchParams.delete('code');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');
  url.searchParams.delete('error_reason');
  url.searchParams.delete('state');
  window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim().toUpperCase();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#([0-9A-F]{6})$/.test(normalized) ? normalized : null;
}

function buildColorSwatchRows() {
  const columns = 10;
  const rowsCount = 10;
  const rows: string[][] = [];

  rows.push(Array.from({ length: columns }, (_, index) => (index === 0 ? NO_COLOR_VALUE : '#FFFFFF')));

  for (let rowIndex = 1; rowIndex < rowsCount; rowIndex += 1) {
    const progress = rowIndex / Math.max(rowsCount - 1, 1);
    const lightness = 100 - progress * 100;
    rows.push(
      Array.from({ length: columns }, (_, columnIndex) => {
        if (columnIndex === 0) {
          return hslToHex(0, 0, lightness);
        }

        const hue = ((columnIndex - 1) / Math.max(columns - 2, 1)) * 320;
        const saturation = 72;

        if (rowIndex === rowsCount - 1) {
          return '#000000';
        }

        const softenedLightness = Math.max(0, Math.min(100, lightness));
        return hslToHex(hue, saturation, softenedLightness);
      }),
    );
  }

  return rows;
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const h = hue / 60;
  const x = c * (1 - Math.abs((h % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (h >= 0 && h < 1) {
    red = c;
    green = x;
  } else if (h >= 1 && h < 2) {
    red = x;
    green = c;
  } else if (h >= 2 && h < 3) {
    green = c;
    blue = x;
  } else if (h >= 3 && h < 4) {
    green = x;
    blue = c;
  } else if (h >= 4 && h < 5) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  const m = l - c / 2;
  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}
