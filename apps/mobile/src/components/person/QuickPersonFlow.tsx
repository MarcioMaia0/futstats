import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';

import {
  getModalityLabel,
  getModalityPositionOptions,
  type ModalityPositionCode,
} from '../../config/modalityPositions';
import type { ModalityFrameCounts, SportModality } from '../../features/teams/services/teamService';
import type { TeamRosterRole } from '../../features/teams/services/teamRosterService';
import type { TeamExperienceTheme } from '../../theme/teamExperienceTheme';
import { OptionSelectField, type OptionSelectItem } from '../inputs/OptionSelectField';
import { ThemeToggle } from '../inputs/ThemeToggle';
import { ImagePreviewCard } from '../media/ImagePreviewCard';
import { StepNavigationContainer } from '../navigation/StepNavigationContainer';

export type QuickPersonMode = 'match' | 'roster';

export type QuickPersonDominantFoot = 'RIGHT' | 'LEFT' | 'BOTH' | null;
export type QuickPersonDefaultFrameType = 'UNASSIGNED' | 'FIRST_FRAME' | 'SECOND_FRAME';

export type QuickPersonSportContext = {
  frameType: QuickPersonDefaultFrameType;
  positionCodes: ModalityPositionCode[];
};

export type QuickPersonDraft = {
  addAsCommittee: boolean;
  addAsDirector: boolean;
  addAsPlayer: boolean;
  addAsPresident: boolean;
  avatarUrl: string | null;
  dominantFoot: QuickPersonDominantFoot;
  fullName: string;
  isGuestForCurrentMatch: boolean;
  modality: SportModality | null;
  nickname: string;
  positionCodes: ModalityPositionCode[];
  shirtNumber: string;
  sportContexts: Partial<Record<SportModality, QuickPersonSportContext>>;
};

export const INITIAL_QUICK_PERSON_DRAFT: QuickPersonDraft = {
  addAsCommittee: false,
  addAsDirector: false,
  addAsPlayer: true,
  addAsPresident: false,
  avatarUrl: null,
  dominantFoot: null,
  fullName: '',
  isGuestForCurrentMatch: false,
  modality: 'FUTSAL',
  nickname: '',
  positionCodes: [],
  shirtNumber: '',
  sportContexts: {
    FUTSAL: {
      frameType: 'UNASSIGNED',
      positionCodes: [],
    },
  },
};

type QuickPersonFlowProps = {
  availableModalityFrameCounts?: ModalityFrameCounts;
  availableModalities?: SportModality[];
  canAssignLeadershipRoles?: boolean;
  initialDraft?: QuickPersonDraft;
  mode: QuickPersonMode;
  onCancel: () => void;
  onSubmit: (draft: QuickPersonDraft) => void;
  theme: TeamExperienceTheme;
};

const DOMINANT_FOOT_OPTIONS: Array<{ label: string; value: QuickPersonDominantFoot }> = [
  { label: 'Destro', value: 'RIGHT' },
  { label: 'Canhoto', value: 'LEFT' },
  { label: 'Ambidestro', value: 'BOTH' },
];

export function buildRosterRolesFromQuickPersonDraft(draft: QuickPersonDraft): TeamRosterRole[] {
  const nextRoles: TeamRosterRole[] = [];

  if (draft.addAsPlayer) {
    nextRoles.push('PLAYER');
  }

  if (draft.addAsCommittee) {
    nextRoles.push('COMMITTEE');
  }

  if (draft.addAsDirector) {
    nextRoles.push('DIRECTOR');
  }

  if (draft.addAsPresident) {
    nextRoles.push('PRESIDENT');
  }

  return nextRoles;
}

