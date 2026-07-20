import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import logoBackground from '../../../assets/backgrounds/logo-background.png';
import { ImagePreviewCard } from '../../../components/media/ImagePreviewCard';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { StepNavigationContainer } from '../../../components/navigation/StepNavigationContainer';
import { components, typography } from '../../../theme';
import { defaultTheme } from '../../../theme/tokens';
import { createTemporaryImageUpload } from '../../media/services/temporaryUploadService';
import {
  createTeam,
  type CreatedTeamResult,
  type CreateTeamPayload,
  type HomeMatchCapability,
  type ModalityFrameCount,
  type SocialPlatform,
  type SportModality,
} from '../services/teamService';
import {
  fetchVenueDetails,
  searchVenuePredictions,
  type PlacePrediction,
} from '../services/googlePlacesService';

type CreateTeamWizardScreenProps = {
  onBack?: () => void;
  onCreated?: (result: CreatedTeamResult) => void;
};

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

type TeamColorKey = 'firstColor' | 'secondColor' | 'thirdColor';
type WizardDraft = {
  crestUploadToken: string;
  firstColor: string;
  foundedDay: string;
  foundedMonth: string;
  foundedYear: string;
  hasPrimaryVenue: boolean;
  instagramValue: string;
  modalityFrameCounts: Partial<Record<SportModality, ModalityFrameCount>>;
  modalities: SportModality[];
  name: string;
  primaryVenue: {
    addressDistrict: string;
    addressLine: string;
    addressNumber: string;
    name: string;
    postalCode: string;
    regionCity: string;
    regionState: string;
    regionZone: string;
  };
  regionCity: string;
  regionState: string;
  regionZone: string;
  secondColor: string;
  selectedSocialPlatform: SocialPlatform;
  thirdColor: string;
  tiktokValue: string;
  youtubeValue: string;
};

const TOTAL_STEPS = 5;
const MODALITY_OPTIONS: SportModality[] = ['FUTSAL', 'FIELD', 'SOCIETY'];
const SOCIAL_TABS: Array<{ label: string; platform: SocialPlatform }> = [
  { label: 'Instagram', platform: 'INSTAGRAM' },
  { label: 'TikTok', platform: 'TIKTOK' },
  { label: 'YouTube', platform: 'YOUTUBE' },
];
const NO_COLOR_VALUE = '__NO_COLOR__';
const COLOR_SWATCH_ROWS = buildColorSwatchRows();

const INITIAL_DRAFT: WizardDraft = {
  crestUploadToken: '',
  firstColor: '',
  foundedDay: '',
  foundedMonth: '',
  foundedYear: '',
  hasPrimaryVenue: false,
  instagramValue: '',
  modalityFrameCounts: {},
  modalities: [],
  name: '',
  primaryVenue: {
    addressDistrict: '',
    addressLine: '',
    addressNumber: '',
    name: '',
    postalCode: '',
    regionCity: '',
    regionState: '',
    regionZone: '',
  },
  regionCity: '',
  regionState: '',
  regionZone: '',
  secondColor: '',
  selectedSocialPlatform: 'INSTAGRAM',
  thirdColor: '',
  tiktokValue: '',
  youtubeValue: '',
};

