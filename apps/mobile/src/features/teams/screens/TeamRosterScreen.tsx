import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { getModalityPositionLabel } from '../../../config/modalityPositions';
import { QuickPersonFlow, INITIAL_QUICK_PERSON_DRAFT, buildRosterRolesFromQuickPersonDraft, type QuickPersonDraft } from '../../../components/person/QuickPersonFlow';
import { ThemedTextureBackground } from '../../../components/layout/ThemedTextureBackground';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { TeamExperienceBottomBar } from '../../../components/navigation/TeamExperienceBottomBar';
import {
  resolveExperienceTheme,
  type TeamExperienceTheme,
  type TeamExperienceThemeOverrides,
  type UserThemePreferenceKey,
} from '../../../theme/teamExperienceTheme';
import type { TeamSummary } from '../services/teamService';
import { fetchTeamRoster, type TeamRosterMember } from '../services/teamRosterService';

type TeamRosterScreenProps = {
  hasUnreadNotifications?: boolean;
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onProfilePress?: () => void;
  preferredThemeKey?: UserThemePreferenceKey | null;
  team: TeamSummary;
  themeOverrides?: TeamExperienceThemeOverrides | null;
};

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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

  const playerMembers = useMemo(() => members.filter((member) => member.roles.includes('PLAYER')), [members]);
  const committeeMembers = useMemo(() => members.filter((member) => member.roles.includes('COMMITTEE')), [members]);
  const directorMembers = useMemo(() => members.filter((member) => member.roles.includes('DIRECTOR')), [members]);
  const presidentMembers = useMemo(() => members.filter((member) => member.roles.includes('PRESIDENT')), [members]);
  const linkedUserCount = useMemo(() => members.filter((member) => member.hasLinkedUser).length, [members]);

  function closeQuickAddModal() {
    setIsQuickAddOpen(false);
  }

  function handleSaveQuickAdd(draft: QuickPersonDraft) {
    const fullName = draft.fullName.trim();
    const nickname = draft.nickname.trim();

    if (!fullName && !nickname) {
      setFeedbackMessage('Preencha ao menos nome ou apelido para cadastrar o integrante.');
      return;
    }

    const nextMember: TeamRosterMember = {
      avatarUrl: draft.avatarUrl,
      displayName: nickname || fullName,
      fullName: fullName || null,
      hasLinkedUser: false,
      id: `local-${Date.now()}`,
      isOperational: true,
      joinedAtLabel: 'Cadastro rápido do time',
      nickname: nickname || null,
      positionLabel:
        draft.addAsPlayer && draft.modality && draft.positionCodes.length
          ? draft.positionCodes.map((positionCode) => getModalityPositionLabel(draft.modality!, positionCode)).join(', ')
          : draft.addAsPlayer
            ? 'Posição em definição'
            : null,
      roles: buildRosterRolesFromQuickPersonDraft(draft),
      shirtNumber: draft.shirtNumber.trim() ? Number(draft.shirtNumber.trim()) : null,
    };

    setMembers((current) => [nextMember, ...current]);
    setFeedbackMessage('Integrante adicionado ao elenco local da tela.');
    closeQuickAddModal();
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
                <RosterSection
                  emptyLabel="Nenhum jogador cadastrado ainda."
                  members={playerMembers}
                  sectionKey="players"
                  theme={experienceTheme}
                  title="Jogadores do elenco"
                />
                <RosterSection
                  emptyLabel="Nenhuma presidência cadastrada ainda."
                  members={presidentMembers}
                  sectionKey="presidents"
                  theme={experienceTheme}
                  title="Presidência"
                />
                <RosterSection
                  emptyLabel="Nenhum diretor cadastrado ainda."
                  members={directorMembers}
                  sectionKey="directors"
                  theme={experienceTheme}
                  title="Diretoria"
                />
                <RosterSection
                  emptyLabel="Nenhum integrante de comissão cadastrado ainda."
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
          theme={experienceTheme}
        />

        <Modal animationType="fade" transparent visible={isQuickAddOpen} onRequestClose={closeQuickAddModal}>
          <View className="flex-1 items-center justify-center bg-black/70 px-4" {...hookProps('team-roster-modal-quick-add-overlay')}>
            <View className="w-full max-w-[420px]" {...hookProps('team-roster-modal-quick-add-card')}>
              <QuickPersonFlow
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

function RosterSection({
  emptyLabel,
  members,
  sectionKey,
  theme,
  title,
}: {
  emptyLabel: string;
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
      <Text className="font-slab text-[1.35rem] leading-5" style={{ color: theme.accentPrimary }} {...hookProps(`team-roster-section-${sectionKey}-title`)}>
        {title}
      </Text>

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
