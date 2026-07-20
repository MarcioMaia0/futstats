import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { ThemeToggle } from '../../../components/inputs/ThemeToggle';
import { ThemedTextureBackground } from '../../../components/layout/ThemedTextureBackground';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { TeamExperienceBottomBar } from '../../../components/navigation/TeamExperienceBottomBar';
import { getModalityLabel } from '../../../config/modalityPositions';
import {
  resolveExperienceTheme,
  type TeamExperienceTheme,
  type TeamExperienceThemeOverrides,
  type UserThemePreferenceKey,
} from '../../../theme/teamExperienceTheme';
import type { ApprovedMembershipMode, ModalityFrameCounts, SportModality, TeamSummary } from '../../teams/services/teamService';
import {
  NotificationCard,
  type NotificationCardItem,
  type NotificationFilterKey,
} from '../components/NotificationCard';
import {
  approveJoinRequest,
  fetchNotificationsFeed,
  markNotificationRead,
  rejectJoinRequest,
} from '../services/notificationsService';

type NotificationsScreenProps = {
  hasUnreadNotifications?: boolean;
  initialJoinRequestWizardOpen?: boolean;
  onBack?: () => void;
  onOpenAnalyzeJoinRequest?: (joinRequestId: string, teamId: string) => void;
  onOpenAgenda?: () => void;
  onOpenSettings?: () => void;
  onProfilePress?: () => void;
  onReturnHome?: () => void;
  onUnreadNotificationsChange?: (hasUnread: boolean) => void;
  preferredThemeKey?: UserThemePreferenceKey | null;
  profileAvatarUrl?: string | null;
  team?: TeamSummary | null;
  themeOverrides?: TeamExperienceThemeOverrides | null;
};

type ApprovalToggles = {
  committee: boolean;
  director: boolean;
  player: boolean;
  president: boolean;
};

type ApprovalPlayerFrameType = 'UNASSIGNED' | 'FIRST_FRAME' | 'SECOND_FRAME';

type ApprovalPlayerSportContext = {
  frameType: ApprovalPlayerFrameType;
};

type NotificationLeadVisual =
  | { kind: 'team'; crestUrl?: string | null }
  | { kind: 'person'; avatarUrl?: string | null }
  | { kind: 'icon'; icon: ComponentProps<typeof Ionicons>['name'] };

const FILTERS: Array<{ key: NotificationFilterKey; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'attention', label: 'Não lida' },
  { key: 'team', label: 'Time' },
  { key: 'social', label: 'Social' },
  { key: 'games', label: 'Jogos' },
];

const EMPTY_APPROVAL_TOGGLES: ApprovalToggles = {
  committee: false,
  director: false,
  player: false,
  president: false,
};

const FAKE_JOIN_REQUEST_ID = 'fake-join-request-preview';
const FAKE_JOIN_REQUEST_MODALITIES: SportModality[] = ['FUTSAL', 'SOCIETY'];
const FAKE_JOIN_REQUEST_FRAME_COUNTS: ModalityFrameCounts = {
  FUTSAL: 2,
  SOCIETY: 2,
};

