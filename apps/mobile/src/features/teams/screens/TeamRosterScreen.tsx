import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { QuickPersonFlow, INITIAL_QUICK_PERSON_DRAFT, type QuickPersonDraft } from '../../../components/person/QuickPersonFlow';
import { ThemedTextureBackground } from '../../../components/layout/ThemedTextureBackground';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { TeamExperienceBottomBar } from '../../../components/navigation/TeamExperienceBottomBar';
import {
  resolveExperienceTheme,
  type TeamExperienceTheme,
  type TeamExperienceThemeOverrides,
  type UserThemePreferenceKey,
} from '../../../theme/teamExperienceTheme';
import type { SportModality, TeamSummary } from '../services/teamService';
import { createQuickTeamRosterPerson, fetchTeamRoster, type TeamRosterMember } from '../services/teamRosterService';

type TeamRosterScreenProps = {
  hasUnreadNotifications?: boolean;
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onProfilePress?: () => void;
  preferredThemeKey?: UserThemePreferenceKey | null;
  profileAvatarUrl?: string | null;
  team: TeamSummary;
  themeOverrides?: TeamExperienceThemeOverrides | null;
};

const MODALITY_OPTIONS: SportModality[] = ['FUTSAL', 'FIELD', 'SOCIETY'];

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function TeamRosterScreen({
  hasUnreadNotifications = false,
  onBack,
  onOpenNotifications,
  onProfilePress,
  preferredThemeKey = null,
  profileAvatarUrl = null,
  team,
  themeOverrides = null,
}: TeamRosterScreenProps) {
  const { width } = useWindowDimensions();
  const shellWidth = Math.min(width - 28, 860);
  const experienceAppearance = useMemo(
    () =>
      resolveExperienceTheme({
        context: 'team',
        preferredThemeKey,
        teamOverrides: themeOverrides,
      }),
    [preferredThemeKey, themeOverrides],
  );
  const experienceTheme = experienceAppearance.theme;

  const [members, setMembers] = useState<TeamRosterMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isQuickAddSaving, setIsQuickAddSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const configuredRosterModalities = useMemo(
    () => MODALITY_OPTIONS.filter((modality) => team.modalities.includes(modality)),
    [team.modalities],
  );
  const rosterModalities: SportModality[] = configuredRosterModalities.length ? configuredRosterModalities : ['FUTSAL'];
  const [selectedRosterModality, setSelectedRosterModality] = useState<SportModality>(rosterModalities[0]);

  async function reloadRoster() {
    const nextMembers = await fetchTeamRoster(team.id);
    setMembers(nextMembers);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadRoster() {
      try {
        setIsLoading(true);
        const nextMembers = await fetchTeamRoster(team.id);

        if (!isMounted) {
          return;
        }

        setMembers(nextMembers);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.warn('Could not load team roster.', error);
        setFeedbackMessage('Não foi possível carregar o elenco agora.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRoster();

    return () => {
      isMounted = false;
    };
  }, [team.id]);

  useEffect(() => {
    if (!rosterModalities.includes(selectedRosterModality)) {
      setSelectedRosterModality(rosterModalities[0]);
    }
  }, [rosterModalities, selectedRosterModality]);

  const playerMembers = useMemo(() => members.filter((member) => member.roles.includes('PLAYER')), [members]);
  const committeeMembers = useMemo(() => members.filter((member) => member.roles.includes('COMMITTEE')), [members]);
  const directorMembers = useMemo(() => members.filter((member) => member.roles.includes('DIRECTOR')), [members]);
  const presidentMembers = useMemo(() => members.filter((member) => member.roles.includes('PRESIDENT')), [members]);
  const linkedUserCount = useMemo(() => members.filter((member) => member.hasLinkedUser).length, [members]);

  function closeQuickAddModal() {
    setIsQuickAddOpen(false);
  }

  async function handleSaveQuickAdd(draft: QuickPersonDraft) {
    const fullName = draft.fullName.trim();
    const nickname = draft.nickname.trim();

    if (!fullName && !nickname) {
      setFeedbackMessage('Preencha ao menos nome ou apelido para cadastrar o integrante.');
      return;
    }

    if (!draft.addAsPlayer) {
      setFeedbackMessage('Cadastro rápido persistente salva apenas jogadores do elenco por enquanto.');
      return;
    }

    if (draft.addAsCommittee || draft.addAsDirector || draft.addAsPresident) {
      setFeedbackMessage('Comissão, diretoria e presidência dependem de usuário vinculado. Salve apenas como jogador por enquanto.');
      return;
    }

    try {
      setIsQuickAddSaving(true);
      setFeedbackMessage(null);

      await createQuickTeamRosterPerson(team.id, {
        addAsPlayer: draft.addAsPlayer,
        dominantFoot: draft.dominantFoot,
        fullName,
        modality: draft.addAsPlayer ? draft.modality : null,
        nickname,
        positionCodes: draft.addAsPlayer ? draft.positionCodes : [],
        sportContexts: draft.addAsPlayer ? draft.sportContexts : {},
      });

      await reloadRoster();
      setFeedbackMessage('Integrante salvo no banco.');
      closeQuickAddModal();
    } catch (error) {
      console.warn('Could not save quick roster person.', error);
      setFeedbackMessage('Não foi possível salvar o integrante agora.');
    } finally {
      setIsQuickAddSaving(false);
    }
  }

  return (
    <ThemedTextureBackground baseColor={experienceTheme.surfaceBase} mode={experienceAppearance.mode}>
      <View className="flex-1 bg-transparent" {...hookProps('team-roster-container-main')}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-[110px]"
          showsVerticalScrollIndicator={false}
          {...hookProps('team-roster-container-scroll')}
        >
          <View className="self-center w-full gap-4 px-[14px] pt-3" style={{ maxWidth: shellWidth }} {...hookProps('team-roster-container-shell')}>
            <View className="flex-row items-center justify-between" {...hookProps('team-roster-container-header')}>
              <BackCircleButton onPress={onBack} theme={experienceTheme} {...hookProps('team-roster-button-back')} />
              <Text
                className="font-slab text-[1.5rem] leading-[1.8rem]"
                style={{ color: experienceTheme.accentPrimary }}
                {...hookProps('team-roster-text-title')}
              >
                Elenco do time
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-[42px] min-w-[42px] items-center justify-center rounded-full px-2"
                onPress={() => setIsQuickAddOpen(true)}
                style={{ backgroundColor: experienceTheme.surfaceCard }}
                {...hookProps('team-roster-button-quick-add')}
              >
                <Ionicons color={experienceTheme.accentPrimary} name="person-add-outline" size={20} />
              </Pressable>
            </View>

            <View {...hookProps('team-roster-card-summary')}>
              <View className="max-w-[500px] flex-row gap-3" {...hookProps('team-roster-container-summary-metrics')}>
                <RosterMetricCard label="Integrantes" theme={experienceTheme} value={members.length} {...hookProps('team-roster-metric-members')} />
                <RosterMetricCard label="Jogadores" theme={experienceTheme} value={playerMembers.length} {...hookProps('team-roster-metric-players')} />
                <RosterMetricCard label="Usuários" theme={experienceTheme} value={linkedUserCount} {...hookProps('team-roster-metric-linked-users')} />
              </View>
            </View>

            {feedbackMessage ? (
              <View
                className="rounded-[18px] border px-4 py-3"
                style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault }}
                {...hookProps('team-roster-container-feedback')}
              >
                <Text className="text-[0.95rem] leading-5" style={{ color: experienceTheme.textMuted }} {...hookProps('team-roster-text-feedback')}>
                  {feedbackMessage}
                </Text>
              </View>
            ) : null}

            {isLoading ? (
              <View
                className="rounded-[26px] border p-4"
                style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault }}
                {...hookProps('team-roster-card-loading')}
              >
                <Text className="text-[1rem] leading-6" style={{ color: experienceTheme.textMuted }}>
                  Carregando elenco...
                </Text>
              </View>
            ) : (
              <View className="gap-4" {...hookProps('team-roster-container-sections')}>
                <RosterPlayersByModality
                  members={playerMembers}
                  modalities={rosterModalities}
                  onSelectModality={setSelectedRosterModality}
                  selectedModality={selectedRosterModality}
                  team={team}
                  theme={experienceTheme}
                />
                <RosterSection
                  emptyLabel="Nenhuma presidência cadastrada ainda."
                  iconFamily="material-community"
                  iconName="crown-outline"
                  members={presidentMembers}
                  sectionKey="presidents"
                  theme={experienceTheme}
                  title="Presidência"
                />
                <RosterSection
                  emptyLabel="Nenhum diretor cadastrado ainda."
                  iconName="briefcase-outline"
                  members={directorMembers}
                  sectionKey="directors"
                  theme={experienceTheme}
                  title="Diretoria"
                />
                <RosterSection
                  emptyLabel="Nenhum integrante de comissão cadastrado ainda."
                  iconName="people-outline"
                  members={committeeMembers}
                  sectionKey="committee"
                  theme={experienceTheme}
                  title="Comissão"
                />
              </View>
            )}
          </View>
        </ScrollView>

        <TeamExperienceBottomBar
          activeKey={null}
          hasUnreadNotifications={hasUnreadNotifications}
          onNotificationsPress={onOpenNotifications}
          onProfilePress={onProfilePress}
          profileAvatarUrl={profileAvatarUrl}
          theme={experienceTheme}
        />

        <Modal animationType="fade" transparent visible={isQuickAddOpen} onRequestClose={closeQuickAddModal}>
          <View className="flex-1 items-center justify-center bg-black/70 px-4" {...hookProps('team-roster-modal-quick-add-overlay')}>
            <View className="w-full max-w-[420px]" {...hookProps('team-roster-modal-quick-add-card')}>
              <QuickPersonFlow
                availableModalityFrameCounts={team.modality_frame_counts}
                availableModalities={team.modalities.length ? team.modalities : ['FUTSAL']}
                canAssignLeadershipRoles
                initialDraft={INITIAL_QUICK_PERSON_DRAFT}
                mode="roster"
                onCancel={closeQuickAddModal}
                onSubmit={handleSaveQuickAdd}
                theme={experienceTheme}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ThemedTextureBackground>
  );
}