export function CreateTeamWizardScreen({ onBack, onCreated }: CreateTeamWizardScreenProps) {
  const { height, width } = useWindowDimensions();
  const [crestPreviewUrl, setCrestPreviewUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<WizardDraft>(INITIAL_DRAFT);
  const [activeColorField, setActiveColorField] = useState<TeamColorKey | null>(null);
  const [colorDraftValue, setColorDraftValue] = useState('');
  const [isCrestSourceModalOpen, setIsCrestSourceModalOpen] = useState(false);
  const [isCrestUploading, setIsCrestUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrimaryVenueModalOpen, setIsPrimaryVenueModalOpen] = useState(false);
  const [isVenueDetailsLoading, setIsVenueDetailsLoading] = useState(false);
  const [isVenueSearchLoading, setIsVenueSearchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedVenueQuery, setSelectedVenueQuery] = useState<string | null>(null);
  const [venuePredictions, setVenuePredictions] = useState<PlacePrediction[]>([]);
  const [venueSearchMessage, setVenueSearchMessage] = useState<string | null>(null);

  const shellWidth = Math.min(width - 32, 600);
  const backgroundLogoWidth = Math.max(width * 1.26, 360);
  const backgroundLogoHeight = Math.min(height * 0.56, backgroundLogoWidth * 1.16);
  const socialValue = getSocialValue(draft, draft.selectedSocialPlatform);
  const primaryVenueSummary = useMemo(() => {
    if (!draft.primaryVenue.name.trim()) {
      return 'Nenhuma quadra principal definida ainda.';
    }

    const summaryParts = [
      draft.primaryVenue.name.trim(),
      [draft.primaryVenue.regionCity.trim(), draft.primaryVenue.regionState.trim()].filter(Boolean).join(' - '),
    ].filter(Boolean);

    return summaryParts.join(' • ');
  }, [draft.primaryVenue]);

  useEffect(() => {
    if (!isPrimaryVenueModalOpen) {
      setIsVenueSearchLoading(false);
      setVenuePredictions([]);
      setVenueSearchMessage(null);
      return;
    }

    const query = draft.primaryVenue.name.trim();
    if (query.length < 3 || query === selectedVenueQuery) {
      setIsVenueSearchLoading(false);
      setVenuePredictions([]);
      setVenueSearchMessage(null);
      return;
    }

    let isActive = true;
    const timeoutId = setTimeout(async () => {
      setIsVenueSearchLoading(true);
      setVenueSearchMessage(null);

      try {
        const predictions = await searchVenuePredictions(query);
        if (!isActive) {
          return;
        }

        setVenuePredictions(predictions);
        setVenueSearchMessage(predictions.length ? null : 'Nenhum local encontrado. Você pode preencher manualmente.');
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Não foi possível buscar locais agora.';
        setVenuePredictions([]);
        setVenueSearchMessage(message);
      } finally {
        if (isActive) {
          setIsVenueSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [draft.primaryVenue.name, isPrimaryVenueModalOpen, selectedVenueQuery]);

  function updateDraft<K extends keyof WizardDraft>(key: K, value: WizardDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updatePrimaryVenue<K extends keyof WizardDraft['primaryVenue']>(
    key: K,
    value: WizardDraft['primaryVenue'][K],
  ) {
    setDraft((current) => ({
      ...current,
      primaryVenue: {
        ...current.primaryVenue,
        [key]: value,
      },
    }));
  }

  function handleAdvanceStep() {
    setErrorMessage(null);

    if (step === 0 && !draft.name.trim()) {
      setErrorMessage('O nome do time é obrigatório.');
      return;
    }

    const foundationValidationError = getFoundationValidationError(draft);
    if (step === 2 && foundationValidationError) {
      setErrorMessage(foundationValidationError);
      return;
    }

    if (step < TOTAL_STEPS - 1) {
      setStep((current) => current + 1);
    }
  }

  function handleGoBack() {
    setErrorMessage(null);

    if (step === 0) {
      onBack?.();
      return;
    }

    setStep((current) => current - 1);
  }

  function handleToggleModality(modality: SportModality) {
    setDraft((current) => {
      const isSelected = current.modalities.includes(modality);
      const nextFrameCounts = { ...current.modalityFrameCounts };

      if (isSelected) {
        delete nextFrameCounts[modality];
      } else {
        nextFrameCounts[modality] = current.modalityFrameCounts[modality] ?? 1;
      }

      return {
        ...current,
        modalityFrameCounts: nextFrameCounts,
        modalities: isSelected
          ? current.modalities.filter((item) => item !== modality)
          : [...current.modalities, modality],
      };
    });
  }

  function handleSelectModalityFrameCount(modality: SportModality, frameCount: ModalityFrameCount) {
    setDraft((current) => {
      if (!current.modalities.includes(modality)) {
        return current;
      }

      return {
        ...current,
        modalityFrameCounts: {
          ...current.modalityFrameCounts,
          [modality]: frameCount,
        },
      };
    });
  }

  function handleChangeSocialValue(value: string) {
    setDraft((current) => {
      if (current.selectedSocialPlatform === 'INSTAGRAM') {
        return { ...current, instagramValue: value };
      }

      if (current.selectedSocialPlatform === 'TIKTOK') {
        return { ...current, tiktokValue: value };
      }

      return { ...current, youtubeValue: value };
    });
  }

  function handlePrimaryVenueToggle() {
    setDraft((current) => {
      const nextValue = !current.hasPrimaryVenue;

      return {
        ...current,
        hasPrimaryVenue: nextValue,
        primaryVenue: nextValue ? current.primaryVenue : INITIAL_DRAFT.primaryVenue,
      };
    });
  }

  async function handleSelectVenuePrediction(prediction: PlacePrediction) {
    setErrorMessage(null);
    setVenueSearchMessage(null);
    setIsVenueDetailsLoading(true);

    try {
      const venueDetails = await fetchVenueDetails(prediction.placeId);

      setDraft((current) => ({
        ...current,
        primaryVenue: {
          ...current.primaryVenue,
          addressDistrict: venueDetails.addressDistrict || current.primaryVenue.addressDistrict,
          addressLine: venueDetails.addressLine || current.primaryVenue.addressLine,
          addressNumber: venueDetails.addressNumber || current.primaryVenue.addressNumber,
          name: venueDetails.name || prediction.primaryText || current.primaryVenue.name,
          postalCode: venueDetails.postalCode || current.primaryVenue.postalCode,
          regionCity: venueDetails.regionCity || current.primaryVenue.regionCity,
          regionState: venueDetails.regionState || current.primaryVenue.regionState,
          regionZone: venueDetails.regionZone || current.primaryVenue.regionZone,
        },
      }));

      setSelectedVenueQuery(venueDetails.name || prediction.primaryText || prediction.description);
      setVenuePredictions([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível preencher a quadra automaticamente.';
      setVenueSearchMessage(message);
    } finally {
      setIsVenueDetailsLoading(false);
    }
  }

  function handleOpenColorPicker(field: TeamColorKey) {
    setActiveColorField(field);
    setColorDraftValue(draft[field] || NO_COLOR_VALUE);
  }

  function handleCloseColorPicker() {
    setActiveColorField(null);
    setColorDraftValue('');
  }

  function handleApplyColorSelection(nextColor?: string) {
    if (!activeColorField) {
      return;
    }

    const candidate = nextColor ?? colorDraftValue;
    if (candidate === NO_COLOR_VALUE) {
      updateDraft(activeColorField, '');
      setErrorMessage(null);
      handleCloseColorPicker();
      return;
    }

    const normalized = normalizeHexColor(candidate);
    if (!normalized) {
      setErrorMessage('Informe uma cor hexadecimal válida, como #F2AD24.');
      return;
    }

    updateDraft(activeColorField, normalized);
    setErrorMessage(null);
    handleCloseColorPicker();
  }

  function handleEditCrest() {
    if (Platform.OS === 'web') {
      setIsCrestSourceModalOpen(true);
      return;
    }

    Alert.alert('Adicionar escudo', 'Escolha como deseja enviar a imagem do time.', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Fazer upload',
        onPress: () => {
          void handlePickCrestFromLibrary();
        },
      },
      {
        text: 'Usar câmera',
        onPress: () => {
          void handlePickCrestFromCamera();
        },
      },
    ]);
  }

  async function handlePickCrestFromLibrary() {
    setIsCrestSourceModalOpen(false);
    setErrorMessage(null);

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setErrorMessage('Permissão para galeria não foi concedida.');
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
    setErrorMessage(null);

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      setErrorMessage('Permissão para câmera não foi concedida.');
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

  async function handleTemporaryCrestUpload(
    asset: ImagePicker.ImagePickerAsset,
    source: 'camera' | 'gallery',
  ) {
    if (!asset.base64 || !asset.mimeType) {
      setErrorMessage('Não foi possível preparar a imagem do escudo.');
      return;
    }

    setIsCrestUploading(true);

    try {
      const dataUrl = `data:${asset.mimeType};base64,${asset.base64}`;
      const byteSize =
        typeof asset.fileSize === 'number'
          ? asset.fileSize
          : Math.ceil((asset.base64.length * 3) / 4);

      const uploadResult = await createTemporaryImageUpload({
        byteSize,
        dataUrl,
        domain: 'TEAMS',
        metadata: {
          assetName: asset.fileName ?? null,
          assetWidth: asset.width,
          assetHeight: asset.height,
          source,
        },
        mimeType: asset.mimeType,
        purpose: 'TEAM_CREST',
      });

      setCrestPreviewUrl(uploadResult.publicUrl);
      updateDraft('crestUploadToken', uploadResult.uploadToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível enviar o escudo agora.';
      setErrorMessage(message);
    } finally {
      setIsCrestUploading(false);
    }
  }

  function handleSavePrimaryVenue() {
    setDraft((current) => ({
      ...current,
      regionState: current.regionState || current.primaryVenue.regionState,
      regionCity: current.regionCity || current.primaryVenue.regionCity,
      regionZone: current.regionZone || current.primaryVenue.regionZone,
    }));
    setIsPrimaryVenueModalOpen(false);
  }

  async function handleSubmit() {
    setErrorMessage(null);

    if (!draft.name.trim()) {
      setErrorMessage('O nome do time é obrigatório.');
      setStep(0);
      return;
    }

    const foundationValidationError = getFoundationValidationError(draft);
    if (foundationValidationError) {
      setErrorMessage(foundationValidationError);
      setStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const createdTeam = await createTeam(buildPayload(draft));
      onCreated?.(createdTeam);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar o time agora.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="flex-1" {...hookProps('create-team-container-main')}>
      <Image
        className="absolute z-0"
        resizeMode="contain"
        source={logoBackground}
        {...hookProps('create-team-image-background-logo')}
        style={[
          {
            height: backgroundLogoHeight,
            left: -(width * 0.4),
            top: -(backgroundLogoHeight * 0.1),
            width: backgroundLogoWidth,
          },
        ]}
      />

      <ScrollView className="flex-1" contentContainerClassName="grow items-center px-4 pb-8 pt-3" {...hookProps('create-team-container-scroll')}>
        <View className="z-[1] gap-[18px]" style={{ width: shellWidth }} {...hookProps('create-team-container-shell')}>
          <View className="min-h-[42px] flex-row items-center justify-between" {...hookProps('create-team-container-header')}>
            <BackCircleButton onPress={handleGoBack} {...hookProps('create-team-button-back')} />
            <Text className="font-slab text-[24px] leading-7 text-brand-gold" {...hookProps('create-team-text-title')}>Criar time</Text>
            <View className="h-[42px] w-[42px]" {...hookProps('create-team-header-spacer')} />
          </View>

          <StepNavigationContainer currentStep={step} totalSteps={TOTAL_STEPS}>
            <View className="gap-4 w-full" {...hookProps(`create-team-container-step-${step}`)}>
              {step === 0 && (
                <View className="gap-[14px]" {...hookProps('create-team-step-name')}>
                  <SectionTitle centered hookId="create-team-text-name-title" icon="shield-outline" title="Qual o nome do seu time?" />
                  <TextInput
                    autoCapitalize="words"
                    className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                    onChangeText={(value) => updateDraft('name', value)}
                    placeholder="Ex.: Vila Nova FC"
                    placeholderTextColor={defaultTheme.text.muted}
                    value={draft.name}
                    {...hookProps('create-team-input-name')}
                  />
                  <Text className="text-base leading-6 text-text-muted" {...hookProps('create-team-text-name-helper')}>
                    Digite o nome completo do time. Depois você escolhe como ele será exibido.
                  </Text>
                </View>
              )}

              {step === 1 && (
                <View className="gap-[14px]" {...hookProps('create-team-step-crest')}>
                  <Text className="text-center font-slab text-[24px] leading-7 text-brand-gold" {...hookProps('create-team-text-crest-title')}>Escolha o escudo do time</Text>
                  <View {...hookProps('create-team-card-crest-preview')}>
                    <ImagePreviewCard
                      imageUri={crestPreviewUrl}
                      isUploading={isCrestUploading}
                      onEdit={handleEditCrest}
                      title={crestPreviewUrl ? 'Escudo pronto para usar' : 'Escudo opcional'}
                    />
                  </View>
                </View>
              )}

              {step === 2 && (
                <View className="gap-[14px]" {...hookProps('create-team-step-identity')}>
                  <View className="gap-3" {...hookProps('create-team-container-foundation-and-colors')}>
                    <SectionTitle icon="calendar-outline" title="Data de fundação" />
                    <Text className="text-base leading-6 text-text-muted">
                      Preencha apenas o que você souber. O ano pode ser informado sozinho.
                    </Text>
                    <View className="flex-row gap-[10px]" {...hookProps('create-team-container-foundation-date')}>
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={(value) => updateDraft('foundedDay', sanitizeNumericInput(value, 2))}
                        onBlur={() => updateDraft('foundedDay', formatPartialDateSegment(draft.foundedDay))}
                        placeholder="Dia"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] w-[60px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.foundedDay}
                        {...hookProps('create-team-input-founded-day')}
                      />
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={(value) => updateDraft('foundedMonth', sanitizeNumericInput(value, 2))}
                        onBlur={() => updateDraft('foundedMonth', formatPartialDateSegment(draft.foundedMonth))}
                        placeholder="Mês"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] w-[100px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.foundedMonth}
                        {...hookProps('create-team-input-founded-month')}
                      />
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={4}
                        onChangeText={(value) => updateDraft('foundedYear', sanitizeNumericInput(value, 4))}
                        placeholder="Ano"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] w-[100px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.foundedYear}
                        {...hookProps('create-team-input-founded-year')}
                      />
                    </View>

                    <View className="h-2" />
                    <SectionTitle icon="color-palette-outline" title="Cores do time" />
                    <Text className="text-base leading-6 text-text-muted">
                      Escolha as cores principais do time para começar a formar a identidade visual.
                    </Text>
                    <View className="flex-row gap-3" {...hookProps('create-team-container-color-previews')}>
                      {renderColorPreview({
                        hookId: 'create-team-button-first-color-preview',
                        label: 'Primeira cor',
                        onPress: () => handleOpenColorPicker('firstColor'),
                        value: draft.firstColor,
                      })}
                      {renderColorPreview({
                        hookId: 'create-team-button-second-color-preview',
                        label: 'Segunda cor',
                        onPress: () => handleOpenColorPicker('secondColor'),
                        value: draft.secondColor,
                      })}
                      {renderColorPreview({
                        hookId: 'create-team-button-third-color-preview',
                        label: 'Terceira cor',
                        onPress: () => handleOpenColorPicker('thirdColor'),
                        value: draft.thirdColor,
                      })}
                    </View>
                    <TextInput
                      autoCapitalize="characters"
                      onChangeText={(value) => updateDraft('firstColor', normalizeHexColor(value) ?? value)}
                      placeholder="Primeira cor"
                      placeholderTextColor={defaultTheme.text.muted}
                      className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                      value={draft.firstColor}
                      {...hookProps('create-team-input-first-color')}
                    />
                    <TextInput
                      autoCapitalize="characters"
                      onChangeText={(value) => updateDraft('secondColor', normalizeHexColor(value) ?? value)}
                      placeholder="Segunda cor"
                      placeholderTextColor={defaultTheme.text.muted}
                      className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                      value={draft.secondColor}
                      {...hookProps('create-team-input-second-color')}
                    />
                    <TextInput
                      autoCapitalize="characters"
                      onChangeText={(value) => updateDraft('thirdColor', normalizeHexColor(value) ?? value)}
                      placeholder="Terceira cor"
                      placeholderTextColor={defaultTheme.text.muted}
                      className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                      value={draft.thirdColor}
                      {...hookProps('create-team-input-third-color')}
                    />
                  </View>
                </View>
              )}

              {step === 3 && (
                <View className="gap-[14px]" {...hookProps('create-team-step-modalities-location')}>
                  <View className="gap-3 mb-3" {...hookProps('create-team-container-modalities')}>
                    <SectionTitle hookId="create-team-text-modalities-title" icon="football-outline" title="Modalidades" />
                    <View className="flex-row flex-wrap items-start gap-[10px]" {...hookProps('create-team-container-modality-options')}>
                      {MODALITY_OPTIONS.map((modality) => {
                        const isSelected = draft.modalities.includes(modality);
                        const selectedFrameCount = draft.modalityFrameCounts[modality] ?? 1;

                        return (
                          <View className="flex-1 gap-2" key={modality} {...hookProps(`create-team-container-modality-${modality.toLowerCase()}`)}>
                            <Pressable
                              accessibilityRole="button"
                              className={`rounded-full border px-[14px] py-[10px] flex-1 ${isSelected ? 'border-brand-gold bg-brand-gold' : 'border-stroke-default bg-surface-muted'}`}
                              onPress={() => handleToggleModality(modality)}
                              {...hookProps(`create-team-button-modality-${modality.toLowerCase()}`)}
                            >
                              <Text className={`text-base font-bold leading-6 text-center ${isSelected ? 'text-[#17120A]' : 'text-white'}`} {...hookProps(`create-team-text-modality-${modality.toLowerCase()}`)}>
                                {getModalityLabel(modality)}
                              </Text>
                            </Pressable>
                            {isSelected ? (
                              <View className="gap-2" {...hookProps(`create-team-container-modality-${modality.toLowerCase()}-frame-count`)}>
                                <View className="flex-row" {...hookProps(`create-team-container-modality-${modality.toLowerCase()}-frame-count-options`)}>
                                  {([1, 2] as const).map((frameCount) => {
                                    const isFrameCountSelected = selectedFrameCount === frameCount;

                                    const frameCountShapeClass =
                                      frameCount === 1
                                        ? 'rounded-tl-[50px] rounded-bl-[50px]'
                                        : 'rounded-tr-[50px] rounded-br-[50px]';
                                    return (
                                      <Pressable
                                        accessibilityRole="button"
                                        className={`${frameCountShapeClass} border py-1 flex-1 ${
                                          isFrameCountSelected
                                            ? 'border-brand-gold bg-brand-gold'
                                            : 'border-stroke-default bg-surface-muted'
                                        }`}
                                        key={frameCount}
                                        onPress={() => handleSelectModalityFrameCount(modality, frameCount)}
                                        {...hookProps(`create-team-button-modality-${modality.toLowerCase()}-frame-count-${frameCount}`)}
                                      >
                                        <Text className={`text-base font-bold leading-6 text-center ${isFrameCountSelected ? 'text-[#17120A]' : 'text-white'}`} {...hookProps(`create-team-text-modality-${modality.toLowerCase()}-frame-count-${frameCount}`)}>
                                          {frameCount}
                                        </Text>
                                      </Pressable>
                                    );
                                  })}
                                </View>
                                <Text className="text-[12px] font-bold leading-4 text-center text-text-subdued" {...hookProps(`create-team-text-modality-${modality.toLowerCase()}-frame-count-label`)}>
                                  Quantidade de quadros
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  <View className="gap-3" {...hookProps('create-team-container-primary-venue')}>
                    <SectionTitle
                      hookId="create-team-text-primary-venue-title"
                      icon="location-outline"
                      rightSlot={
                        <Pressable
                          accessibilityRole="switch"
                          className={`h-[34px] w-[62px] justify-center rounded-full border px-1 ${draft.hasPrimaryVenue ? 'border-brand-gold bg-[#4D3D12]' : 'border-stroke-default bg-surface-muted'}`}
                          onPress={handlePrimaryVenueToggle}
                          {...hookProps('create-team-toggle-primary-venue')}
                        >
                          <View className={`h-6 w-6 rounded-full ${draft.hasPrimaryVenue ? 'translate-x-[28px] bg-brand-gold' : 'bg-text-muted'}`} {...hookProps('create-team-toggle-primary-venue-knob')} />
                        </Pressable>
                      }
                      title="Tem quadra principal?"
                    />

                    <Text className="text-base leading-6 text-text-subdued" {...hookProps('create-team-text-primary-venue-helper')}>
                      Isso ajuda a definir a capacidade de mando e pode pre-preencher a localidade.
                    </Text>

                    <Text style={styles.capabilityText} {...hookProps('create-team-text-home-capability')}>
                      Capacidade de mando: {getHomeCapabilityLabel(getHomeCapability(draft.hasPrimaryVenue))}
                    </Text>

                    {draft.hasPrimaryVenue && (
                      <View className="gap-3 rounded-[18px] border border-stroke-subtle bg-surface-muted p-[14px]" {...hookProps('create-team-card-primary-venue-summary')}>
                        <Text className="text-base font-bold leading-6 text-white" {...hookProps('create-team-text-primary-venue-summary')}>{primaryVenueSummary}</Text>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setIsPrimaryVenueModalOpen(true)}
                          className="min-h-[48px] items-center justify-center rounded-[16px] border border-brand-gold bg-surface-muted px-4"
                          {...hookProps('create-team-button-open-primary-venue-modal')}
                        >
                          <Text className="text-base font-bold leading-6 text-brand-gold" {...hookProps('create-team-text-open-primary-venue-modal')}>
                            {draft.primaryVenue.name.trim() ? 'Editar quadra principal' : 'Adicionar quadra principal'}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {!hasPrimaryVenueLocation(draft) && (
                    <View className="gap-3" {...hookProps('create-team-container-location')}>
                      <SectionTitle hookId="create-team-text-location-title" icon="map-outline" title="Localidade do time" />
                      <TextInput
                        autoCapitalize="words"
                        onChangeText={(value) => updateDraft('regionState', value)}
                        placeholder="Estado"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.regionState}
                        {...hookProps('create-team-input-region-state')}
                      />
                      <TextInput
                        autoCapitalize="words"
                        onChangeText={(value) => updateDraft('regionCity', value)}
                        placeholder="Cidade"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.regionCity}
                        {...hookProps('create-team-input-region-city')}
                      />
                      <TextInput
                        autoCapitalize="words"
                        onChangeText={(value) => updateDraft('regionZone', value)}
                        placeholder="Zona ou regi?o (opcional)"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.regionZone}
                        {...hookProps('create-team-input-region-zone')}
                      />
                    </View>
                  )}
                </View>
              )}

              {step === 4 && (
                <View className="gap-[14px]" {...hookProps('create-team-step-social')}>
                  <View className="gap-3" {...hookProps('create-team-container-social')}>
                    <SectionTitle hookId="create-team-text-social-title" icon="share-social-outline" title="Redes sociais" />
                    <Text className="text-base leading-6 text-text-subdued" {...hookProps('create-team-text-social-helper')}>
                      Conecte o perfil principal agora ou deixe para depois. Você pode informar @handle, nome do canal ou URL pública.
                    </Text>
                    <View className="flex-row gap-[10px]" {...hookProps('create-team-container-social-tabs')}>
                      {SOCIAL_TABS.map((tab) => {
                        const isActive = tab.platform === draft.selectedSocialPlatform;

                        return (
                          <Pressable
                            accessibilityRole="button"
                            className={`min-h-[68px] flex-1 items-center justify-center rounded-[14px] border px-2 py-[10px] ${isActive ? 'border-brand-gold bg-surface-muted' : 'border-stroke-default bg-surface-muted'}`}
                            key={tab.platform}
                            onPress={() => updateDraft('selectedSocialPlatform', tab.platform)}
                            {...hookProps(`create-team-button-social-${tab.platform.toLowerCase()}`)}
                          >
                            <View className="items-center justify-center gap-1.5" {...hookProps(`create-team-container-social-${tab.platform.toLowerCase()}`)}>
                              <Ionicons
                                color={isActive ? defaultTheme.text.accent : defaultTheme.text.subdued}
                                name={getSocialPlatformIcon(tab.platform)}
                                size={32}
                                {...hookProps(`create-team-icon-social-${tab.platform.toLowerCase()}`)}
                              />
                              <Text className={`text-base font-bold leading-6 ${isActive ? 'text-brand-gold' : 'text-text-subdued'}`} {...hookProps(`create-team-text-social-${tab.platform.toLowerCase()}`)}>{tab.label}</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>

                    <TextInput
                      autoCapitalize="none"
                      onChangeText={handleChangeSocialValue}
                      placeholder={`@handle ou URL do ${getSocialPlatformLabel(draft.selectedSocialPlatform)}`}
                      placeholderTextColor={defaultTheme.text.muted}
                      className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                      value={socialValue}
                      {...hookProps(`create-team-input-social-${draft.selectedSocialPlatform.toLowerCase()}`)}
                    />
                  </View>
                </View>
              )}

              {errorMessage && <Text className="text-center text-[13px] leading-[18px] text-[#FF7B7B]" {...hookProps('create-team-text-error')}>{errorMessage}</Text>}
              <View className="gap-3" {...hookProps('create-team-container-actions')}>
                {step < TOTAL_STEPS - 1 ? (
                  <>
                    <Pressable accessibilityRole="button" className="min-h-[54px] items-center justify-center rounded-[18px] bg-brand-gold px-[18px]" onPress={handleAdvanceStep} {...hookProps('create-team-button-continue')}>
                      <Text className="text-[19px] font-bold leading-6 text-[#1E1E1E]" {...hookProps('create-team-text-continue')}>Continuar</Text>
                    </Pressable>

                    {step > 0 && (
                      <Pressable accessibilityRole="button" onPress={handleAdvanceStep} style={styles.skipLinkButton} {...hookProps('create-team-button-skip')}>
                        <Text style={styles.skipLinkText} {...hookProps('create-team-text-skip')}>Pular</Text>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    onPress={handleSubmit}
                    className={`min-h-[54px] items-center justify-center rounded-[18px] bg-brand-gold px-[18px] ${isSubmitting ? 'opacity-65' : ''}`}
                    {...hookProps('create-team-button-submit')}
                  >
                    <Text className="text-[19px] font-bold leading-6 text-[#1E1E1E]" {...hookProps('create-team-text-submit')}>{isSubmitting ? 'Criando...' : 'Concluir'}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </StepNavigationContainer>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={isPrimaryVenueModalOpen}>
        <View style={styles.modalBackdrop} {...hookProps('create-team-modal-primary-venue-overlay')}>
          <View style={styles.modalCard} {...hookProps('create-team-modal-primary-venue-card')}>
            <Text style={styles.modalTitle} {...hookProps('create-team-modal-primary-venue-title')}>Quadra principal</Text>

            <ScrollView contentContainerStyle={styles.modalContent} {...hookProps('create-team-modal-primary-venue-scroll')}>
              <View style={styles.venueSearchFieldWrap} {...hookProps('create-team-modal-primary-venue-search-field')}>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={(value) => {
                    setSelectedVenueQuery(null);
                    updatePrimaryVenue('name', value);
                  }}
                  placeholder="Nome da quadra"
                  placeholderTextColor={defaultTheme.text.muted}
                  className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                  value={draft.primaryVenue.name}
                  {...hookProps('create-team-input-primary-venue-name')}
                />
                {(isVenueSearchLoading || isVenueDetailsLoading || venuePredictions.length > 0) && (
                  <View style={styles.venueSearchDropdown} {...hookProps('create-team-container-primary-venue-search-dropdown')}>
                    {isVenueSearchLoading ? <Text style={styles.helperTextSmall} {...hookProps('create-team-text-primary-venue-search-loading')}>Buscando locais...</Text> : null}
                    {isVenueDetailsLoading ? <Text style={styles.helperTextSmall} {...hookProps('create-team-text-primary-venue-details-loading')}>Preenchendo endere?o...</Text> : null}
                    {!isVenueSearchLoading && !isVenueDetailsLoading && venuePredictions.length > 0 ? (
                      <View style={styles.venuePredictionList} {...hookProps('create-team-container-primary-venue-predictions')}>
                        {venuePredictions.map((prediction, index) => (
                          <Pressable
                            accessibilityRole="button"
                            key={prediction.placeId}
                            onPress={() => void handleSelectVenuePrediction(prediction)}
                            {...hookProps(`create-team-button-primary-venue-prediction-${index}`)}
                            style={[
                              styles.venuePredictionItem,
                              index === venuePredictions.length - 1 && styles.venuePredictionItemLast,
                            ]}
                          >
                            <Text style={styles.venuePredictionTitle} {...hookProps(`create-team-text-primary-venue-prediction-title-${index}`)}>{prediction.primaryText}</Text>
                            {prediction.secondaryText ? (
                              <Text style={styles.venuePredictionSubtitle} {...hookProps(`create-team-text-primary-venue-prediction-subtitle-${index}`)}>{prediction.secondaryText}</Text>
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
              {venueSearchMessage ? <Text style={styles.helperTextSmall} {...hookProps('create-team-text-primary-venue-search-message')}>{venueSearchMessage}</Text> : null}
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('regionState', value)}
                placeholder="Estado"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.regionState}
                {...hookProps('create-team-input-primary-venue-region-state')}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('regionCity', value)}
                placeholder="Cidade"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.regionCity}
                {...hookProps('create-team-input-primary-venue-region-city')}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('regionZone', value)}
                placeholder="Zona ou regi?o"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.regionZone}
                {...hookProps('create-team-input-primary-venue-region-zone')}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('addressLine', value)}
                placeholder="Endere?o"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.addressLine}
                {...hookProps('create-team-input-primary-venue-address-line')}
              />
              <TextInput
                onChangeText={(value) => updatePrimaryVenue('addressNumber', value)}
                placeholder="N?mero"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.addressNumber}
                {...hookProps('create-team-input-primary-venue-address-number')}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('addressDistrict', value)}
                placeholder="Bairro"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.addressDistrict}
                {...hookProps('create-team-input-primary-venue-address-district')}
              />
              <TextInput
                onChangeText={(value) => updatePrimaryVenue('postalCode', value)}
                placeholder="CEP"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.postalCode}
                {...hookProps('create-team-input-primary-venue-postal-code')}
              />
            </ScrollView>

            <View style={styles.modalActions} {...hookProps('create-team-modal-primary-venue-actions')}>
              <Pressable accessibilityRole="button" onPress={handleSavePrimaryVenue} style={styles.primaryButton} {...hookProps('create-team-button-save-primary-venue')}>
                <Text style={styles.primaryButtonText} {...hookProps('create-team-text-save-primary-venue')}>Salvar quadra</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setIsPrimaryVenueModalOpen(false)} style={styles.ghostButton} {...hookProps('create-team-button-cancel-primary-venue')}>
                <Text style={styles.ghostButtonText} {...hookProps('create-team-text-cancel-primary-venue')}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isCrestSourceModalOpen}
        onRequestClose={() => setIsCrestSourceModalOpen(false)}
      >
        <View style={styles.modalBackdrop} {...hookProps('create-team-modal-crest-source-overlay')}>
          <View style={styles.chooserCard} {...hookProps('create-team-modal-crest-source-card')}>
            <Text style={styles.chooserTitle} {...hookProps('create-team-modal-crest-source-title')}>Adicionar escudo</Text>
            <Text style={styles.helperTextSmall} {...hookProps('create-team-modal-crest-source-helper')}>Escolha se prefere enviar uma imagem ou tirar uma foto agora.</Text>

            <View style={styles.chooserActions} {...hookProps('create-team-modal-crest-source-actions')}>
              <Pressable accessibilityRole="button" onPress={() => void handlePickCrestFromLibrary()} style={styles.primaryButton} {...hookProps('create-team-button-crest-upload')}>
                <Text style={styles.primaryButtonText} {...hookProps('create-team-text-crest-upload')}>Fazer upload</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void handlePickCrestFromCamera()} style={styles.secondaryButton} {...hookProps('create-team-button-crest-camera')}>
                <Text style={styles.secondaryButtonText} {...hookProps('create-team-text-crest-camera')}>Usar câmera</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setIsCrestSourceModalOpen(false)} style={styles.ghostButton} {...hookProps('create-team-button-cancel-crest-source')}>
                <Text style={styles.ghostButtonText} {...hookProps('create-team-text-cancel-crest-source')}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={activeColorField !== null}
        onRequestClose={handleCloseColorPicker}
      >
        <View style={styles.modalBackdrop} {...hookProps('create-team-modal-color-picker-overlay')}>
          <View style={styles.chooserCard} {...hookProps('create-team-modal-color-picker-card')}>
            <Text style={styles.chooserTitle} {...hookProps('create-team-modal-color-picker-title')}>Escolha uma cor</Text>

            <View style={styles.colorPickerPanel} {...hookProps('create-team-container-color-picker-panel')}>
              <View style={styles.colorPickerGrid} {...hookProps('create-team-container-color-picker-grid')}>
                {COLOR_SWATCH_ROWS.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.colorPickerRow} {...hookProps(`create-team-container-color-picker-row-${rowIndex}`)}>
                    {row.map((color, colorIndex) => (
                      <Pressable
                        accessibilityRole="button"
                        key={`${rowIndex}-${colorIndex}-${color}`}
                        onPress={() => setColorDraftValue(rowIndex === 0 && colorIndex === 0 ? NO_COLOR_VALUE : color)}
                        {...hookProps(`create-team-button-color-swatch-${rowIndex}-${colorIndex}`)}
                        style={[
                          styles.colorPickerSwatch,
                          rowIndex === 0 && colorIndex === 0
                            ? styles.colorPickerEmptySwatch
                            : { backgroundColor: color },
                          colorDraftValue === (rowIndex === 0 && colorIndex === 0 ? NO_COLOR_VALUE : color) &&
                            styles.colorPickerSwatchActive,
                        ]}
                      >
                        {rowIndex === 0 && colorIndex === 0 ? (
                          <View pointerEvents="none" style={styles.colorPickerEmptyDiagonal} />
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <TextInput
              autoCapitalize="characters"
              onChangeText={setColorDraftValue}
              placeholder="#F2AD24"
              placeholderTextColor={defaultTheme.text.muted}
              style={[styles.input, styles.colorHexInput]}
              value={colorDraftValue === NO_COLOR_VALUE ? '' : colorDraftValue}
              {...hookProps('create-team-input-color-picker-hex')}
            />

            <View style={styles.chooserActions} {...hookProps('create-team-modal-color-picker-actions')}>
              <Pressable accessibilityRole="button" onPress={() => handleApplyColorSelection()} style={styles.primaryButton} {...hookProps('create-team-button-apply-color')}>
                <Text style={styles.primaryButtonText} {...hookProps('create-team-text-apply-color')}>Aplicar cor</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={handleCloseColorPicker} style={styles.ghostButton} {...hookProps('create-team-button-cancel-color-picker')}>
                <Text style={styles.ghostButtonText} {...hookProps('create-team-text-cancel-color-picker')}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function buildPayload(draft: WizardDraft): CreateTeamPayload {
  const payload: CreateTeamPayload = {
    name: draft.name.trim(),
  };

  if (draft.crestUploadToken.trim()) {
    payload.crest_upload_token = draft.crestUploadToken.trim();
  }

  if (draft.foundedYear.trim()) {
    payload.founded_year = Number(draft.foundedYear.trim());
  }

  if (draft.foundedMonth.trim()) {
    payload.founded_month = Number(draft.foundedMonth.trim());
  }

  if (draft.foundedDay.trim()) {
    payload.founded_day = Number(draft.foundedDay.trim());
  }

  if (draft.firstColor.trim()) {
    payload.first_color = draft.firstColor.trim();
  }

  if (draft.secondColor.trim()) {
    payload.second_color = draft.secondColor.trim();
  }

  if (draft.thirdColor.trim()) {
    payload.third_color = draft.thirdColor.trim();
  }

  if (draft.modalities.length) {
    payload.modalities = draft.modalities;
    payload.modality_frame_counts = draft.modalities.reduce<NonNullable<CreateTeamPayload['modality_frame_counts']>>(
      (counts, modality) => ({
        ...counts,
        [modality]: draft.modalityFrameCounts[modality] ?? 1,
      }),
      {},
    );
  }

  if (draft.regionState.trim()) {
    payload.region_state = draft.regionState.trim();
  }

  if (draft.regionCity.trim()) {
    payload.region_city = draft.regionCity.trim();
  }

  if (draft.regionZone.trim()) {
    payload.region_zone = draft.regionZone.trim();
  }

  payload.home_match_capability = getHomeCapability(draft.hasPrimaryVenue);

  const socialAccounts = buildSocialAccounts(draft);
  if (socialAccounts.length) {
    payload.social_accounts = socialAccounts;
  }

  if (draft.hasPrimaryVenue && draft.primaryVenue.name.trim()) {
    payload.primary_venue = {
      name: draft.primaryVenue.name.trim(),
      region_state: draft.primaryVenue.regionState.trim() || null,
      region_city: draft.primaryVenue.regionCity.trim() || null,
      region_zone: draft.primaryVenue.regionZone.trim() || null,
      address_line: draft.primaryVenue.addressLine.trim() || null,
      address_number: draft.primaryVenue.addressNumber.trim() || null,
      address_district: draft.primaryVenue.addressDistrict.trim() || null,
      postal_code: draft.primaryVenue.postalCode.trim() || null,
    };
  }

  return payload;
}

function buildSocialAccounts(draft: WizardDraft): NonNullable<CreateTeamPayload['social_accounts']> {
  const values: Array<[SocialPlatform, string]> = [
    ['INSTAGRAM', draft.instagramValue],
    ['TIKTOK', draft.tiktokValue],
    ['YOUTUBE', draft.youtubeValue],
  ];

  const accounts: NonNullable<CreateTeamPayload['social_accounts']> = [];

  values.forEach(([platform, value]) => {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    const isUrl = normalized.startsWith('http://') || normalized.startsWith('https://');

    accounts.push({
      channel_url: isUrl ? normalized : null,
      handle: isUrl ? null : normalized,
      platform,
    });
  });

  return accounts;
}

function getHomeCapability(hasPrimaryVenue: boolean): HomeMatchCapability {
  return hasPrimaryVenue ? 'HAS_HOME_VENUE' : 'NO_HOME_VENUE';
}

function getHomeCapabilityLabel(value: HomeMatchCapability) {
  if (value === 'HAS_HOME_VENUE') {
    return 'tem mando definido';
  }

  if (value === 'NO_HOME_VENUE') {
    return 'sem quadra principal por enquanto';
  }

  return 'a definir';
}

function hasPrimaryVenueLocation(draft: WizardDraft) {
  if (!draft.hasPrimaryVenue) {
    return false;
  }

  return Boolean(
    draft.primaryVenue.regionState.trim() ||
      draft.primaryVenue.regionCity.trim() ||
      draft.primaryVenue.regionZone.trim(),
  );
}

function getSocialValue(draft: WizardDraft, platform: SocialPlatform) {
  if (platform === 'INSTAGRAM') {
    return draft.instagramValue;
  }

  if (platform === 'TIKTOK') {
    return draft.tiktokValue;
  }

  return draft.youtubeValue;
}

function getSocialPlatformLabel(platform: SocialPlatform) {
  if (platform === 'INSTAGRAM') {
    return 'Instagram';
  }

  if (platform === 'TIKTOK') {
    return 'TikTok';
  }

  return 'YouTube';
}

function getSocialPlatformIcon(platform: SocialPlatform): React.ComponentProps<typeof Ionicons>['name'] {
  if (platform === 'INSTAGRAM') {
    return 'logo-instagram';
  }

  if (platform === 'TIKTOK') {
    return 'musical-notes-outline';
  }

  return 'logo-youtube';
}

function SectionTitle({
  centered = false,
  hookId,
  icon,
  rightSlot,
  title,
}: {
  centered?: boolean;
  hookId?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  rightSlot?: React.ReactNode;
  title: string;
}) {
  return (
    <View
      className={`flex-row items-start justify-between gap-3 ${centered ? 'justify-center' : ''}`}
      {...(hookId ? hookProps(`${hookId}-row`) : {})}
    >
      <View className={`min-w-0 flex-1 flex-row items-start gap-2 ${centered && !rightSlot ? 'justify-center' : ''}`}>
        <Ionicons color={defaultTheme.color.primary} name={icon} size={23} style={{ marginTop: 2 }} />
        <Text
          className={`min-w-0 flex-1 flex-wrap font-slab text-[24px] text-brand-gold ${centered ? 'text-center' : ''}`}
          {...(hookId ? hookProps(hookId) : {})}
        >
          {title}
        </Text>
      </View>
      {rightSlot ? <View className="shrink-0">{rightSlot}</View> : null}
    </View>
  );
}

function getModalityLabel(modality: SportModality) {
  if (modality === 'FUTSAL') {
    return 'Futsal';
  }

  if (modality === 'FIELD') {
    return 'Campo';
  }

  return 'Society';
}

function normalizeHexColor(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!normalized) {
    return '';
  }

  const withHash = normalized.startsWith('#') ? normalized : `#${normalized}`;
  return /^#[0-9A-F]{6}$/.test(withHash) ? withHash : null;
}

function sanitizeNumericInput(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function formatPartialDateSegment(value: string) {
  const sanitized = sanitizeNumericInput(value, 2);
  if (!sanitized) {
    return '';
  }

  return sanitized.length === 1 ? `0${sanitized}` : sanitized;
}

function getFoundationValidationError(draft: WizardDraft) {
  const day = draft.foundedDay.trim();
  const month = draft.foundedMonth.trim();
  const year = draft.foundedYear.trim();

  if (!day && !month && !year) {
    return null;
  }

  if (!year) {
    return 'Para informar a data de fundação, preencha ao menos o ano.';
  }

  if (day && !month) {
    return 'Para informar o dia de fundação, preencha também o mês.';
  }

  const dayNumber = day ? Number(day) : null;
  const monthNumber = month ? Number(month) : null;
  const yearNumber = Number(year);

  if (!Number.isInteger(yearNumber) || year.length !== 4 || yearNumber < 1800 || yearNumber > 2100) {
    return 'Informe um ano de fundação válido com 4 dígitos.';
  }

  if (monthNumber !== null && (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12)) {
    return 'Informe um mês de fundação válido entre 1 e 12.';
  }

  if (dayNumber !== null && (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31)) {
    return 'Informe um dia de fundação válido entre 1 e 31.';
  }

  return null;
}

function buildColorSwatchRows() {
  const hueColumns = [0, 22, 45, 68, 95, 128, 165, 205, 230, 275, 315];
  const rowScale = [
    { lightness: 94, saturation: 42 },
    { lightness: 88, saturation: 50 },
    { lightness: 80, saturation: 62 },
    { lightness: 72, saturation: 74 },
    { lightness: 64, saturation: 86 },
    { lightness: 54, saturation: 94 },
    { lightness: 44, saturation: 92 },
    { lightness: 36, saturation: 82 },
    { lightness: 28, saturation: 68 },
    { lightness: 20, saturation: 52 },
    { lightness: 14, saturation: 34 },
  ];

  return rowScale.map(({ lightness, saturation }) =>
    hueColumns.map((hue) => hslToHex(hue, saturation, lightness)),
  );
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = c;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = c;
  } else if (hue < 180) {
    green = c;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = c;
  } else if (hue < 300) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function renderColorPreview({
  hookId,
  label,
  onPress,
  value,
}: {
  hookId: string;
  label: string;
  onPress: () => void;
  value: string;
}) {
  const normalized = normalizeHexColor(value) ?? '';
  const backgroundColor = normalized || defaultTheme.surface.input;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] border"
      onPress={onPress}
      {...hookProps(hookId)}
      style={{
        backgroundColor,
        borderColor: normalized ? defaultTheme.border.emphasis : defaultTheme.border.default,
      }}
    >
      {!normalized ? <View pointerEvents="none" className="h-[3px] w-[72px] -rotate-45 bg-[#D72638]" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  capabilityText: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  chooserActions: {
    gap: 10,
    marginTop: 18,
  },
  chooserCard: {
    backgroundColor: defaultTheme.surface.card,
    borderColor: defaultTheme.border.default,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 20,
    padding: 20,
  },
  chooserTitle: {
    color: defaultTheme.text.heading,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
  },
  colorPickerGrid: {
    gap: 0,
    paddingVertical: 0,
    width: '100%',
  },
  colorPickerPanel: {
    backgroundColor: '#0F0F0F',
    borderColor: defaultTheme.border.emphasis,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  colorHexInput: {
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.input.lineHeight,
    marginTop: 12,
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 0,
    width: '100%',
  },
  colorPickerEmptyDiagonal: {
    backgroundColor: '#D72638',
    height: 2,
    transform: [{ rotate: '-45deg' }],
    width: 34,
  },
  colorPickerEmptySwatch: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  colorPickerSwatch: {
    borderColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    flex: 1,
    height: 22,
    minWidth: 0,
  },
  colorPickerSwatchActive: {
    borderColor: defaultTheme.text.body,
    borderWidth: 2,
    transform: [{ scale: 1.04 }],
  },
  ghostButton: {
    alignItems: 'center',
    borderColor: defaultTheme.border.emphasis,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  ghostButtonText: {
    color: defaultTheme.text.accent,
    fontSize: components.button.ghost.textStyle.fontSize,
    fontWeight: components.button.ghost.textStyle.fontWeight,
    lineHeight: components.button.ghost.textStyle.lineHeight,
  },
  helperTextSmall: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  input: {
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.default,
    borderRadius: 18,
    borderWidth: 1,
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.input.lineHeight,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  modalActions: {
    gap: 10,
    marginTop: 18,
  },
  modalBackdrop: {
    backgroundColor: defaultTheme.background.overlay,
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: defaultTheme.surface.card,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginHorizontal: 16,
    maxHeight: '88%',
    padding: 22,
  },
  modalContent: {
    gap: 12,
    overflow: 'visible',
    paddingTop: 18,
  },
  modalTitle: {
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.primaryAction,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: components.button.primary.textColor,
    fontSize: components.button.primary.textStyle.fontSize,
    fontWeight: components.button.primary.textStyle.fontWeight,
    lineHeight: components.button.primary.textStyle.lineHeight,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.secondaryAction,
    borderColor: defaultTheme.border.emphasis,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: defaultTheme.text.accent,
    fontSize: components.button.secondary.textStyle.fontSize,
    fontWeight: components.button.secondary.textStyle.fontWeight,
    lineHeight: components.button.secondary.textStyle.lineHeight,
  },
  skipLinkButton: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    paddingTop: 2,
  },
  skipLinkText: {
    color: defaultTheme.text.accent,
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
    textAlign: 'right',
  },
  venuePredictionItem: {
    borderBottomColor: defaultTheme.border.subtle,
    borderBottomWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  venuePredictionItemLast: {
    borderBottomWidth: 0,
  },
  venuePredictionList: {
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.default,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  venuePredictionSubtitle: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  venuePredictionTitle: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.body.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.body.lineHeight,
  },
  venueSearchDropdown: {
    gap: 10,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 56,
    zIndex: 12,
  },
  venueSearchFieldWrap: {
    minHeight: 50,
    overflow: 'visible',
    position: 'relative',
    zIndex: 12,
  },
});