function hasNotificationAttention(item: NotificationCardItem) {
  return !item.read || item.pendingAction;
}

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function NotificationsScreen({
  hasUnreadNotifications = false,
  initialJoinRequestWizardOpen = false,
  onBack,
  onOpenAgenda,
  onOpenSettings,
  onProfilePress,
  onReturnHome,
  onUnreadNotificationsChange,
  preferredThemeKey = null,
  profileAvatarUrl = null,
  team = null,
  themeOverrides = null,
}: NotificationsScreenProps) {
  const { height } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState<NotificationFilterKey>('team');
  const [notificationsState, setNotificationsState] = useState<NotificationCardItem[]>([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [selectedApprovalMode, setSelectedApprovalMode] = useState<ApprovedMembershipMode | null>(null);
  const [approvalToggles, setApprovalToggles] = useState<ApprovalToggles>(EMPTY_APPROVAL_TOGGLES);
  const [approvalPlayerSportContexts, setApprovalPlayerSportContexts] = useState<
    Partial<Record<SportModality, ApprovalPlayerSportContext>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const experienceAppearance = useMemo(
    () =>
      resolveExperienceTheme({
        context: team ? 'team' : 'app',
        preferredThemeKey,
        teamOverrides: team ? themeOverrides : null,
      }),
    [preferredThemeKey, team, themeOverrides],
  );
  const experienceTheme = experienceAppearance.theme;
  const modalMaxHeight = Math.max(220, height - 24);
  const approvalModalities = useMemo(
    () =>
      normalizeApprovalModalities(
        team?.modalities?.length ? team.modalities : initialJoinRequestWizardOpen ? FAKE_JOIN_REQUEST_MODALITIES : [],
      ),
    [initialJoinRequestWizardOpen, team?.modalities],
  );
  const approvalFrameCounts = useMemo(
    () => ({
      ...(initialJoinRequestWizardOpen ? FAKE_JOIN_REQUEST_FRAME_COUNTS : {}),
      ...(team?.modality_frame_counts ?? {}),
    }),
    [initialJoinRequestWizardOpen, team?.modality_frame_counts],
  );

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        if (initialJoinRequestWizardOpen) {
          const fakeJoinRequest = buildFakeJoinRequestNotification(team);

          if (!isMounted) {
            return;
          }

          setNotificationsState([fakeJoinRequest]);
          setSelectedNotificationId(fakeJoinRequest.id);
          setSelectedApprovalMode(null);
          setApprovalToggles(EMPTY_APPROVAL_TOGGLES);
          setApprovalPlayerSportContexts({});
          onUnreadNotificationsChange?.(true);
          return;
        }

        const result = await fetchNotificationsFeed(team);

        if (!isMounted) {
          return;
        }

        setNotificationsState(result.items);
        setSelectedNotificationId(null);
        setSelectedApprovalMode(null);
        setApprovalToggles(EMPTY_APPROVAL_TOGGLES);
        setApprovalPlayerSportContexts({});
        onUnreadNotificationsChange?.(result.items.some(hasNotificationAttention));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.warn('Could not load notifications.', error);
        setNotificationsState([]);
        setErrorMessage('Não foi possível carregar as notificações agora.');
        onUnreadNotificationsChange?.(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [initialJoinRequestWizardOpen, onUnreadNotificationsChange, team]);

  const selectedNotification = useMemo(
    () => notificationsState.find((item) => item.id === selectedNotificationId) ?? null,
    [notificationsState, selectedNotificationId],
  );

  useEffect(() => {
    if (selectedNotification?.type !== 'TEAM_JOIN_REQUEST_CREATED') {
      setSelectedApprovalMode(null);
      setApprovalToggles(EMPTY_APPROVAL_TOGGLES);
      setApprovalPlayerSportContexts({});
      return;
    }

    const nextToggles = mapApprovalModeToToggles(selectedApprovalMode);
    setApprovalToggles(nextToggles);
  }, [selectedApprovalMode, selectedNotification]);

  const filteredNotifications = useMemo(
    () =>
      notificationsState.filter((item) => {
        if (activeFilter === 'all') {
          return true;
        }

        if (activeFilter === 'attention') {
          return hasNotificationAttention(item);
        }

        if (activeFilter === 'team') {
          return item.type.startsWith('TEAM_') || item.type === 'PLAYER_WELCOME_PUBLISHED';
        }

        if (activeFilter === 'social') {
          return item.type === 'SOCIAL_CONNECTION_ATTENTION';
        }

        return item.type === 'MATCH_REMINDER';
      }),
    [activeFilter, notificationsState],
  );

  async function reloadNotifications(options?: { keepModalClosed?: boolean }) {
    const result = await fetchNotificationsFeed(team);
    setNotificationsState(result.items);
        onUnreadNotificationsChange?.(result.items.some(hasNotificationAttention));

    if (options?.keepModalClosed !== false) {
      setSelectedNotificationId(null);
      setSelectedApprovalMode(null);
      setApprovalToggles(EMPTY_APPROVAL_TOGGLES);
    }
  }

  function markNotificationAsReadLocally(id: string) {
    setNotificationsState((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, read: true } : item));
      onUnreadNotificationsChange?.(next.some(hasNotificationAttention));
      return next;
    });
  }

  function handleOpenNotification(item: NotificationCardItem) {
    if (!item.read) {
      markNotificationAsReadLocally(item.id);
      void markNotificationRead(item.id).catch((error) => {
        console.warn('Could not mark notification as read.', error);
      });
    }

    setSelectedNotificationId(item.id);
  }

  function handleCloseNotificationModal() {
    setSelectedNotificationId(null);
    setSelectedApprovalMode(null);
    setApprovalToggles(EMPTY_APPROVAL_TOGGLES);
    setApprovalPlayerSportContexts({});
  }

  function handleToggleApprovalRole(role: keyof ApprovalToggles, value: boolean) {
    setApprovalToggles((current) => {
      const next = {
        ...current,
        [role]: value,
      };

      if (role === 'committee' && value) {
        next.director = false;
        next.president = false;
      }

      if (role === 'director' && value) {
        next.committee = false;
        next.president = false;
      }

      if (role === 'president' && value) {
        next.committee = false;
        next.director = false;
      }

      const derivedMode = resolveApprovalModeFromToggles(next);
      setSelectedApprovalMode(derivedMode);

      if (role === 'player') {
        if (value) {
          const fallbackModality = approvalModalities[0] ?? null;

          if (fallbackModality) {
            setApprovalPlayerSportContexts((contexts) =>
              ensureApprovalPlayerSportContext(contexts, fallbackModality, approvalFrameCounts),
            );
          }
        } else {
          setApprovalPlayerSportContexts({});
        }
      }

      return next;
    });
  }

  function handleSelectApprovalPlayerModality(modality: SportModality) {
    setApprovalPlayerSportContexts((contexts) => toggleApprovalPlayerSportContext(contexts, modality, approvalFrameCounts));
  }

  function handleSelectApprovalPlayerFrameType(modality: SportModality, frameType: ApprovalPlayerFrameType) {
    setApprovalPlayerSportContexts((contexts) => {
      const currentContext = contexts[modality] ?? {
        frameType: getDefaultApprovalFrameTypeForModality(modality, approvalFrameCounts),
      };

      return {
        ...contexts,
        [modality]: {
          ...currentContext,
          frameType,
        },
      };
    });
  }

  async function handleApproveJoinRequest(item: NotificationCardItem) {
    if (item.type !== 'TEAM_JOIN_REQUEST_CREATED' || !item.joinRequestId || !selectedApprovalMode) {
      return;
    }

    if (initialJoinRequestWizardOpen && item.joinRequestId === FAKE_JOIN_REQUEST_ID) {
      handleCloseNotificationModal();
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await approveJoinRequest(item.joinRequestId, selectedApprovalMode);
      await reloadNotifications();
    } catch (error) {
      console.warn('Could not approve join request.', error);
      setErrorMessage('Não foi possível aprovar essa solicitação agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRejectJoinRequest(item: NotificationCardItem) {
    if (item.type !== 'TEAM_JOIN_REQUEST_CREATED' || !item.joinRequestId) {
      return;
    }

    if (initialJoinRequestWizardOpen && item.joinRequestId === FAKE_JOIN_REQUEST_ID) {
      handleCloseNotificationModal();
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await rejectJoinRequest(item.joinRequestId);
      await reloadNotifications();
    } catch (error) {
      console.warn('Could not reject join request.', error);
      setErrorMessage('Não foi possível dispensar essa solicitação agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedTextureBackground baseColor={experienceTheme.surfaceBase} mode={experienceAppearance.mode}>
      <View className="flex-1 bg-transparent" {...hookProps('notifications-container-main')}>
        <View className="flex-row items-center justify-between px-4 pb-4 pt-3" {...hookProps('notifications-container-header')}>
          <BackCircleButton onPress={onBack} theme={experienceTheme} {...hookProps('notifications-button-back')} />
          <View className="items-end gap-1" {...hookProps('notifications-container-header-text')}>
            <Text
              className="font-slab text-[1.5rem] leading-[1.8rem]"
              style={{ color: experienceTheme.accentPrimary }}
              {...hookProps('notifications-text-title')}
            >
              Notificações
            </Text>
          </View>
          <View className="h-[42px] w-[42px]" />
        </View>

        <View className="flex-1" {...hookProps('notifications-container-body')}>
          <View className="px-4 pb-3" {...hookProps('notifications-container-filters-shell')}>
            <View className="flex-row flex-wrap gap-2" {...hookProps('notifications-container-filters')}>
              {FILTERS.map((filter) => {
                const active = filter.key === activeFilter;

                return (
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-8 items-center justify-center rounded-full px-3 py-[6px]"
                    key={filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                    style={{
                      backgroundColor: active ? experienceTheme.accentPrimary : 'transparent',
                      borderColor: active ? experienceTheme.accentPrimary : experienceTheme.borderDefault,
                      borderWidth: 1,
                    }}
                    {...hookProps(`notifications-filter-${filter.key}`)}
                  >
                    <Text
                      className="text-[14px] font-bold leading-4"
                      style={{ color: active ? experienceTheme.accentOnPrimary : experienceTheme.textPrimary }}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 px-4 pb-[120px]"
            showsVerticalScrollIndicator={false}
            {...hookProps('notifications-container-scroll')}
          >
            {errorMessage ? (
              <View
                className="rounded-[26px] border px-5 py-4"
                style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault }}
                {...hookProps('notifications-card-error')}
              >
                <Text className="text-[0.95rem] leading-6" style={{ color: experienceTheme.textPrimary }}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {isLoading ? (
              <View
                className="rounded-[26px] border px-5 py-6"
                style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault }}
                {...hookProps('notifications-card-loading')}
              >
                <Text className="font-slab text-[1.3rem] leading-[1.6rem]" style={{ color: experienceTheme.accentPrimary }}>
                  Carregando notificações
                </Text>
                <Text className="mt-2 text-[0.95rem] leading-6" style={{ color: experienceTheme.textMuted }}>
                  Buscando atualizações do time, do social e dos jogos.
                </Text>
              </View>
            ) : filteredNotifications.length ? (
              filteredNotifications.map((item) => (
                <NotificationCard item={item} key={item.id} onPress={handleOpenNotification} theme={experienceTheme} />
              ))
            ) : (
              <View
                className="mt-5 rounded-[26px] border border-dashed px-5 py-6"
                style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault }}
                {...hookProps('notifications-card-empty')}
              >
                <Text className="text-center text-[1rem] leading-[1.6rem]" style={{ color: experienceTheme.textMuted }}>
                  Nenhuma notificação aqui
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <TeamExperienceBottomBar
          activeKey="notifications"
          hasUnreadNotifications={hasUnreadNotifications}
          onHomePress={onReturnHome}
          onProfilePress={onProfilePress}
          profileAvatarUrl={profileAvatarUrl}
          theme={experienceTheme}
        />

        <Modal animationType="fade" transparent visible={selectedNotification !== null} onRequestClose={handleCloseNotificationModal}>
          <View className="flex-1 items-center justify-center bg-black/75 px-4 py-3" {...hookProps('notifications-modal-overlay')}>
            {selectedNotification ? (
              <View
                className="w-full max-w-[360px] overflow-hidden rounded-[28px] border"
                style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, maxHeight: modalMaxHeight }}
                {...hookProps('notifications-modal-card')}
              >
                <ScrollView
                  contentContainerClassName="gap-4 p-4"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  {...hookProps('notifications-modal-scroll')}
                >
                <View className="gap-3" {...hookProps('notifications-modal-body')}>
                  <View className="flex-row items-start gap-3" {...hookProps('notifications-modal-origin')}>
                    <View className="h-[58px] w-[58px] items-center justify-center" {...hookProps('notifications-modal-origin-avatar')}>
                      {renderNotificationLeadVisual(selectedNotification, experienceTheme)}
                    </View>
                    <View className="min-w-0 flex-1 gap-1" {...hookProps('notifications-modal-origin-copy')}>
                      <View className="flex-row justify-between">
                        <View className="flex-1 pr-3">
                          <Text
                            className="font-slab text-[1.3rem] leading-6"
                            style={{ color: experienceTheme.accentPrimary }}
                            {...hookProps('notifications-modal-origin-title')}
                          >
                            {getNotificationOriginTitle(selectedNotification)}
                          </Text>
                          <Text
                            className="text-[0.95rem] leading-6"
                            style={{ color: experienceTheme.textMuted }}
                            {...hookProps('notifications-modal-timestamp')}
                          >
                            {formatNotificationModalTimestamp(selectedNotification.createdAt)}
                          </Text>
                        </View>

                        <Pressable
                          accessibilityRole="button"
                          className="h-[42px] w-[42px] items-center justify-center rounded-full"
                          onPress={handleCloseNotificationModal}
                          {...hookProps('notifications-modal-button-close')}
                        >
                          <Ionicons color={experienceTheme.textMuted} name="close" size={18} />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  <Text
                    className="text-[1rem] leading-6"
                    style={{ color: experienceTheme.textPrimary }}
                    {...hookProps('notifications-modal-description')}
                  >
                    {getModalDescription(selectedNotification)}
                  </Text>

                  {selectedNotification.type === 'TEAM_JOIN_REQUEST_CREATED' && selectedNotification.applicantSubtitle ? (
                    <View className="gap-2" {...hookProps('notifications-modal-join-request-summary')}>
                      <Text className="text-[0.95rem] leading-6" style={{ color: experienceTheme.textMuted }}>
                        {selectedNotification.applicantSubtitle}
                      </Text>
                    </View>
                  ) : null}

                  {selectedNotification.type === 'TEAM_JOIN_REQUEST_CREATED' ? (
                    <View className="gap-3" {...hookProps('notifications-modal-approval-mode-list')}>
                      <Text className="text-[0.95rem] leading-6" style={{ color: experienceTheme.textMuted }}>
                        Defina como essa pessoa vai entrar no time.
                      </Text>

                      <View className="gap-2">
                        <ApprovalToggleRow
                          // description="Marca se a pessoa entra para compor o elenco."
                          hookId="notifications-modal-toggle-player"
                          label="Jogador"
                          onValueChange={(value) => handleToggleApprovalRole('player', value)}
                          theme={experienceTheme}
                          value={approvalToggles.player}
                        />
                        {approvalToggles.player ? (
                          <ApprovalPlayerSportContextPanel
                            frameCounts={approvalFrameCounts}
                            modalities={approvalModalities}
                            onSelectFrameType={handleSelectApprovalPlayerFrameType}
                            onSelectModality={handleSelectApprovalPlayerModality}
                            sportContexts={approvalPlayerSportContexts}
                            theme={experienceTheme}
                          />
                        ) : null}
                        <ApprovalToggleRow
                          // description="Marca se a pessoa entra para apoiar a operação do time."
                          hookId="notifications-modal-toggle-committee"
                          label="Comissão"
                          onValueChange={(value) => handleToggleApprovalRole('committee', value)}
                          theme={experienceTheme}
                          value={approvalToggles.committee}
                        />
                        <ApprovalToggleRow
                          // description="Marca se a pessoa entra com acesso de gestão."
                          hookId="notifications-modal-toggle-director"
                          label="Diretoria"
                          onValueChange={(value) => handleToggleApprovalRole('director', value)}
                          theme={experienceTheme}
                          value={approvalToggles.director}
                        />
                        <ApprovalToggleRow
                          // description="Marca se a pessoa entra como responsável principal."
                          hookId="notifications-modal-toggle-president"
                          label="Presidência"
                          onValueChange={(value) => handleToggleApprovalRole('president', value)}
                          theme={experienceTheme}
                          value={approvalToggles.president}
                        />
                      </View>

                    </View>
                  ) : null}
                </View>

                <View className="gap-3" {...hookProps('notifications-modal-actions')}>
                  {selectedNotification.type === 'TEAM_JOIN_REQUEST_CREATED' ? (
                    <View className="flex-row gap-3">
                      <Pressable
                        accessibilityRole="button"
                        className="min-h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-[18px] px-4"
                        disabled={!selectedApprovalMode || isSubmitting}
                        onPress={() => void handleApproveJoinRequest(selectedNotification)}
                        style={{
                          backgroundColor: experienceTheme.accentPrimary,
                          opacity: !selectedApprovalMode || isSubmitting ? 0.4 : 1,
                        }}
                        {...hookProps('notifications-modal-button-approve')}
                      >
                        <Ionicons name="checkmark" size={20} color={experienceTheme.accentOnPrimary} />
                        <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>
                          Aprovar
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        className="min-h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-[18px] border px-4"
                        disabled={isSubmitting}
                        onPress={() => void handleRejectJoinRequest(selectedNotification)}
                        style={{ borderColor: experienceTheme.borderDefault, opacity: isSubmitting ? 0.4 : 1 }}
                        {...hookProps('notifications-modal-button-dismiss')}
                      >
                        <Ionicons name="close" size={20} color={experienceTheme.textMuted} />
                        <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.textMuted }}>
                          Dispensar
                        </Text>
                      </Pressable>
                    </View>
                  ) : selectedNotification.type === 'SOCIAL_CONNECTION_ATTENTION' ? (
                    <Pressable
                      accessibilityRole="button"
                      className="min-h-[52px] items-center justify-center rounded-[18px] px-4"
                      onPress={() => {
                        handleCloseNotificationModal();
                        onOpenSettings?.();
                      }}
                      style={{ backgroundColor: experienceTheme.accentPrimary }}
                      {...hookProps('notifications-modal-button-open-settings')}
                    >
                      <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>
                        Acessar configurações
                      </Text>
                    </Pressable>
                  ) : selectedNotification.type === 'MATCH_REMINDER' ? (
                    <Pressable
                      accessibilityRole="button"
                      className="min-h-[52px] items-center justify-center rounded-[18px] px-4"
                      onPress={() => {
                        handleCloseNotificationModal();
                        onOpenAgenda?.();
                      }}
                      style={{ backgroundColor: experienceTheme.accentPrimary }}
                      {...hookProps('notifications-modal-button-open-agenda')}
                    >
                      <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>
                        Acessar agenda
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      className="min-h-[52px] items-center justify-center rounded-[18px] px-4"
                      onPress={handleCloseNotificationModal}
                      style={{ backgroundColor: experienceTheme.accentPrimary }}
                      {...hookProps('notifications-modal-button-close-primary')}
                    >
                      <Text className="text-[1rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>
                        Fechar
                      </Text>
                    </Pressable>
                  )}
                </View>
                </ScrollView>
              </View>
            ) : null}
          </View>
        </Modal>
      </View>
    </ThemedTextureBackground>
  );
}

function mapApprovalModeToToggles(mode: ApprovedMembershipMode | null): ApprovalToggles {
  if (mode === 'PLAYER') {
    return { committee: false, director: false, player: true, president: false };
  }

  if (mode === 'COMMITTEE') {
    return { committee: true, director: false, player: false, president: false };
  }

  if (mode === 'DIRECTOR') {
    return { committee: false, director: true, player: false, president: false };
  }

  if (mode === 'PRESIDENT') {
    return { committee: false, director: false, player: false, president: true };
  }

  if (mode === 'PLAYER_COMMITTEE') {
    return { committee: true, director: false, player: true, president: false };
  }

  if (mode === 'PLAYER_DIRECTOR') {
    return { committee: false, director: true, player: true, president: false };
  }

  if (mode === 'PLAYER_PRESIDENT') {
    return { committee: false, director: false, player: true, president: true };
  }

  return EMPTY_APPROVAL_TOGGLES;
}

function resolveApprovalModeFromToggles(toggles: ApprovalToggles): ApprovedMembershipMode | null {
  if (toggles.director && toggles.president) {
    return null;
  }

  if (toggles.committee && (toggles.director || toggles.president)) {
    return null;
  }

  if (toggles.player && toggles.committee) {
    return 'PLAYER_COMMITTEE';
  }

  if (toggles.player && toggles.director) {
    return 'PLAYER_DIRECTOR';
  }

  if (toggles.player && toggles.president) {
    return 'PLAYER_PRESIDENT';
  }

  if (toggles.player) {
    return 'PLAYER';
  }

  if (toggles.committee) {
    return 'COMMITTEE';
  }

  if (toggles.director) {
    return 'DIRECTOR';
  }

  if (toggles.president) {
    return 'PRESIDENT';
  }

  return null;
}

function buildFakeJoinRequestNotification(team: TeamSummary | null): NotificationCardItem {
  return {
    applicantAvatarUrl: null,
    applicantName: 'Bruno Paula',
    applicantRoleLabel: '',
    applicantSubtitle: 'Ja possui perfil de jogador no app. A funcao final no time sera definida pela gestao.',
    approvalModeOptions: [],
    createdAt: new Date().toISOString(),
    id: FAKE_JOIN_REQUEST_ID,
    joinRequestId: FAKE_JOIN_REQUEST_ID,
    pendingAction: true,
    read: false,
    teamCrestUrl: team?.crest_url ?? null,
    teamId: team?.id ?? 'fake-team-preview',
    teamName: team?.name ?? "Old'Dogs F.C.",
    type: 'TEAM_JOIN_REQUEST_CREATED',
  };
}

function ApprovalPlayerSportContextPanel({
  frameCounts,
  modalities,
  onSelectFrameType,
  onSelectModality,
  sportContexts,
  theme,
}: {
  frameCounts: ModalityFrameCounts;
  modalities: SportModality[];
  onSelectFrameType: (modality: SportModality, frameType: ApprovalPlayerFrameType) => void;
  onSelectModality: (modality: SportModality) => void;
  sportContexts: Partial<Record<SportModality, ApprovalPlayerSportContext>>;
  theme: TeamExperienceTheme;
}) {
  const visibleModalities = normalizeApprovalModalities(modalities);

  if (!visibleModalities.length) {
    return null;
  }

  return (
    <View {...hookProps('notifications-modal-container-player-sport-context')}>
      <View className="gap-2 max-w-3xl" {...hookProps('notifications-modal-container-player-modalities')}>
        <Text className="text-[0.9rem] font-bold leading-5" style={{ color: theme.accentPrimary }} {...hookProps('notifications-modal-text-player-modalities-label')}>
          Modalidade
        </Text>

        <View className="flex-row flex-wrap items-start gap-2" {...hookProps('notifications-modal-container-player-modality-options')}>
          {visibleModalities.map((modality) => {
            const isSelected = Boolean(sportContexts[modality]);
            const sportContext = sportContexts[modality];
            const frameCount = frameCounts[modality] ?? 1;

            return (
              <View className="min-w-[88px] flex-1 gap-2" key={modality} {...hookProps(`notifications-modal-container-player-modality-${modality.toLowerCase()}`)}>
                <Pressable
                  accessibilityRole="button"
                  className="min-h-[38px] items-center justify-center rounded-full border px-3 py-2"
                  onPress={() => onSelectModality(modality)}
                  style={{
                    backgroundColor: isSelected ? `${theme.accentPrimary}22` : theme.surfaceBase,
                    borderColor: isSelected ? theme.accentPrimary : theme.borderDefault,
                  }}
                  {...hookProps(`notifications-modal-button-player-modality-${modality.toLowerCase()}`)}
                >
                  <Text className="text-[0.9rem] font-bold leading-4" style={{ color: isSelected ? theme.accentPrimary : theme.textPrimary }}>
                    {getModalityLabel(modality)}
                  </Text>
                </Pressable>

                {isSelected && sportContext && frameCount > 1 ? (
                  <View className="gap-2" {...hookProps(`notifications-modal-container-player-${modality.toLowerCase()}-frame-count`)}>
                    <View className="flex-row" {...hookProps(`notifications-modal-container-player-${modality.toLowerCase()}-frame-options`)}>
                      {[
                        { frameType: 'FIRST_FRAME' as const, label: '1' },
                        { frameType: 'SECOND_FRAME' as const, label: '2' },
                      ].map((option) => {
                        const isFrameSelected = sportContext.frameType === option.frameType;
                        const frameShapeClass =
                          option.frameType === 'FIRST_FRAME' ? 'rounded-tl-[50px] rounded-bl-[50px]' : 'rounded-tr-[50px] rounded-br-[50px]';

                        return (
                          <Pressable
                            accessibilityRole="button"
                            className={`${frameShapeClass} min-h-[28px] flex-1 items-center justify-center border px-2 py-1`}
                            key={option.frameType}
                            onPress={() => onSelectFrameType(modality, option.frameType)}
                            style={{
                              backgroundColor: isFrameSelected ? `${theme.accentPrimary}22` : theme.surfaceBase,
                              borderColor: isFrameSelected ? theme.accentPrimary : theme.borderDefault,
                            }}
                            {...hookProps(`notifications-modal-button-player-${modality.toLowerCase()}-${option.frameType.toLowerCase()}`)}
                          >
                            <Text className="text-[0.85rem] font-bold leading-4" style={{ color: isFrameSelected ? theme.accentPrimary : theme.textPrimary }}>
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text className="text-center text-[0.68rem] font-bold leading-3" style={{ color: theme.textMuted }} {...hookProps(`notifications-modal-text-player-${modality.toLowerCase()}-frame-label`)}>
                      Quadro
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function normalizeApprovalModalities(modalities: SportModality[]) {
  return Array.from(new Set(modalities));
}

function ensureApprovalPlayerSportContext(
  currentContexts: Partial<Record<SportModality, ApprovalPlayerSportContext>>,
  modality: SportModality,
  frameCounts: ModalityFrameCounts,
) {
  if (currentContexts[modality]) {
    return currentContexts;
  }

  return {
    ...currentContexts,
    [modality]: {
      frameType: getDefaultApprovalFrameTypeForModality(modality, frameCounts),
    },
  };
}

function toggleApprovalPlayerSportContext(
  currentContexts: Partial<Record<SportModality, ApprovalPlayerSportContext>>,
  modality: SportModality,
  frameCounts: ModalityFrameCounts,
) {
  if (!currentContexts[modality]) {
    return ensureApprovalPlayerSportContext(currentContexts, modality, frameCounts);
  }

  const selectedModalities = Object.keys(currentContexts);

  if (selectedModalities.length <= 1) {
    return currentContexts;
  }

  const nextContexts = { ...currentContexts };
  delete nextContexts[modality];
  return nextContexts;
}

function getDefaultApprovalFrameTypeForModality(modality: SportModality, frameCounts: ModalityFrameCounts): ApprovalPlayerFrameType {
  return (frameCounts[modality] ?? 1) > 1 ? 'FIRST_FRAME' : 'UNASSIGNED';
}

function ApprovalToggleRow({
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
      {...hookProps(hookId)}
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

function getModalDescription(item: NotificationCardItem) {
  if (item.type === 'TEAM_JOIN_REQUEST_CREATED') {
    return `Solicitação para fazer parte do time ${item.teamName}.`;
  }

  return item.description;
}

function getNotificationLeadVisual(item: NotificationCardItem): NotificationLeadVisual {
  if (item.type === 'TEAM_JOIN_REQUEST_CREATED') {
    return {
      kind: 'person',
      avatarUrl: item.applicantAvatarUrl ?? null,
    };
  }

  if (item.type === 'TEAM_JOIN_REQUEST_APPROVED' || item.type === 'TEAM_JOIN_REQUEST_REJECTED') {
    return {
      kind: 'team',
      crestUrl: item.teamCrestUrl ?? null,
    };
  }

  if (item.type === 'MATCH_REMINDER' || item.type === 'SOCIAL_CONNECTION_ATTENTION' || item.type === 'PLAYER_WELCOME_PUBLISHED') {
    return {
      kind: 'icon',
      icon: item.icon,
    };
  }

  return {
    kind: 'team',
    crestUrl: item.teamCrestUrl ?? null,
  };
}

function renderNotificationLeadVisual(item: NotificationCardItem, theme: TeamExperienceThemeOverrides | { accentPrimary: string }) {
  const visual = getNotificationLeadVisual(item);
  const iconName =
    visual.kind === 'team'
      ? 'shield-outline'
      : visual.kind === 'person'
        ? 'person-outline'
        : visual.icon;
  const imageUri = visual.kind === 'team' ? visual.crestUrl : visual.kind === 'person' ? visual.avatarUrl : null;
  const hasImage = Boolean(imageUri);

  if (hasImage && imageUri) {
    return (
      <View
        className="h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full"
        style={{
          backgroundColor: experienceThemeSurfaceFallback(theme),
          borderColor: experienceThemeBorderFallback(theme),
          borderWidth: 1,
        }}
      >
        <Image resizeMode="cover" source={{ uri: imageUri }} style={{ height: '100%', width: '100%' }} />
      </View>
    );
  }

  return <Ionicons color={theme.accentPrimary} name={iconName} size={40} />;
}

function getNotificationOriginTitle(item: NotificationCardItem) {
  if (item.type === 'TEAM_JOIN_REQUEST_CREATED') {
    return item.applicantName;
  }

  if (item.type === 'TEAM_JOIN_REQUEST_APPROVED' || item.type === 'TEAM_JOIN_REQUEST_REJECTED') {
    return item.teamName;
  }

  if (item.type === 'SOCIAL_CONNECTION_ATTENTION') {
    return 'Conexão social';
  }

  if (item.type === 'MATCH_REMINDER') {
    return 'Agenda';
  }

  return 'Time';
}

function experienceThemeSurfaceFallback(theme: TeamExperienceThemeOverrides | { accentPrimary: string }) {
  return 'surfaceBase' in theme && theme.surfaceBase ? theme.surfaceBase : '#121212';
}

function experienceThemeBorderFallback(theme: TeamExperienceThemeOverrides | { accentPrimary: string }) {
  return 'borderDefault' in theme && theme.borderDefault ? theme.borderDefault : '#3A3A3A';
}

function formatNotificationModalTimestamp(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  const timeLabel = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return `Hoje às ${timeLabel}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return `Ontem às ${timeLabel}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()} às ${timeLabel}`;
}