function RosterMetricCard({
  label,
  theme,
  value,
  ...props
}: {
  label: string;
  theme: TeamExperienceTheme;
  value: number;
  nativeID?: string;
  testID?: string;
}) {
  return (
    <View className="flex-1 rounded-[20px] border px-4 py-3" style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }} {...props}>
      <Text className="mb-2 text-center font-slab text-4xl" style={{ color: theme.accentPrimary }}>
        {value}
      </Text>
      <Text className="w-full truncate text-center text-[0.8rem] uppercase leading-4" style={{ color: theme.textMuted }}>
        {label}
      </Text>
    </View>
  );
}

function RosterPlayersByModality({
  members,
  modalities,
  onSelectModality,
  selectedModality,
  team,
  theme,
}: {
  members: TeamRosterMember[];
  modalities: SportModality[];
  onSelectModality: (modality: SportModality) => void;
  selectedModality: SportModality;
  team: TeamSummary;
  theme: TeamExperienceTheme;
}) {
  const selectedFrameCount = team.modality_frame_counts[selectedModality] ?? 1;
  const modalityMembers = members.filter((member) => hasPlayerModality(member, selectedModality));
  const relatedMembers = modalityMembers.filter((member) => isMemberAssignedToFrame(member, selectedModality, selectedFrameCount));
  const unassignedMembers = modalityMembers.filter((member) => !relatedMembers.some((related) => related.id === member.id));
  const frameGroups = selectedFrameCount === 2
    ? [
        { frameType: 'FIRST_FRAME' as const, label: '1º quadro' },
        { frameType: 'SECOND_FRAME' as const, label: '2º quadro' },
      ]
    : [{ frameType: 'UNASSIGNED' as const, label: 'Quadro único' }];

  return (
    <View className="gap-4" {...hookProps('team-roster-container-player-modality-area')}>
      {modalities.length > 1 ? (
        <View
          className="max-w-lg"
          // className="gap-3 rounded-[26px] border p-4"
          // style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
          {...hookProps('team-roster-card-modality-filters')}
        >
          {/*<Text className="font-slab text-[1.35rem] leading-5" style={{ color: theme.accentPrimary }} {...hookProps('team-roster-text-modality-filters-title')}>
            Modalidade
          </Text>*/}
          <View className="flex-row flex-wrap gap-[10px]" {...hookProps('team-roster-container-modality-filters')}>
            {modalities.map((modality) => {
              const isSelected = modality === selectedModality;

              return (
                <Pressable
                  accessibilityRole="button"
                  className="rounded-full border px-[14px] py-[10px] flex-1"
                  key={modality}
                  onPress={() => onSelectModality(modality)}
                  style={{
                    backgroundColor: isSelected ? theme.accentPrimary : theme.surfaceBase,
                    borderColor: isSelected ? theme.accentPrimary : theme.borderDefault,
                  }}
                  {...hookProps(`team-roster-button-modality-filter-${modality.toLowerCase()}`)}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons color={isSelected ? theme.accentOnPrimary : theme.accentPrimary} name="football-outline" size={16} />
                    <Text
                      className="text-center text-base font-bold leading-6"
                      style={{ color: isSelected ? theme.accentOnPrimary : theme.textPrimary }}
                      {...hookProps(`team-roster-text-modality-filter-${modality.toLowerCase()}`)}
                    >
                      {getModalityLabel(modality)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View
        className="gap-4 rounded-[26px] border p-4"
        style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
        {...hookProps(`team-roster-card-players-by-frame-${selectedModality.toLowerCase()}`)}
      >
        <View className="min-w-0 flex-row items-start gap-2">
          <MaterialCommunityIcons color={theme.accentPrimary} name="run-fast" size={22} />
          <Text className="min-w-0 flex-1 flex-wrap font-slab text-[1.35rem] leading-5" style={{ color: theme.accentPrimary }} {...hookProps('team-roster-text-players-by-frame-title')}>
            Jogadores do elenco
          </Text>
        </View>

        <View className="gap-3" {...hookProps(`team-roster-container-frame-groups-${selectedModality.toLowerCase()}`)}>
          {frameGroups.map((frameGroup, index) => {
            const frameMembers = modalityMembers.filter(
              (member) => member.frameDefaultsByModality[selectedModality] === frameGroup.frameType,
            );

            return (
              <View
                className="gap-3 rounded-[20px] border px-3 py-3"
                key={frameGroup.frameType}
                style={{ backgroundColor: theme.surfaceBase, borderColor: `${theme.borderDefault}70` }}
                {...hookProps(`team-roster-container-frame-${selectedModality.toLowerCase()}-${index + 1}`)}
              >
                <Text className="text-[0.9rem] font-bold uppercase leading-5" style={{ color: theme.textMuted }} {...hookProps(`team-roster-text-frame-${selectedModality.toLowerCase()}-${index + 1}`)}>
                  {frameGroup.label}
                </Text>
                {frameMembers.length ? (
                  <View className="gap-3" {...hookProps(`team-roster-container-frame-members-${selectedModality.toLowerCase()}-${index + 1}`)}>
                    {frameMembers.map((member) => (
                      <RosterMemberRow
                        key={member.id}
                        member={member}
                        modality={selectedModality}
                        rowKey={`frame-${selectedModality.toLowerCase()}-${frameGroup.frameType.toLowerCase()}-${member.id}`}
                        showPlayerBadge
                        theme={theme}
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="text-[0.95rem] leading-6" style={{ color: theme.textMuted }} {...hookProps(`team-roster-text-frame-empty-${selectedModality.toLowerCase()}-${index + 1}`)}>
                    Nenhum jogador relacionado neste quadro.
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {unassignedMembers.length ? (
        <View
          className="gap-3 rounded-[26px] border p-4"
          style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
          {...hookProps(`team-roster-card-unassigned-players-${selectedModality.toLowerCase()}`)}
        >
          <Text className="font-slab text-[1.35rem] leading-5" style={{ color: theme.accentPrimary }} {...hookProps('team-roster-text-unassigned-players-title')}>
            Sem quadro definido
          </Text>
          <View className="gap-3" {...hookProps(`team-roster-container-unassigned-players-${selectedModality.toLowerCase()}`)}>
            {unassignedMembers.map((member) => (
              <RosterMemberRow
                key={member.id}
                member={member}
                modality={selectedModality}
                rowKey={`unassigned-${selectedModality.toLowerCase()}-${member.id}`}
                showPlayerBadge
                theme={theme}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function RosterSection({
  emptyLabel,
  iconFamily = 'ionicons',
  iconName,
  members,
  sectionKey,
  theme,
  title,
}: {
  emptyLabel: string;
  iconFamily?: 'ionicons' | 'material-community';
  iconName?: React.ComponentProps<typeof Ionicons>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  members: TeamRosterMember[];
  sectionKey: string;
  theme: TeamExperienceTheme;
  title: string;
}) {
  const showPlayerBadge = sectionKey === 'players';

  return (
    <View
      className="gap-3 rounded-[26px] border p-4"
      style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
      {...hookProps(`team-roster-section-${sectionKey}`)}
    >
      <View className="min-w-0 flex-row items-start gap-2">
        {iconName && iconFamily === 'material-community' ? (
          <MaterialCommunityIcons color={theme.accentPrimary} name={iconName as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={22} />
        ) : iconName ? (
          <Ionicons color={theme.accentPrimary} name={iconName as React.ComponentProps<typeof Ionicons>['name']} size={21} />
        ) : null}
        <Text className="min-w-0 flex-1 flex-wrap font-slab text-[1.35rem] leading-5" style={{ color: theme.accentPrimary }} {...hookProps(`team-roster-section-${sectionKey}-title`)}>
          {title}
        </Text>
      </View>

      {members.length ? (
        <View className="gap-3" {...hookProps(`team-roster-section-${sectionKey}-list`)}>
          {members.map((member) => (
            <View
              key={member.id}
              className="flex-row gap-3 border-b pb-5 pt-1 last:border-0 last:pb-0"
              style={{ borderColor: `${theme.borderDefault}50` }}
              {...hookProps(`team-roster-member-${member.id}`)}
            >
              <View
                className="h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full"
                style={{ backgroundColor: theme.surfaceCard, borderColor: theme.accentPrimary, borderWidth: 1 }}
              >
                {member.avatarUrl ? (
                  <Image
                    resizeMode="cover"
                    source={{ uri: member.avatarUrl }}
                    style={{ height: '100%', width: '100%' }}
                    {...hookProps(`team-roster-member-${member.id}-avatar-image`)}
                  />
                ) : (
                  <Ionicons color={theme.accentPrimary} name="person-outline" size={18} />
                )}
              </View>

              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }}>
                  {member.shirtNumber ? `${member.shirtNumber} ` : ''}
                  {member.displayName}
                </Text>

                {showPlayerBadge && member.roles.includes('PLAYER') ? (
                  <Text
                    className="w-fit rounded-full border px-2 py-1 text-[0.9rem] leading-5"
                    style={{ color: theme.textMuted, borderColor: `${theme.textMuted}50`, borderWidth: 1 }}
                  >
                    {member.positionLabel || 'Posição em definição'}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-[0.95rem] leading-6" style={{ color: theme.textMuted }} {...hookProps(`team-roster-section-${sectionKey}-empty`)}>
          {emptyLabel}
        </Text>
      )}
    </View>
  );
}

function RosterMemberRow({
  member,
  modality,
  rowKey,
  showPlayerBadge,
  theme,
}: {
  member: TeamRosterMember;
  modality?: SportModality;
  rowKey: string;
  showPlayerBadge: boolean;
  theme: TeamExperienceTheme;
}) {
  const positionLabel = modality
    ? member.positionLabelsByModality[modality]?.join(', ') ?? null
    : member.positionLabel;

  return (
    <View
      className="flex-row gap-3 border-b pb-5 pt-1 last:border-0 last:pb-0"
      style={{ borderColor: `${theme.borderDefault}50` }}
      {...hookProps(`team-roster-member-${rowKey}`)}
    >
      <View
        className="h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: theme.surfaceCard, borderColor: theme.accentPrimary, borderWidth: 1 }}
      >
        {member.avatarUrl ? (
          <Image
            resizeMode="cover"
            source={{ uri: member.avatarUrl }}
            style={{ height: '100%', width: '100%' }}
            {...hookProps(`team-roster-member-${rowKey}-avatar-image`)}
          />
        ) : (
          <Ionicons color={theme.accentPrimary} name="person-outline" size={18} />
        )}
      </View>

      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }}>
          {member.shirtNumber ? `${member.shirtNumber} ` : ''}
          {member.displayName}
        </Text>

        {showPlayerBadge && member.roles.includes('PLAYER') ? (
          <Text
            className="w-fit rounded-full border px-2 py-1 text-[0.9rem] leading-5"
            style={{ color: theme.textMuted, borderColor: `${theme.textMuted}50`, borderWidth: 1 }}
          >
            {positionLabel || 'Posição em definição'}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function hasPlayerModality(member: TeamRosterMember, modality: SportModality) {
  const modalityPositions = member.positionLabelsByModality[modality];
  return !Object.keys(member.positionLabelsByModality).length || Boolean(modalityPositions?.length);
}

function isMemberAssignedToFrame(member: TeamRosterMember, modality: SportModality, frameCount: number) {
  const frameType = member.frameDefaultsByModality[modality];
  return frameType === 'FIRST_FRAME' || frameType === 'SECOND_FRAME' || (frameCount === 1 && frameType === 'UNASSIGNED');
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
