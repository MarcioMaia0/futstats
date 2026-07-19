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

type TeamColorKey = 'firstColor' | 'secondColor' | 'thirdColor';

type WizardDraft = {
  crestUploadToken: string;
  firstColor: string;
  foundedDay: string;
  foundedMonth: string;
  foundedYear: string;
  hasPrimaryVenue: boolean;
  instagramValue: string;
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

  const shellWidth = Math.min(width - 32, 360);
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

      return {
        ...current,
        modalities: isSelected
          ? current.modalities.filter((item) => item !== modality)
          : [...current.modalities, modality],
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
    <View className="flex-1">
      <Image
        className="absolute z-0"
        resizeMode="contain"
        source={logoBackground}
        style={[
          {
            height: backgroundLogoHeight,
            left: -(width * 0.4),
            top: -(backgroundLogoHeight * 0.1),
            width: backgroundLogoWidth,
          },
        ]}
      />

      <ScrollView className="flex-1" contentContainerClassName="grow items-center px-4 pb-8 pt-3">
        <View className="z-[1] gap-[18px]" style={{ width: shellWidth }}>
          <View className="min-h-[42px] flex-row items-center justify-between">
            <BackCircleButton onPress={handleGoBack} />
            <Text className="font-slab text-[24px] leading-7 text-brand-gold">Criar time</Text>
            <View className="h-[42px] w-[42px]" />
          </View>

          <StepNavigationContainer currentStep={step} totalSteps={TOTAL_STEPS}>
            <View className="gap-4">
              {step === 0 && (
                <View className="gap-[14px]">
                  <Text className="text-center font-slab text-[24px] leading-7 text-brand-gold">Qual o nome do seu time?</Text>
                  <TextInput
                    autoCapitalize="words"
                    className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                    onChangeText={(value) => updateDraft('name', value)}
                    placeholder="Ex.: Vila Nova FC"
                    placeholderTextColor={defaultTheme.text.muted}
                    value={draft.name}
                  />
                  <Text className="text-base leading-6 text-text-muted">
                    Digite o nome completo do time. Depois você escolhe como ele será exibido.
                  </Text>
                </View>
              )}

              {step === 1 && (
                <View className="gap-[14px]">
                  <Text className="text-center font-slab text-[24px] leading-7 text-brand-gold">Escolha o escudo do time</Text>
                  <ImagePreviewCard
                    imageUri={crestPreviewUrl}
                    isUploading={isCrestUploading}
                    onEdit={handleEditCrest}
                    title={crestPreviewUrl ? 'Escudo pronto para usar' : 'Escudo opcional'}
                  />
                </View>
              )}

              {step === 2 && (
                <View className="gap-[14px]">
                  <View className="gap-3">
                    <Text className="font-slab text-[24px] leading-7 text-brand-gold">Data de fundação</Text>
                    <Text className="text-base leading-6 text-text-muted">
                      Preencha apenas o que você souber. O ano pode ser informado sozinho.
                    </Text>
                    <View className="flex-row gap-[10px]">
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={(value) => updateDraft('foundedDay', sanitizeNumericInput(value, 2))}
                        onBlur={() => updateDraft('foundedDay', formatPartialDateSegment(draft.foundedDay))}
                        placeholder="Dia"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] w-[60px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.foundedDay}
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
                      />
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={4}
                        onChangeText={(value) => updateDraft('foundedYear', sanitizeNumericInput(value, 4))}
                        placeholder="Ano"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] w-[100px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.foundedYear}
                      />
                    </View>

                    <View className="h-2" />
                    <Text className="font-slab text-[24px] leading-7 text-brand-gold">Cores do time</Text>
                    <Text className="text-base leading-6 text-text-muted">
                      Escolha as cores principais do time para começar a formar a identidade visual.
                    </Text>
                    <View className="flex-row gap-3">
                      {renderColorPreview({
                        label: 'Primeira cor',
                        onPress: () => handleOpenColorPicker('firstColor'),
                        value: draft.firstColor,
                      })}
                      {renderColorPreview({
                        label: 'Segunda cor',
                        onPress: () => handleOpenColorPicker('secondColor'),
                        value: draft.secondColor,
                      })}
                      {renderColorPreview({
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
                    />
                    <TextInput
                      autoCapitalize="characters"
                      onChangeText={(value) => updateDraft('secondColor', normalizeHexColor(value) ?? value)}
                      placeholder="Segunda cor"
                      placeholderTextColor={defaultTheme.text.muted}
                      className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                      value={draft.secondColor}
                    />
                    <TextInput
                      autoCapitalize="characters"
                      onChangeText={(value) => updateDraft('thirdColor', normalizeHexColor(value) ?? value)}
                      placeholder="Terceira cor"
                      placeholderTextColor={defaultTheme.text.muted}
                      className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                      value={draft.thirdColor}
                    />
                  </View>
                </View>
              )}

              {step === 3 && (
                <View className="gap-[14px]">
                  <View className="gap-3">
                    <Text className="font-slab text-[24px] leading-7 text-brand-gold">Modalidades</Text>
                    <View className="flex-row flex-wrap gap-[10px]">
                      {MODALITY_OPTIONS.map((modality) => {
                        const isSelected = draft.modalities.includes(modality);

                        return (
                          <Pressable
                            accessibilityRole="button"
                            className={`rounded-full border px-[14px] py-[10px] ${isSelected ? 'border-brand-gold bg-brand-gold' : 'border-stroke-default bg-surface-muted'}`}
                            key={modality}
                            onPress={() => handleToggleModality(modality)}
                          >
                            <Text className={`text-base font-bold leading-6 ${isSelected ? 'text-[#17120A]' : 'text-white'}`}>
                              {getModalityLabel(modality)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View className="gap-3">
                    <View className="flex-row items-center justify-between gap-4">
                      <Text className="font-slab text-[24px] leading-7 text-brand-gold">Tem quadra principal?</Text>
                      <Pressable
                        accessibilityRole="switch"
                        className={`h-[34px] w-[62px] justify-center rounded-full border px-1 ${draft.hasPrimaryVenue ? 'border-brand-gold bg-[#4D3D12]' : 'border-stroke-default bg-surface-muted'}`}
                        onPress={handlePrimaryVenueToggle}
                      >
                        <View className={`h-6 w-6 rounded-full ${draft.hasPrimaryVenue ? 'translate-x-[28px] bg-brand-gold' : 'bg-text-muted'}`} />
                      </Pressable>
                    </View>

                    <Text className="text-base leading-6 text-text-subdued">
                      Isso ajuda a definir a capacidade de mando e pode pr?-preencher a localidade.
                    </Text>

                    <Text style={styles.capabilityText}>
                      Capacidade de mando: {getHomeCapabilityLabel(getHomeCapability(draft.hasPrimaryVenue))}
                    </Text>

                    {draft.hasPrimaryVenue && (
                      <View className="gap-3 rounded-[18px] border border-stroke-subtle bg-surface-muted p-[14px]">
                        <Text className="text-base font-bold leading-6 text-white">{primaryVenueSummary}</Text>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setIsPrimaryVenueModalOpen(true)}
                          className="min-h-[48px] items-center justify-center rounded-[16px] border border-brand-gold bg-surface-muted px-4"
                        >
                          <Text className="text-base font-bold leading-6 text-brand-gold">
                            {draft.primaryVenue.name.trim() ? 'Editar quadra principal' : 'Adicionar quadra principal'}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {!hasPrimaryVenueLocation(draft) && (
                    <View className="gap-3">
                      <Text className="font-slab text-[24px] leading-7 text-brand-gold">Localidade do time</Text>
                      <TextInput
                        autoCapitalize="words"
                        onChangeText={(value) => updateDraft('regionState', value)}
                        placeholder="Estado"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.regionState}
                      />
                      <TextInput
                        autoCapitalize="words"
                        onChangeText={(value) => updateDraft('regionCity', value)}
                        placeholder="Cidade"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.regionCity}
                      />
                      <TextInput
                        autoCapitalize="words"
                        onChangeText={(value) => updateDraft('regionZone', value)}
                        placeholder="Zona ou regi?o (opcional)"
                        placeholderTextColor={defaultTheme.text.muted}
                        className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                        value={draft.regionZone}
                      />
                    </View>
                  )}
                </View>
              )}

              {step === 4 && (
                <View className="gap-[14px]">
                  <View className="gap-3">
                    <Text className="font-slab text-[24px] leading-7 text-brand-gold">Redes sociais</Text>
                    <Text className="text-base leading-6 text-text-subdued">
                      Conecte o perfil principal agora ou deixe para depois. Você pode informar @handle, nome do canal ou URL pública.
                    </Text>
                    <View className="flex-row gap-[10px]">
                      {SOCIAL_TABS.map((tab) => {
                        const isActive = tab.platform === draft.selectedSocialPlatform;

                        return (
                          <Pressable
                            accessibilityRole="button"
                            className={`min-h-[68px] flex-1 items-center justify-center rounded-[14px] border px-2 py-[10px] ${isActive ? 'border-brand-gold bg-surface-muted' : 'border-stroke-default bg-surface-muted'}`}
                            key={tab.platform}
                            onPress={() => updateDraft('selectedSocialPlatform', tab.platform)}
                          >
                            <View className="items-center justify-center gap-1.5">
                              <Ionicons
                                color={isActive ? defaultTheme.text.accent : defaultTheme.text.subdued}
                                name={getSocialPlatformIcon(tab.platform)}
                                size={32}
                              />
                              <Text className={`text-base font-bold leading-6 ${isActive ? 'text-brand-gold' : 'text-text-subdued'}`}>{tab.label}</Text>
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
                    />
                  </View>
                </View>
              )}

              {errorMessage && <Text className="text-center text-[13px] leading-[18px] text-[#FF7B7B]">{errorMessage}</Text>}
              <View className="gap-3">
                {step < TOTAL_STEPS - 1 ? (
                  <>
                    <Pressable accessibilityRole="button" className="min-h-[54px] items-center justify-center rounded-[18px] bg-brand-gold px-[18px]" onPress={handleAdvanceStep}>
                      <Text className="text-[19px] font-bold leading-6 text-[#1E1E1E]">Continuar</Text>
                    </Pressable>

                    {step > 0 && (
                      <Pressable accessibilityRole="button" onPress={handleAdvanceStep} style={styles.skipLinkButton}>
                        <Text style={styles.skipLinkText}>Pular</Text>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    onPress={handleSubmit}
                    className={`min-h-[54px] items-center justify-center rounded-[18px] bg-brand-gold px-[18px] ${isSubmitting ? 'opacity-65' : ''}`}
                  >
                    <Text className="text-[19px] font-bold leading-6 text-[#1E1E1E]">{isSubmitting ? 'Criando...' : 'Concluir'}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </StepNavigationContainer>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={isPrimaryVenueModalOpen}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quadra principal</Text>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.venueSearchFieldWrap}>
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
                />
                {(isVenueSearchLoading || isVenueDetailsLoading || venuePredictions.length > 0) && (
                  <View style={styles.venueSearchDropdown}>
                    {isVenueSearchLoading ? <Text style={styles.helperTextSmall}>Buscando locais...</Text> : null}
                    {isVenueDetailsLoading ? <Text style={styles.helperTextSmall}>Preenchendo endere?o...</Text> : null}
                    {!isVenueSearchLoading && !isVenueDetailsLoading && venuePredictions.length > 0 ? (
                      <View style={styles.venuePredictionList}>
                        {venuePredictions.map((prediction, index) => (
                          <Pressable
                            accessibilityRole="button"
                            key={prediction.placeId}
                            onPress={() => void handleSelectVenuePrediction(prediction)}
                            style={[
                              styles.venuePredictionItem,
                              index === venuePredictions.length - 1 && styles.venuePredictionItemLast,
                            ]}
                          >
                            <Text style={styles.venuePredictionTitle}>{prediction.primaryText}</Text>
                            {prediction.secondaryText ? (
                              <Text style={styles.venuePredictionSubtitle}>{prediction.secondaryText}</Text>
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
              {venueSearchMessage ? <Text style={styles.helperTextSmall}>{venueSearchMessage}</Text> : null}
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('regionState', value)}
                placeholder="Estado"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.regionState}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('regionCity', value)}
                placeholder="Cidade"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.regionCity}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('regionZone', value)}
                placeholder="Zona ou regi?o"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.regionZone}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('addressLine', value)}
                placeholder="Endere?o"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.addressLine}
              />
              <TextInput
                onChangeText={(value) => updatePrimaryVenue('addressNumber', value)}
                placeholder="N?mero"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.addressNumber}
              />
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updatePrimaryVenue('addressDistrict', value)}
                placeholder="Bairro"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.addressDistrict}
              />
              <TextInput
                onChangeText={(value) => updatePrimaryVenue('postalCode', value)}
                placeholder="CEP"
                placeholderTextColor={defaultTheme.text.muted}
                className="min-h-[50px] rounded-[18px] border border-stroke-default bg-surface-muted px-4 text-base leading-6 text-white"
                value={draft.primaryVenue.postalCode}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable accessibilityRole="button" onPress={handleSavePrimaryVenue} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Salvar quadra</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setIsPrimaryVenueModalOpen(false)} style={styles.ghostButton}>
                <Text style={styles.ghostButtonText}>Cancelar</Text>
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
        <View style={styles.modalBackdrop}>
          <View style={styles.chooserCard}>
            <Text style={styles.chooserTitle}>Adicionar escudo</Text>
            <Text style={styles.helperTextSmall}>Escolha se prefere enviar uma imagem ou tirar uma foto agora.</Text>

            <View style={styles.chooserActions}>
              <Pressable accessibilityRole="button" onPress={() => void handlePickCrestFromLibrary()} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Fazer upload</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void handlePickCrestFromCamera()} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Usar câmera</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setIsCrestSourceModalOpen(false)} style={styles.ghostButton}>
                <Text style={styles.ghostButtonText}>Cancelar</Text>
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
        <View style={styles.modalBackdrop}>
          <View style={styles.chooserCard}>
            <Text style={styles.chooserTitle}>Escolha uma cor</Text>

            <View style={styles.colorPickerPanel}>
              <View style={styles.colorPickerGrid}>
                {COLOR_SWATCH_ROWS.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.colorPickerRow}>
                    {row.map((color, colorIndex) => (
                      <Pressable
                        accessibilityRole="button"
                        key={`${rowIndex}-${colorIndex}-${color}`}
                        onPress={() => setColorDraftValue(rowIndex === 0 && colorIndex === 0 ? NO_COLOR_VALUE : color)}
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
            />

            <View style={styles.chooserActions}>
              <Pressable accessibilityRole="button" onPress={() => handleApplyColorSelection()} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Aplicar cor</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={handleCloseColorPicker} style={styles.ghostButton}>
                <Text style={styles.ghostButtonText}>Cancelar</Text>
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
  label,
  onPress,
  value,
}: {
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
  block: {
    gap: 12,
  },
  backgroundLogo: {
    position: 'absolute',
    zIndex: 0,
  },
  blockTitle: {
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
  },
  capabilityText: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  chip: {
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.default,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipSelected: {
    backgroundColor: defaultTheme.surface.primaryAction,
    borderColor: defaultTheme.border.emphasis,
  },
  chipText: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  chipTextSelected: {
    color: defaultTheme.text.onPrimary,
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
  colorPreview: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  colorPreviewDiagonal: {
    backgroundColor: '#D72638',
    height: 3,
    transform: [{ rotate: '-45deg' }],
    width: 72,
  },
  colorPreviewRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contentStack: {
    gap: 16,
  },
  disabledButton: {
    opacity: 0.65,
  },
  errorText: {
    color: defaultTheme.text.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  footerActions: {
    gap: 12,
  },
  foundationFieldDay: {
    width: 60,
  },
  foundationFieldMonth: {
    width: 100,
  },
  foundationFieldsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  foundationToColorsSpacing: {
    height: 8,
  },
  foundationFieldYear: {
    width: 100,
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
  helperCaption: {
    color: defaultTheme.text.muted,
    fontFamily: typography.textStyles.fieldHint.fontFamily,
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: typography.textStyles.fieldHint.fontWeight,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
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
  screen: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  screenTitle: {
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
    textAlign: 'center',
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
  shellFrame: {
    gap: 18,
    zIndex: 1,
  },
  socialTab: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.default,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 68,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  socialTabActive: {
    borderColor: defaultTheme.border.emphasis,
  },
  socialTabContent: {
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  socialTabIcon: {
    textAlign: 'center',
  },
  socialTabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialTabText: {
    color: defaultTheme.text.subdued,
    fontSize: components.button.secondary.textStyle.fontSize,
    fontWeight: components.button.secondary.textStyle.fontWeight,
    lineHeight: components.button.secondary.textStyle.lineHeight,
  },
  socialTabTextActive: {
    color: defaultTheme.text.accent,
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
  successText: {
    color: defaultTheme.text.success,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  toggleButton: {
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.default,
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: 62,
  },
  toggleButtonActive: {
    backgroundColor: defaultTheme.surface.accentSoft,
    borderColor: defaultTheme.border.emphasis,
  },
  toggleHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  toggleThumb: {
    backgroundColor: defaultTheme.text.muted,
    borderRadius: 999,
    height: 24,
    width: 24,
  },
  toggleThumbActive: {
    backgroundColor: defaultTheme.color.primary,
    transform: [{ translateX: 28 }],
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  topBarSpacer: {
    height: 42,
    width: 42,
  },
  venuePanel: {
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.subtle,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  venueSummary: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
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