export function QuickPersonFlow({
  availableModalityFrameCounts = {},
  availableModalities = ['FUTSAL'] as SportModality[],
  canAssignLeadershipRoles = false,
  initialDraft = INITIAL_QUICK_PERSON_DRAFT,
  mode,
  onCancel,
  onSubmit,
  theme,
}: QuickPersonFlowProps) {
  const sanitizedModalities = useMemo(() => {
    const uniqueValues = Array.from(new Set(availableModalities));
    return uniqueValues.length ? uniqueValues : (['FUTSAL'] as SportModality[]);
  }, [availableModalities]);
  const initialSportContextFields = useMemo(
    () => syncLegacySportFields(buildInitialSportContexts(initialDraft, sanitizedModalities, availableModalityFrameCounts)),
    [availableModalityFrameCounts, initialDraft, sanitizedModalities],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<QuickPersonDraft>({
    ...INITIAL_QUICK_PERSON_DRAFT,
    ...initialDraft,
    ...initialSportContextFields,
  });
  const [activeSportModality, setActiveSportModality] = useState<SportModality>(
    initialSportContextFields.modality ?? sanitizedModalities[0] ?? 'FUTSAL',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImageSourceModalOpen, setIsImageSourceModalOpen] = useState(false);

  const totalSteps = 3;
  const titleByStep = useMemo(
    () => ['Identidade da pessoa', 'Vínculo com o time', 'Contexto esportivo'][currentStep] ?? 'Cadastro rápido',
    [currentStep],
  );
  function hookProps(id: string) {
    return {
      nativeID: id,
      testID: id,
    };
  }

  function updateDraft<K extends keyof QuickPersonDraft>(key: K, value: QuickPersonDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function validateStep(stepIndex: number) {
    if (stepIndex === 0 && !draft.fullName.trim() && !draft.nickname.trim()) {
      return 'Preencha ao menos nome ou apelido para continuar.';
    }

    if (stepIndex === 2 && mode === 'match' && draft.addAsPlayer && !draft.shirtNumber.trim()) {
      return 'Informe o número da camisa para usar esse cadastro na beira da quadra.';
    }

    return null;
  }

  function handleNextStep() {
    const stepError = validateStep(currentStep);

    if (stepError) {
      setErrorMessage(stepError);
      return;
    }

    setErrorMessage(null);
    setCurrentStep((value) => Math.min(value + 1, totalSteps - 1));
  }

  function handlePreviousStep() {
    setErrorMessage(null);

    if (currentStep === 0) {
      onCancel();
      return;
    }

    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  function handleSubmit() {
    const stepError = validateStep(currentStep);

    if (stepError) {
      setErrorMessage(stepError);
      return;
    }

    setErrorMessage(null);
    onSubmit(draft);
  }

  function handleTogglePlayer(value: boolean) {
    setDraft((current) => {
      if (!value) {
        return {
          ...current,
          addAsPlayer: false,
          dominantFoot: null,
          isGuestForCurrentMatch: false,
          modality: null,
          positionCodes: [],
          shirtNumber: '',
          sportContexts: {},
        };
      }

      const nextSportContexts = Object.keys(current.sportContexts).length
        ? current.sportContexts
        : {
            [sanitizedModalities[0]]: {
              frameType: getDefaultFrameTypeForModality(sanitizedModalities[0], availableModalityFrameCounts),
              positionCodes: [],
            },
          };

      setActiveSportModality((Object.keys(nextSportContexts) as SportModality[])[0] ?? sanitizedModalities[0]);

      return {
        ...current,
        addAsPlayer: true,
        ...syncLegacySportFields(nextSportContexts),
      };
    });
  }

  function handleToggleCommittee(value: boolean) {
    setDraft((current) => ({
      ...current,
      addAsCommittee: value,
    }));
  }

  function handleToggleDirector(value: boolean) {
    setDraft((current) => ({
      ...current,
      addAsDirector: value,
      addAsPresident: value ? false : current.addAsPresident,
    }));
  }

  function handleTogglePresident(value: boolean) {
    setDraft((current) => ({
      ...current,
      addAsDirector: value ? false : current.addAsDirector,
      addAsPresident: value,
    }));
  }

  function handleToggleGuest(value: boolean) {
    setDraft((current) => ({
      ...current,
      addAsCommittee: value ? false : current.addAsCommittee,
      addAsDirector: value ? false : current.addAsDirector,
      addAsPresident: value ? false : current.addAsPresident,
      isGuestForCurrentMatch: value,
    }));
  }

  function handleSelectSportModality(modality: SportModality) {
    setDraft((current) => ({
      ...current,
      ...syncLegacySportFields(ensureSportContext(current.sportContexts, modality, availableModalityFrameCounts)),
    }));
    setActiveSportModality(modality);
  }

  function handleSelectSportContextFrameType(modality: SportModality, frameType: QuickPersonDefaultFrameType) {
    setDraft((current) => {
      const currentContext = current.sportContexts[modality];

      if (!currentContext) {
        return current;
      }

      return {
        ...current,
        ...syncLegacySportFields({
          ...current.sportContexts,
          [modality]: {
            ...currentContext,
            frameType,
          },
        }),
      };
    });
  }

  function handleChangeSportContextPositions(modality: SportModality, positionCodes: ModalityPositionCode[]) {
    setDraft((current) => {
      const currentContext = current.sportContexts[modality];

      if (!currentContext) {
        return current;
      }

      return {
        ...current,
        ...syncLegacySportFields({
          ...current.sportContexts,
          [modality]: {
            ...currentContext,
            positionCodes,
          },
        }),
      };
    });
  }

  function handleEditAvatar() {
    if (Platform.OS === 'web') {
      setIsImageSourceModalOpen(true);
      return;
    }

    Alert.alert('Foto da pessoa', 'Escolha como deseja adicionar a imagem.', [
      { style: 'cancel', text: 'Cancelar' },
      { onPress: () => void handlePickImageFromLibrary(), text: 'Fazer upload' },
      { onPress: () => void handlePickImageFromCamera(), text: 'Usar câmera' },
    ]);
  }

  async function handlePickImageFromLibrary() {
    setIsImageSourceModalOpen(false);
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
      quality: 0.85,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64 || !asset.mimeType) {
      setErrorMessage('Não foi possível preparar a imagem agora.');
      return;
    }

    updateDraft('avatarUrl', `data:${asset.mimeType};base64,${asset.base64}`);
  }

  async function handlePickImageFromCamera() {
    setIsImageSourceModalOpen(false);
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
      cameraType: ImagePicker.CameraType.front,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64 || !asset.mimeType) {
      setErrorMessage('Não foi possível preparar a imagem agora.');
      return;
    }

    updateDraft('avatarUrl', `data:${asset.mimeType};base64,${asset.base64}`);
  }

  return (
    <>
      <View className="w-full gap-4" {...hookProps('quick-person-flow-container-main')}>
        <StepNavigationContainer currentStep={currentStep} totalSteps={totalSteps} style={{ width: '100%' }}>
          <View className="flex-row items-start justify-between" {...hookProps('quick-person-flow-container-header')}>
            <View className="min-w-0 flex-1 pr-3">
              <Text
                className="font-slab text-[1.5rem] leading-7"
                style={{ color: theme.accentPrimary }}
                {...hookProps('quick-person-flow-text-title')}
              >
                Cadastro rápido
              </Text>
              <Text
                className="pt-1 text-[0.95rem] leading-5"
                style={{ color: theme.textMuted }}
                {...hookProps('quick-person-flow-text-subtitle')}
              >
                {titleByStep}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-[42px] w-[42px] items-center justify-center rounded-full"
              onPress={onCancel}
              {...hookProps('quick-person-flow-button-close')}
            >
              <Ionicons color={theme.textMuted} name="close" size={18} />
            </Pressable>
          </View>

          <View className="gap-4 py-4" {...hookProps(`quick-person-flow-step-${currentStep}`)}>
            {currentStep === 0 ? (
              <View className="gap-4" {...hookProps('quick-person-flow-container-step-identity')}>
                <ImagePreviewCard entityType="person" imageUri={draft.avatarUrl} onEdit={handleEditAvatar} theme={theme} title="" />

                <WizardField
                  hookId="quick-person-flow-field-full-name"
                  label="Nome completo"
                  onChangeText={(value) => updateDraft('fullName', value)}
                  placeholder="Ex.: Eduardo Lima"
                  theme={theme}
                  value={draft.fullName}
                />

                <WizardField
                  hookId="quick-person-flow-field-nickname"
                  label="Apelido"
                  onChangeText={(value) => updateDraft('nickname', value)}
                  placeholder="Ex.: Dudu"
                  theme={theme}
                  value={draft.nickname}
                />
              </View>
            ) : null}

            {currentStep === 1 ? (
              <View className="gap-3" {...hookProps('quick-person-flow-container-step-membership')}>
                <WizardToggleRow
                  hookId="quick-person-flow-toggle-player"
                  label="Jogador"
                  onValueChange={handleTogglePlayer}
                  theme={theme}
                  value={draft.addAsPlayer}
                />
                <WizardToggleRow
                  hookId="quick-person-flow-toggle-committee"
                  label="Comissão"
                  onValueChange={handleToggleCommittee}
                  theme={theme}
                  value={draft.addAsCommittee}
                />

                {canAssignLeadershipRoles ? (
                  <>
                    <WizardToggleRow
                      hookId="quick-person-flow-toggle-director"
                      label="Diretoria"
                      onValueChange={handleToggleDirector}
                      theme={theme}
                      value={draft.addAsDirector}
                    />
                    <WizardToggleRow
                      hookId="quick-person-flow-toggle-president"
                      label="Presidência"
                      onValueChange={handleTogglePresident}
                      theme={theme}
                      value={draft.addAsPresident}
                    />
                  </>
                ) : null}
              </View>
            ) : null}

            {currentStep === 2 ? (
              <View className="gap-3" {...hookProps('quick-person-flow-container-step-sports')}>
                {mode === 'match' ? (
                  <WizardToggleRow
                    description="Use quando esse cadastro já precisa entrar na partida atual."
                    hookId="quick-person-flow-toggle-guest-match"
                    label="Usar na partida atual"
                    onValueChange={handleToggleGuest}
                    theme={theme}
                    value={draft.isGuestForCurrentMatch}
                  />
                ) : null}

                {draft.addAsPlayer ? (
                  <>
                    <View className="flex-row gap-3" {...hookProps('quick-person-flow-container-sports-row')}>
                      <View className="w-[96px]">
                        <WizardField
                          hookId="quick-person-flow-field-shirt-number"
                          keyboardType="number-pad"
                          label="Camisa"
                          onChangeText={(value) => updateDraft('shirtNumber', value.replace(/[^0-9]/g, ''))}
                          placeholder="10"
                          theme={theme}
                          value={draft.shirtNumber}
                        />
                      </View>
                    </View>

                    <View className="gap-2" {...hookProps('quick-person-flow-container-modality')}>
                      <Text className="text-[0.95rem] font-bold leading-5" style={{ color: theme.accentPrimary }}>
                        Modalidade
                      </Text>

                      <View className="flex-row flex-wrap gap-2 w-full max-w-xl" {...hookProps('quick-person-flow-container-modality-options')}>
                        {sanitizedModalities.map((modality) => {
                          const isSelected = Boolean(draft.sportContexts[modality]);
                          const isActive = activeSportModality === modality;

                          return (
                            <Pressable
                              key={modality}
                              accessibilityRole="button"
                              className="min-h-[42px] min-w-[100px] rounded-full border px-4 py-2 flex justify-center"
                              onPress={() => handleSelectSportModality(modality)}
                              style={{
                                backgroundColor: isSelected ? `${theme.accentPrimary}22` : theme.surfaceBase,
                                borderColor: isActive || isSelected ? theme.accentPrimary : theme.borderDefault,
                              }}
                              {...hookProps(`quick-person-flow-button-modality-${modality.toLowerCase()}`)}
                            >
                              <Text className="text-[0.95rem] text-center" style={{ color: isSelected ? theme.accentPrimary : theme.textPrimary }}>
                                {getModalityLabel(modality)}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {draft.sportContexts[activeSportModality] ? (
                        <SportContextPanel
                          activeModality={activeSportModality}
                          frameCount={availableModalityFrameCounts[activeSportModality] ?? 1}
                          onChangePositions={handleChangeSportContextPositions}
                          onSelectFrameType={handleSelectSportContextFrameType}
                          sportContext={draft.sportContexts[activeSportModality]}
                          theme={theme}
                        />
                      ) : null}
                    </View>

                    <View className="gap-2" {...hookProps('quick-person-flow-container-dominant-foot')}>
                      <Text className="text-[0.95rem] font-bold" style={{ color: theme.accentPrimary }}>
                        Perna favorita
                      </Text>

                      <View className="flex-row flex-wrap gap-2">
                        {DOMINANT_FOOT_OPTIONS.map((option) => {
                          const isActive = draft.dominantFoot === option.value;

                          return (
                            <Pressable
                              key={option.label}
                              accessibilityRole="button"
                              className="min-h-[42px] rounded-full border px-4 py-2 flex justify-center"
                              onPress={() => updateDraft('dominantFoot', isActive ? null : option.value)}
                              style={{
                                backgroundColor: isActive ? `${theme.accentPrimary}22` : theme.surfaceBase,
                                borderColor: isActive ? theme.accentPrimary : theme.borderDefault,
                              }}
                              {...hookProps(`quick-person-flow-button-dominant-foot-${option.value?.toLowerCase() ?? 'none'}`)}
                            >
                              <Text className="text-[0.95rem] " style={{ color: isActive ? theme.accentPrimary : theme.textPrimary }}>
                                {option.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </>
                ) : (
                  <Text className="text-[0.95rem] leading-6" style={{ color: theme.textMuted }}>
                    Sem vínculo como jogador, não é necessário preencher camisa, modalidade, posição ou perna favorita.
                  </Text>
                )}
              </View>
            ) : null}
          </View>

          <View className="flex-row gap-3" {...hookProps('quick-person-flow-container-actions')}>
            <Pressable
              accessibilityRole="button"
              className="min-h-[52px] flex-1 items-center justify-center rounded-[18px] border px-4"
              onPress={handlePreviousStep}
              style={{ borderColor: theme.borderDefault }}
              {...hookProps('quick-person-flow-button-back')}
            >
              <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }}>
                {currentStep === 0 ? 'Cancelar' : 'Voltar'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="min-h-[52px] flex-1 items-center justify-center rounded-[18px] px-4"
              onPress={currentStep === totalSteps - 1 ? handleSubmit : handleNextStep}
              style={{ backgroundColor: theme.accentPrimary }}
              {...hookProps('quick-person-flow-button-next')}
            >
              <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.accentOnPrimary }}>
                {currentStep === totalSteps - 1 ? 'Salvar integrante' : 'Continuar'}
              </Text>
            </Pressable>
          </View>
        </StepNavigationContainer>

        {errorMessage ? (
          <View
            className="rounded-[18px] border px-4 py-3"
            style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
            {...hookProps('quick-person-flow-container-feedback')}
          >
            <Text className="text-[0.95rem] leading-5" style={{ color: theme.textMuted }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}
      </View>

      <Modal animationType="fade" transparent visible={isImageSourceModalOpen} onRequestClose={() => setIsImageSourceModalOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 px-4">
          <View
            className="w-full max-w-[360px] gap-3 rounded-[28px] border p-5"
            style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
            {...hookProps('quick-person-flow-modal-image-source')}
          >
            <Text className="font-slab text-[1.35rem] leading-7" style={{ color: theme.accentPrimary }}>
              Adicionar foto
            </Text>

            <Text className="text-[0.95rem] leading-5" style={{ color: theme.textMuted }}>
              Escolha como deseja selecionar a imagem.
            </Text>

            <Pressable
              accessibilityRole="button"
              className="min-h-[48px] items-center justify-center rounded-[18px]"
              onPress={() => {
                void handlePickImageFromLibrary();
              }}
              style={{ backgroundColor: theme.accentPrimary }}
            >
              <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.accentOnPrimary }}>
                Fazer upload
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="min-h-[48px] items-center justify-center rounded-[18px]"
              onPress={() => {
                void handlePickImageFromCamera();
              }}
              style={{ backgroundColor: theme.accentPrimary }}
            >
              <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.accentOnPrimary }}>
                Usar câmera
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="min-h-[48px] items-center justify-center rounded-[18px] border"
              onPress={() => setIsImageSourceModalOpen(false)}
              style={{ borderColor: theme.borderDefault }}
            >
              <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function buildInitialSportContexts(
  initialDraft: QuickPersonDraft,
  modalities: SportModality[],
  frameCounts: ModalityFrameCounts,
): Partial<Record<SportModality, QuickPersonSportContext>> {
  if (initialDraft.sportContexts && Object.keys(initialDraft.sportContexts).length) {
    return initialDraft.sportContexts;
  }

  const modality = initialDraft.modality ?? modalities[0] ?? 'FUTSAL';

  return {
    [modality]: {
      frameType: getDefaultFrameTypeForModality(modality, frameCounts),
      positionCodes: initialDraft.positionCodes,
    },
  };
}

function ensureSportContext(
  currentContexts: Partial<Record<SportModality, QuickPersonSportContext>>,
  modality: SportModality,
  frameCounts: ModalityFrameCounts,
) {
  if (currentContexts[modality]) {
    return currentContexts;
  }

  return {
    ...currentContexts,
    [modality]: {
      frameType: getDefaultFrameTypeForModality(modality, frameCounts),
      positionCodes: [],
    },
  };
}

function syncLegacySportFields(sportContexts: Partial<Record<SportModality, QuickPersonSportContext>>) {
  const firstModality = (Object.keys(sportContexts) as SportModality[])[0] ?? null;

  return {
    modality: firstModality,
    positionCodes: firstModality ? sportContexts[firstModality]?.positionCodes ?? [] : [],
    sportContexts,
  };
}

function getDefaultFrameTypeForModality(
  modality: SportModality,
  frameCounts: ModalityFrameCounts,
): QuickPersonDefaultFrameType {
  return (frameCounts[modality] ?? 1) > 1 ? 'FIRST_FRAME' : 'UNASSIGNED';
}

function getPositionSelectOptions(modality: SportModality): Array<OptionSelectItem<ModalityPositionCode>> {
  return getModalityPositionOptions(modality).map((option) => ({
    group: option.group,
    label: option.label,
    shortLabel: option.shortLabel,
    value: option.code,
  }));
}

function quickHookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

function SportContextPanel({
  activeModality,
  frameCount,
  onChangePositions,
  onSelectFrameType,
  sportContext,
  theme,
}: {
  activeModality: SportModality;
  frameCount: number;
  onChangePositions: (modality: SportModality, positionCodes: ModalityPositionCode[]) => void;
  onSelectFrameType: (modality: SportModality, frameType: QuickPersonDefaultFrameType) => void;
  sportContext?: QuickPersonSportContext;
  theme: TeamExperienceTheme;
}) {
  if (!sportContext) {
    return null;
  }

  return (
    <View
      className="gap-5"
      // style={{ backgroundColor: theme.surfaceBase, borderColor: theme.borderDefault }}
      {...quickHookProps(`quick-person-flow-container-modality-${activeModality.toLowerCase()}-sport-context`)}
    >
      {frameCount > 1 ? (
        <View className="gap-2 max-w-[100px]" {...quickHookProps(`quick-person-flow-container-modality-${activeModality.toLowerCase()}-frame-count`)}>
          <View className="flex-row" {...quickHookProps(`quick-person-flow-container-modality-${activeModality.toLowerCase()}-frame-options`)}>
            {[
              { frameType: 'FIRST_FRAME' as const, label: '1' },
              { frameType: 'SECOND_FRAME' as const, label: '2' },
            ].map((option) => {
              const isFrameSelected = sportContext.frameType === option.frameType;
              const frameCountShapeClass =
                option.frameType === 'FIRST_FRAME' ? 'rounded-tl-[50px] rounded-bl-[50px]' : 'rounded-tr-[50px] rounded-br-[50px]';

              return (
                <Pressable
                  key={option.frameType}
                  accessibilityRole="button"
                  className={`${frameCountShapeClass} min-h-[34px] flex-1 items-center justify-center border px-3 py-1`}
                  onPress={() => onSelectFrameType(activeModality, option.frameType)}
                  // style={{
                  //   backgroundColor: isFrameSelected ? theme.accentPrimary : theme.surfaceCard,
                  //   borderColor: isFrameSelected ? theme.accentPrimary : theme.borderDefault,
                  // }}
                  style={{
                    backgroundColor: isFrameSelected ? `${theme.accentPrimary}22` : theme.surfaceBase,
                    borderColor: isFrameSelected ? theme.accentPrimary : theme.borderDefault,
                  }}
                  {...quickHookProps(`quick-person-flow-button-modality-${activeModality.toLowerCase()}-${option.frameType.toLowerCase()}`)}
                >
                  <Text
                    className="text-[0.9rem] font-bold leading-5"
                    style={{ color: isFrameSelected ? theme.accentPrimary : theme.textPrimary }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-center text-[0.72rem] font-bold leading-4" style={{ color: theme.textMuted }}>
            Quadro
          </Text>
        </View>
      ) : null}

      <OptionSelectField
        label={`Posição - ${getModalityLabel(activeModality)}`}
        modalTitle={`Posições - ${getModalityLabel(activeModality)}`}
        onChange={(value) => onChangePositions(activeModality, value)}
        options={getPositionSelectOptions(activeModality)}
        placeholder="Selecionar posições"
        searchPlaceholder="Buscar posição"
        selectionMode="multi"
        theme={theme}
        value={sportContext.positionCodes}
        {...quickHookProps(`quick-person-flow-select-position-${activeModality.toLowerCase()}`)}
      />
    </View>
  );
}

function WizardField({
  hookId,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  theme,
  value,
}: {
  hookId: string;
  keyboardType?: 'default' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  theme: TeamExperienceTheme;
  value: string;
}) {
  return (
    <View className="gap-2" nativeID={hookId} testID={hookId}>
      <Text className="text-[0.95rem] font-bold leading-5" style={{ color: theme.accentPrimary }}>
        {label}
      </Text>
      <TextInput
        className="min-h-[54px] rounded-[18px] border px-4 text-[1rem]"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={{
          backgroundColor: theme.surfaceBase,
          borderColor: theme.borderDefault,
          borderWidth: 1,
          color: theme.textPrimary,
        }}
        value={value}
        nativeID={`${hookId}-input`}
        testID={`${hookId}-input`}
      />
    </View>
  );
}

function WizardToggleRow({
  description,
  hookId,
  label,
  onValueChange,
  theme,
  value,
}: {
  description?: string;
  hookId: string;
  label: string;
  onValueChange: (value: boolean) => void;
  theme: TeamExperienceTheme;
  value: boolean;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-[18px] border px-4 py-3"
      style={{ backgroundColor: theme.surfaceBase, borderColor: value ? theme.accentPrimary : theme.borderDefault }}
      nativeID={hookId}
      testID={hookId}
    >
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }}>
          {label}
        </Text>
        {description ? (
          <Text className="text-[0.9rem] leading-5" style={{ color: theme.textMuted }}>
            {description}
          </Text>
        ) : null}
      </View>
      <ThemeToggle activeColor={theme.accentPrimary} inactiveColor={theme.borderDefault} onValueChange={onValueChange} value={value} />
    </View>
  );
}
