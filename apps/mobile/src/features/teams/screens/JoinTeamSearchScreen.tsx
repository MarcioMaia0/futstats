import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ThemedTextureBackground } from '../../../components/layout/ThemedTextureBackground';
import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { resolveAppExperienceTheme, type UserThemePreferenceKey } from '../../../theme/teamExperienceTheme';
import {
  createTeamJoinRequest,
  searchTeamsForJoin,
  type TeamJoinRequestResult,
  type TeamJoinSearchItem,
} from '../services/teamService';

type JoinTeamSearchScreenProps = {
  onBack?: () => void;
  onReturnHome?: () => void;
  preferredThemeKey?: UserThemePreferenceKey | null;
};

const MIN_QUERY_LENGTH = 2;

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function JoinTeamSearchScreen({
  onBack,
  onReturnHome,
  preferredThemeKey = null,
}: JoinTeamSearchScreenProps) {
  const appExperience = useMemo(() => resolveAppExperienceTheme(preferredThemeKey), [preferredThemeKey]);
  const theme = appExperience.theme;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TeamJoinSearchItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamJoinSearchItem | null>(null);
  const [latestRequest, setLatestRequest] = useState<TeamJoinRequestResult['team_summary'] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const hasTypedQuery = trimmedQuery.length > 0;
  const title = latestRequest ? 'Quer se juntar a mais algum time?' : 'Encontre um time para você fazer parte';
  const subtitle = latestRequest
    ? 'Sua solicitação já foi enviada. Se quiser, você pode procurar outro time agora.'
    : 'Busque o nome do time e envie uma solicitação para entrar.';

  useEffect(() => {
    let cancelled = false;

    if (!hasTypedQuery) {
      setResults([]);
      setIsSearching(false);
      setFeedbackMessage(null);
      return () => {
        cancelled = true;
      };
    }

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      setFeedbackMessage(`Digite pelo menos ${MIN_QUERY_LENGTH} caracteres para buscar um time.`);
      return () => {
        cancelled = true;
      };
    }

    setIsSearching(true);
    setFeedbackMessage(null);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const items = await searchTeamsForJoin(trimmedQuery);

          if (cancelled) {
            return;
          }

          setResults(items);
          setFeedbackMessage(items.length ? null : 'Nenhum time encontrado. Tente outro nome ou parte do nome.');
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.warn('Could not search teams for join flow.', error);
          setResults([]);
          setFeedbackMessage('Não foi possível buscar os times agora.');
        } finally {
          if (!cancelled) {
            setIsSearching(false);
          }
        }
      })();
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasTypedQuery, trimmedQuery]);

  async function handleConfirmJoinRequest() {
    if (!selectedTeam) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createTeamJoinRequest(selectedTeam.team_id);
      setLatestRequest(result.team_summary);
      setResults((current) =>
        current.map((item) =>
          item.team_id === selectedTeam.team_id
            ? {
                ...item,
                request_context: {
                  already_member: false,
                  can_request_join: false,
                  has_pending_join_request: true,
                },
              }
            : item,
        ),
      );
      setSelectedTeam(null);
      setFeedbackMessage(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      console.warn('Could not create join request.', error);

      if (errorMessage.includes('TEAM_MEMBER_ALREADY_EXISTS')) {
        updateTeamStateAfterValidation('already_member');
        setFeedbackMessage('Você já faz parte desse time.');
      } else if (errorMessage.includes('TEAM_JOIN_REQUEST_ALREADY_PENDING')) {
        updateTeamStateAfterValidation('pending');
        setFeedbackMessage('Você já enviou uma solicitação para esse time.');
      } else {
        setFeedbackMessage('Não foi possível enviar a solicitação agora.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateTeamStateAfterValidation(mode: 'already_member' | 'pending') {
    if (!selectedTeam) {
      return;
    }

    setResults((current) =>
      current.map((item) =>
        item.team_id === selectedTeam.team_id
          ? {
              ...item,
              request_context: {
                already_member: mode === 'already_member',
                can_request_join: false,
                has_pending_join_request: mode === 'pending',
              },
            }
          : item,
      ),
    );
    setSelectedTeam(null);
  }

  return (
    <ThemedTextureBackground baseColor={theme.surfaceBase} mode={appExperience.mode}>
      <View className="flex-1 bg-transparent" {...hookProps('join-team-container-main')}>
        <View className="flex-row items-center justify-between px-4 pb-4 pt-3" {...hookProps('join-team-container-header')}>
          <BackCircleButton onPress={onBack} theme={theme} {...hookProps('join-team-button-back')} />
          <Text
            className="font-slab text-[1.5rem] leading-[1.8rem]"
            style={{ color: theme.accentPrimary }}
            {...hookProps('join-team-text-header')}
          >
            Entrar em um time
          </Text>
          <View className="h-[42px] w-[42px]" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-4 pb-10"
          showsVerticalScrollIndicator={false}
          {...hookProps('join-team-container-scroll')}
        >
          <View
            className="gap-4 rounded-[26px] border p-4"
            style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
            {...hookProps('join-team-card-search')}
          >
            <View className="gap-2" {...hookProps('join-team-container-copy')}>
              <Text
                className="font-slab text-[1.5rem] leading-[1.8rem]"
                style={{ color: theme.accentPrimary }}
                {...hookProps('join-team-text-title')}
              >
                {title}
              </Text>
              <Text
                className="text-[1rem] leading-6"
                style={{ color: theme.textMuted }}
                {...hookProps('join-team-text-subtitle')}
              >
                {subtitle}
              </Text>
            </View>

            <View
              className="min-h-[54px] flex-row items-center gap-3 rounded-[18px] border px-4"
              style={{ backgroundColor: theme.surfaceBase, borderColor: theme.borderDefault }}
              {...hookProps('join-team-container-search-field')}
            >
              <Ionicons color={theme.textMuted} name="search" size={20} />
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                className="flex-1 py-3 text-[1rem] leading-6"
                onChangeText={setQuery}
                placeholder="Digite o nome do time"
                placeholderTextColor={theme.textMuted}
                style={{ color: theme.textPrimary }}
                value={query}
                {...hookProps('join-team-input-query')}
              />
              {query.length ? (
                <Pressable accessibilityRole="button" onPress={() => setQuery('')} {...hookProps('join-team-button-clear-query')}>
                  <Ionicons color={theme.textMuted} name="close-circle" size={20} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {latestRequest ? (
            <View
              className="rounded-[26px] border p-4"
              style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
              {...hookProps('join-team-card-latest-request')}
            >
              <Text className="text-[0.9rem] leading-5" style={{ color: theme.textMuted }} {...hookProps('join-team-text-latest-request-label')}>
                Solicitação mais recente
              </Text>
              <View className="mt-3 flex-row items-center gap-3" {...hookProps('join-team-container-latest-request')}>
                <View
                  className="h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full border"
                  style={{ backgroundColor: theme.surfaceBase, borderColor: theme.borderDefault }}
                  {...hookProps('join-team-container-latest-request-crest')}
                >
                  {latestRequest.crest_url ? (
                    <Image className="h-full w-full" resizeMode="cover" source={{ uri: latestRequest.crest_url }} />
                  ) : (
                    <Ionicons color={theme.accentPrimary} name="shield-outline" size={28} />
                  )}
                </View>
                <View className="min-w-0 flex-1 gap-1">
                  <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }}>
                    {latestRequest.name}
                  </Text>
                  <Text className="text-[0.95rem] leading-5" style={{ color: theme.textMuted }}>
                    Solicitação enviada com sucesso.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          <View
            className="rounded-[26px] border p-4"
            style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
            {...hookProps('join-team-card-results')}
          >
            <Text
              className="font-slab text-[1.3rem] leading-[1.6rem]"
              style={{ color: theme.accentPrimary }}
              {...hookProps('join-team-text-results-title')}
            >
              Resultados
            </Text>

            {isSearching ? (
              <Text className="mt-3 text-[1rem] leading-6" style={{ color: theme.textMuted }} {...hookProps('join-team-text-loading')}>
                Buscando times...
              </Text>
            ) : null}

            {!isSearching && feedbackMessage ? (
              <Text className="mt-3 text-[1rem] leading-6" style={{ color: theme.textMuted }} {...hookProps('join-team-text-feedback')}>
                {feedbackMessage}
              </Text>
            ) : null}

            {!isSearching && !feedbackMessage && !results.length && !hasTypedQuery ? (
              <Text className="mt-3 text-[1rem] leading-6" style={{ color: theme.textMuted }} {...hookProps('join-team-text-empty-initial')}>
                Procure um time pelo nome para começar.
              </Text>
            ) : null}

            <View className="mt-4 gap-3" {...hookProps('join-team-container-results-list')}>
              {results.map((item) => {
                const disabled = !item.request_context.can_request_join;
                const statusLabel = item.request_context.already_member
                  ? 'Você já faz parte'
                  : item.request_context.has_pending_join_request
                    ? 'Solicitação pendente'
                    : 'Selecionar';

                return (
                  <Pressable
                    accessibilityRole="button"
                    className="rounded-[22px] border p-4"
                    disabled={disabled}
                    key={item.team_id}
                    onPress={() => setSelectedTeam(item)}
                    style={{
                      backgroundColor: theme.surfaceBase,
                      borderColor: disabled ? theme.borderDefault : theme.accentPrimary,
                      opacity: disabled ? 0.7 : 1,
                    }}
                    {...hookProps(`join-team-card-result-${item.team_id}`)}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-full border"
                        style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
                        {...hookProps(`join-team-container-result-crest-${item.team_id}`)}
                      >
                        {item.crest_url ? (
                          <Image className="h-full w-full" resizeMode="cover" source={{ uri: item.crest_url }} />
                        ) : (
                          <Ionicons color={theme.accentPrimary} name="shield-outline" size={28} />
                        )}
                      </View>

                      <View className="min-w-0 flex-1 gap-1" {...hookProps(`join-team-container-result-copy-${item.team_id}`)}>
                        <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.textPrimary }}>
                          {item.name}
                        </Text>
                        <Text className="text-[0.9rem] leading-5" style={{ color: theme.textMuted }}>
                          {item.location_label ?? 'Localidade ainda não informada'}
                        </Text>
                      </View>

                      <View className="items-end gap-1 max-w-[85px]" {...hookProps(`join-team-container-result-status-${item.team_id}`)}>
                        <Text
                          className="text-right text-[0.9rem] font-bold leading-5"
                          style={{ color: disabled ? theme.textMuted : theme.accentPrimary }}
                        >
                          {statusLabel}
                        </Text>
                        {!disabled ? <Ionicons color={theme.accentPrimary} name="chevron-forward" size={18} /> : null}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {latestRequest ? (
            <View
              className="rounded-[26px] border p-4"
              style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
              {...hookProps('join-team-card-next-step')}
            >
              <Text className="text-[1rem] leading-6" style={{ color: theme.textMuted }} {...hookProps('join-team-text-next-step')}>
                Enquanto aguarda a aprovação, veja o que está rolando por aí.
              </Text>
              <Pressable
                accessibilityRole="button"
                className="mt-4 min-h-[54px] items-center justify-center rounded-[18px] px-4"
                onPress={onReturnHome}
                style={{ backgroundColor: theme.accentPrimary }}
                {...hookProps('join-team-button-return-home')}
              >
                <Text className="text-[1.2rem] font-bold leading-6" style={{ color: theme.accentOnPrimary }}>
                  Ir para a Home
                </Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <Modal animationType="fade" transparent visible={selectedTeam !== null} onRequestClose={() => setSelectedTeam(null)}>
          <View className="flex-1 items-center justify-center bg-black/75 px-4" {...hookProps('join-team-modal-overlay')}>
            {selectedTeam ? (
              <View
                className="w-full max-w-[340px] gap-4 rounded-[28px] border p-4"
                style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
                {...hookProps('join-team-modal-card')}
              >
                <View className="flex-row items-center gap-3" {...hookProps('join-team-modal-team')}>
                  <View
                    className="h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full border"
                    style={{ backgroundColor: theme.surfaceBase, borderColor: theme.borderDefault }}
                    {...hookProps('join-team-modal-team-crest')}
                  >
                    {selectedTeam.crest_url ? (
                      <Image className="h-full w-full" resizeMode="cover" source={{ uri: selectedTeam.crest_url }} />
                    ) : (
                      <Ionicons color={theme.accentPrimary} name="shield-outline" size={28} />
                    )}
                  </View>
                  <View className="min-w-0 flex-1 gap-1">
                    <Text className="font-slab text-[1.3rem] leading-[1.6rem]" style={{ color: theme.accentPrimary }}>
                      {selectedTeam.name}
                    </Text>
                    <Text className="text-[0.95rem] leading-5" style={{ color: theme.textMuted }}>
                      {selectedTeam.location_label ?? 'Localidade ainda não informada'}
                    </Text>
                  </View>
                </View>

                <Text className="text-[1rem] leading-6" style={{ color: theme.textPrimary }} {...hookProps('join-team-modal-text')}>
                  Vamos enviar uma solicitação para você entrar nesse time. A entrada depende de aprovação da gestão.
                </Text>

                <View className="gap-3" {...hookProps('join-team-modal-actions')}>
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-[54px] items-center justify-center rounded-[18px] px-4"
                    disabled={isSubmitting}
                    onPress={() => void handleConfirmJoinRequest()}
                    style={{ backgroundColor: theme.accentPrimary, opacity: isSubmitting ? 0.6 : 1 }}
                    {...hookProps('join-team-button-confirm-request')}
                  >
                    <Text className="text-[1.2rem] font-bold leading-6" style={{ color: theme.accentOnPrimary }}>
                      {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-[54px] items-center justify-center rounded-[18px] border px-4"
                    disabled={isSubmitting}
                    onPress={() => setSelectedTeam(null)}
                    style={{ borderColor: theme.accentPrimary, opacity: isSubmitting ? 0.6 : 1 }}
                    {...hookProps('join-team-button-cancel-request')}
                  >
                    <Text className="text-[1rem] font-bold leading-6" style={{ color: theme.accentPrimary }}>
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        </Modal>
      </View>
    </ThemedTextureBackground>
  );
}
