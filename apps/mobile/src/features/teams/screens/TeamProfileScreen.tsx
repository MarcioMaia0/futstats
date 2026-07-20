import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

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

type TeamProfileScreenProps = {
  hasUnreadNotifications?: boolean;
  themeOverrides?: TeamExperienceThemeOverrides | null;
  onBack?: () => void;
  onOpenIconPreview?: () => void;
  onOpenNotifications?: () => void;
  onOpenRoster?: () => void;
  onOpenSettings?: () => void;
  onProfilePress?: () => void;
  preferredThemeKey?: UserThemePreferenceKey | null;
  profileAvatarUrl?: string | null;
  team: TeamSummary;
};

const QUICK_ACTIONS = [
  { icon: 'football-outline', label: 'Criar jogo' },
  { icon: 'calendar-outline', label: 'Agenda' },
  { icon: 'people-outline', label: 'Elenco' },
  { icon: 'megaphone-outline', label: 'Publicar' },
  { icon: 'ticket-outline', label: 'Evento' },
] as const;

const FEATURED_PLAYERS = [
  { number: '7', role: 'Pivo', name: 'Gui Silva' },
  { number: '10', role: 'Ala', name: 'Dudu' },
  { number: '1', role: 'Goleiro', name: 'Rato' },
] as const;

const AGENDA_ITEMS = [
  { date: '24', month: 'MAI', title: 'Primeiro jogo do time', subtitle: 'Defina rival, local e horário' },
  { date: '31', month: 'MAI', title: 'Treino aberto', subtitle: 'Organize presenca da base' },
  { date: '07', month: 'JUN', title: 'Evento social', subtitle: 'A confirmar' },
] as const;

const SUMMARY_FILTERS = [
  { key: 'start', label: 'Início' },
  { key: 'year', label: 'Ano' },
  { key: 'sixMonths', label: '6 meses' },
  { key: 'threeMonths', label: '3 meses' },
  { key: 'month', label: 'Mês' },
] as const;

const PROFILE_HEADER_AREA_HEIGHT = 66;

type SummaryFilterKey = (typeof SUMMARY_FILTERS)[number]['key'];
type MatchResult = 'V' | 'E' | 'D';

type MockMatch = {
  date: string;
  goalsFor: number;
  goalsAgainst: number;
};

const MOCK_TEAM_MATCHES: MockMatch[] = [
  { date: '2026-07-10', goalsFor: 4, goalsAgainst: 2 },
  { date: '2026-07-03', goalsFor: 1, goalsAgainst: 1 },
  { date: '2026-06-28', goalsFor: 3, goalsAgainst: 0 },
  { date: '2026-06-21', goalsFor: 0, goalsAgainst: 2 },
  { date: '2026-06-14', goalsFor: 5, goalsAgainst: 3 },
  { date: '2026-05-31', goalsFor: 2, goalsAgainst: 2 },
  { date: '2026-05-24', goalsFor: 3, goalsAgainst: 1 },
  { date: '2026-05-17', goalsFor: 1, goalsAgainst: 0 },
  { date: '2026-04-26', goalsFor: 2, goalsAgainst: 4 },
  { date: '2026-04-19', goalsFor: 2, goalsAgainst: 1 },
  { date: '2026-03-29', goalsFor: 1, goalsAgainst: 1 },
  { date: '2026-03-15', goalsFor: 0, goalsAgainst: 1 },
  { date: '2026-02-22', goalsFor: 4, goalsAgainst: 2 },
  { date: '2026-02-08', goalsFor: 3, goalsAgainst: 3 },
  { date: '2026-01-18', goalsFor: 2, goalsAgainst: 0 },
] as const;

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function TeamProfileScreen({
  hasUnreadNotifications = false,
  onBack,
  onOpenIconPreview,
  onOpenNotifications,
  onOpenRoster,
  onOpenSettings,
  onProfilePress,
  preferredThemeKey = null,
  profileAvatarUrl = null,
  team,
  themeOverrides = null,
}: TeamProfileScreenProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 520;
  const shouldBreakSummaryRows = width <= 768;
  const shouldStackContentCards = width <= 768;
  const pageHorizontalPadding = isCompact ? 14 : 18;
  const shellWidth = Math.min(width - pageHorizontalPadding * 2, 920);
  const contentCardWidth: number | '100%' = shouldStackContentCards ? '100%' : (shellWidth - 16) / 2;
  const crestSize = isCompact ? 136 : 224;
  const crestUri = team.crest_url;
  const cityStateLabel = [team.region_city, team.region_state].filter(Boolean).join(', ');
  const zoneLabel = team.region_zone?.trim() || 'Zona em definição';
  const foundedLabel = formatFoundedLabel(team);
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilterKey>('start');
  const scrollY = useRef(new Animated.Value(0)).current;
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

  const availableFilters = useMemo(() => getAvailableSummaryFilters(new Date()), []);
  const filteredMatches = useMemo(
    () => getMatchesForFilter(MOCK_TEAM_MATCHES, summaryFilter, new Date()),
    [summaryFilter],
  );
  const summary = useMemo(() => buildSummaryStats(filteredMatches), [filteredMatches]);

  const titleClass = isCompact ? 'font-slab text-[30px] leading-[32px]' : 'font-slab text-[60px] leading-[60px]';
  const locationClass = isCompact ? 'text-base leading-6' : 'text-[20px] leading-7';
  const sectionTitleClass = isCompact ? 'font-slab text-[24px] leading-7 uppercase' : 'font-slab text-[30px] leading-[34px] uppercase';
  const clampedScrollY = useMemo(() => Animated.diffClamp(scrollY, 0, PROFILE_HEADER_AREA_HEIGHT), [scrollY]);
  const headerHeight = clampedScrollY.interpolate({
    inputRange: [0, PROFILE_HEADER_AREA_HEIGHT],
    outputRange: [PROFILE_HEADER_AREA_HEIGHT, 0],
    extrapolate: 'clamp',
  });
  const headerOpacity = clampedScrollY.interpolate({
    inputRange: [0, PROFILE_HEADER_AREA_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <ThemedTextureBackground baseColor={experienceTheme.surfaceBase} mode={experienceAppearance.mode}>
      <View className="flex-1 bg-transparent" {...hookProps('team-profile-container-main')}>
        <Animated.View
          className="overflow-hidden bg-black/50"
          style={{ height: headerHeight, opacity: headerOpacity }}
          {...hookProps('team-profile-container-collapsible-header')}
        >
          <View className="w-full flex-row items-center justify-between px-5 pt-3" {...hookProps('team-profile-container-header')}>
            <BackCircleButton onPress={onBack} {...hookProps('team-profile-button-back')} />
            <View className="flex-row items-center gap-2" {...hookProps('team-profile-container-header-actions')}>
              <Pressable
                accessibilityRole="button"
                className="min-h-[42px] w-[42px] flex justify-center items-center rounded-full bg-black/80"
                {...hookProps('team-profile-button-share')}
              >
                <Ionicons color={experienceTheme.textPrimary} name="share-social-outline" size={isCompact ? 18 : 20} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="h-[42px] w-[42px] items-center justify-center rounded-full bg-black/80"
                onPress={onOpenSettings}
                {...hookProps('team-profile-button-settings')}
              >
                <Ionicons color={experienceTheme.textPrimary} name="settings-outline" size={isCompact ? 18 : 20} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <View className="bg-black/50" {...hookProps('team-profile-container-fixed-quick-actions')}>
          <TeamProfileQuickActions
            experienceTheme={experienceTheme}
            isCompact={isCompact}
            onOpenRoster={onOpenRoster}
          />
          <View
            className="h-px w-full"
            style={{ backgroundColor: experienceTheme.borderDefault }}
            {...hookProps('team-profile-divider-quick-actions')}
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-[110px]"
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          {...hookProps('team-profile-container-scroll')}
        >
          <View className="w-full self-center gap-4" {...hookProps('team-profile-container-shell')}>
          <View className="w-full bg-black/50" {...hookProps('team-profile-container-top-section')}>
            <View className="w-full self-center" {...hookProps('team-profile-container-top-section-inner')}>
              <View className="gap-2" {...hookProps('team-profile-container-hero-cluster')}>
                <View
                  className={isCompact ? 'flex-row items-start gap-3 px-5 pb-4 pt-2' : 'flex-row items-start gap-4 px-5 pb-4 pt-2'}
                  {...hookProps('team-profile-container-hero')}
                >
                  <View
                    className="justify-start"
                    style={{ marginRight: 12, width: crestSize }}
                    {...hookProps('team-profile-container-crest-column')}
                  >
                    <View
                      className="items-center justify-center overflow-hidden rounded-full"
                      style={{ backgroundColor: experienceTheme.surfaceCard, height: crestSize, width: crestSize }}
                      {...hookProps('team-profile-container-crest-shell')}
                    >
                      {crestUri ? (
                        <Image
                          resizeMode="contain"
                          source={{ uri: crestUri }}
                          style={{ height: '100%', width: '100%' }}
                          {...hookProps('team-profile-image-crest')}
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center" {...hookProps('team-profile-container-crest-fallback')}>
                          <Ionicons color={experienceTheme.accentPrimary} name="shield-outline" size={isCompact ? 72 : 88} />
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-1 gap-3 pb-1" {...hookProps('team-profile-container-identity')}>
                    <Text
                      numberOfLines={2}
                      className={titleClass}
                      style={{ color: experienceTheme.accentPrimary }}
                      {...hookProps('team-profile-text-team-name')}
                    >
                      {team.name}
                    </Text>

                    <View className="flex-row flex-wrap items-center gap-x-2" {...hookProps('team-profile-container-location')}>
                      <Ionicons color={experienceTheme.textPrimary} name="location-outline" size={isCompact ? 14 : 16} />
                      <Text className={locationClass} style={{ color: experienceTheme.textPrimary }}>
                        {cityStateLabel || 'Localidade em definição'}
                      </Text>
                      <Text className={locationClass} style={{ color: experienceTheme.textMuted }}>
                        •
                      </Text>
                      <Text className={locationClass} style={{ color: experienceTheme.textPrimary }}>
                        {zoneLabel}
                      </Text>
                    </View>

                    {foundedLabel ? (
                      <View className="flex-row flex-wrap gap-[10px]" {...hookProps('team-profile-container-meta-pills')}>
                        <View className="flex-row items-center gap-2" {...hookProps('team-profile-badge-founded')}>
                          <Ionicons color={experienceTheme.textMuted} name="trophy-outline" size={12} />
                          <Text className="text-[13px] font-normal leading-[18px]" style={{ color: experienceTheme.textMuted }}>
                            {foundedLabel}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View
            className="w-full self-center gap-4"
            style={{ maxWidth: shellWidth, paddingHorizontal: pageHorizontalPadding }}
            {...hookProps('team-profile-container-content')}
          >
            <View
              className={isCompact ? 'gap-3 rounded-3xl px-3 py-[18px]' : 'gap-3 rounded-3xl px-4 py-[18px]'}
              style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1 }}
              {...hookProps('team-profile-card-summary')}
            >
              <View className="flex-row flex-wrap gap-2" {...hookProps('team-profile-container-summary-filters')}>
                {SUMMARY_FILTERS.map((filter) => {
                  const enabled = availableFilters[filter.key];
                  const active = summaryFilter === filter.key;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      className={['min-h-8 items-center justify-center rounded-full px-3 py-[6px]', !enabled ? 'opacity-30' : ''].join(' ')}
                      disabled={!enabled}
                      key={filter.key}
                      onPress={() => {
                        if (enabled) {
                          setSummaryFilter(filter.key);
                        }
                      }}
                      style={{
                        backgroundColor: active ? experienceTheme.accentPrimary : 'transparent',
                        borderColor: active ? experienceTheme.accentPrimary : experienceTheme.borderDefault,
                        borderWidth: 1,
                      }}
                      {...hookProps(`team-profile-filter-${filter.key}`)}
                    >
                      <Text className="text-[12px] font-bold leading-4" style={{ color: active ? experienceTheme.accentOnPrimary : experienceTheme.textPrimary }}>
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {shouldBreakSummaryRows ? (
                <>
                  <View className="w-full flex-row justify-between gap-[5px]" {...hookProps('team-profile-container-summary-top-row')}>
                    <SummaryMetric compact label="Vitórias" theme={experienceTheme} value={summary.wins} {...hookProps('team-profile-metric-wins')} />
                    <SummaryMetric compact label="Derrotas" theme={experienceTheme} value={summary.losses} {...hookProps('team-profile-metric-losses')} />
                    <SummaryMetric compact label="Empates" theme={experienceTheme} value={summary.draws} {...hookProps('team-profile-metric-draws')} />
                    <SummaryMetric compact label="Gols feitos" theme={experienceTheme} value={summary.goalsFor} {...hookProps('team-profile-metric-goals-for')} />
                    <SummaryMetric compact label="Gols sofridos" theme={experienceTheme} value={summary.goalsAgainst} {...hookProps('team-profile-metric-goals-against')} />
                  </View>

                  <View className="w-full flex-row justify-between gap-4" {...hookProps('team-profile-container-summary-bottom-row')}>
                    <View className="min-w-0 flex-1 gap-[10px]" {...hookProps('team-profile-container-summary-history')}>
                      <Text className="w-full overflow-hidden text-[11px] uppercase leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                        Histórico dos últimos jogos
                      </Text>
                      <View className="flex-row gap-[6px]" {...hookProps('team-profile-container-summary-results')}>
                        {summary.lastResults.length ? (
                          summary.lastResults.slice(0, 5).map((item, index) => <ResultBadge item={item} key={`${item.label}-${item.tone}-${index}`} />)
                        ) : (
                          <Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textPrimary }}>
                            Sem jogos no filtro
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="min-w-0 w-[34%] gap-2" {...hookProps('team-profile-container-summary-performance')}>
                      <Text className="w-full overflow-hidden text-[11px] uppercase leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                        Aproveitamento %
                      </Text>
                      <Text className={isCompact ? 'self-start font-slab text-[24px] leading-[26px]' : 'self-start font-slab text-[28px] leading-[30px]'} style={{ color: experienceTheme.accentPrimary }}>
                        {summary.performanceLabel}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View className="w-full flex-row justify-between gap-3" {...hookProps('team-profile-container-summary-desktop-row')}>
                  <SummaryMetric desktop label="Vitórias" theme={experienceTheme} value={summary.wins} {...hookProps('team-profile-metric-wins')} />
                  <SummaryMetric desktop label="Derrotas" theme={experienceTheme} value={summary.losses} {...hookProps('team-profile-metric-losses')} />
                  <SummaryMetric desktop label="Empates" theme={experienceTheme} value={summary.draws} {...hookProps('team-profile-metric-draws')} />
                  <SummaryMetric desktop label="Gols feitos" theme={experienceTheme} value={summary.goalsFor} {...hookProps('team-profile-metric-goals-for')} />
                  <SummaryMetric desktop label="Gols sofridos" theme={experienceTheme} value={summary.goalsAgainst} {...hookProps('team-profile-metric-goals-against')} />

                  <View className="min-w-0 max-w-[180px] flex-1 gap-[10px]" {...hookProps('team-profile-container-summary-history')}>
                    <Text className="w-full overflow-hidden text-[11px] uppercase leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                      Histórico dos últimos jogos
                    </Text>
                    <View className="flex-row gap-[6px]" {...hookProps('team-profile-container-summary-results')}>
                      {summary.lastResults.length ? (
                        summary.lastResults.slice(0, 5).map((item, index) => <ResultBadge item={item} key={`${item.label}-${item.tone}-${index}`} />)
                      ) : (
                        <Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textPrimary }}>
                          Sem jogos no filtro
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="min-w-[84px] max-w-[110px] gap-2" {...hookProps('team-profile-container-summary-performance')}>
                    <Text className="w-full overflow-hidden text-[11px] uppercase leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                      Aproveitamento %
                    </Text>
                    <Text className="self-start font-slab text-[28px] leading-[30px]" style={{ color: experienceTheme.accentPrimary }}>
                      {summary.performanceLabel}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="flex-row flex-wrap gap-4" {...hookProps('team-profile-container-cards-grid')}>
              <FeatureCard
                actionLabel="Ver detalhes"
                actionStyle="primary"
                contentCardWidth={contentCardWidth}
                experienceTheme={experienceTheme}
                isCompact={isCompact}
                title="Próximo jogo"
                titleIcon="trophy-outline"
                {...hookProps('team-profile-card-next-match')}
              >
                {/*<Ionicons color={experienceTheme.textPrimary} name="share-social-outline" size={isCompact ? 18 : 20} />*/}
                <View className="flex-row items-center justify-between">
                  <Text className="text-[11px] uppercase leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                    Primeiro desafio
                  </Text>
                  <Text className="text-[13px] font-bold leading-[18px]" style={{ color: experienceTheme.accentPrimary }}>
                    A definir
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View
                    className={isCompact ? 'h-[74px] w-[74px] items-center justify-center rounded-[20px]' : 'h-[102px] w-[102px] items-center justify-center rounded-[20px]'}
                    style={{ backgroundColor: experienceTheme.surfaceBase }}
                  >
                    {crestUri ? (
                      <Image resizeMode="contain" source={{ uri: crestUri }} style={{ height: '100%', width: '100%' }} />
                    ) : (
                      <Ionicons color={experienceTheme.accentPrimary} name="shield-outline" size={isCompact ? 34 : 42} />
                    )}
                  </View>
                  <Text className={isCompact ? 'font-slab text-[28px] leading-[30px]' : 'font-slab text-[38px] leading-10'} style={{ color: experienceTheme.textPrimary }}>
                    X
                  </Text>
                  <View
                    className={isCompact ? 'h-[74px] w-[74px] items-center justify-center rounded-[20px]' : 'h-[102px] w-[102px] items-center justify-center rounded-[20px]'}
                    style={{ backgroundColor: experienceTheme.surfaceBase }}
                  >
                    <Ionicons color={experienceTheme.textMuted} name="shield-outline" size={isCompact ? 34 : 42} />
                  </View>
                </View>
                <View className="gap-2">
                  <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textPrimary }}>
                    Defina adversário, data e local para abrir a agenda do time.
                  </Text>
                </View>
              </FeatureCard>

              <FeatureCard contentCardWidth={contentCardWidth} experienceTheme={experienceTheme} isCompact={isCompact} title="Última publicação" titleIcon="megaphone-outline" {...hookProps('team-profile-card-latest-post')}>
                <View className="flex-row items-center gap-[10px]">
                  <View className="h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-full" style={{ borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}>
                    {crestUri ? (
                      <Image resizeMode="contain" source={{ uri: crestUri }} style={{ height: '100%', width: '100%' }} />
                    ) : (
                      <Ionicons color={experienceTheme.accentPrimary} name="shield-outline" size={16} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold leading-6" style={{ color: experienceTheme.textPrimary }}>
                      {team.name}
                    </Text>
                    <Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                      Agora mesmo
                    </Text>
                  </View>
                  <Ionicons color={experienceTheme.textMuted} name="ellipsis-vertical" size={14} />
                </View>
                <View className="h-[118px] overflow-hidden rounded-[18px]" style={{ backgroundColor: experienceTheme.surfaceBase }} />
                <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textPrimary }}>
                  Sua primeira publicação do time aparece aqui. Use esse espaço para resultados, avisos e resenha.
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-[6px]">
                    <Ionicons color={experienceTheme.accentPrimary} name="heart-outline" size={16} />
                    <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textPrimary }}>
                      0
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-[6px]">
                    <Ionicons color={experienceTheme.textPrimary} name="chatbubble-outline" size={16} />
                    <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textPrimary }}>
                      0
                    </Text>
                  </View>
                  <Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                    Ver todos
                  </Text>
                </View>
              </FeatureCard>

              <FeatureCard contentCardWidth={contentCardWidth} experienceTheme={experienceTheme} isCompact={isCompact} title="Elenco em destaque" titleIcon="person-add-outline" {...hookProps('team-profile-card-featured-players')}>
                <View className="flex-row items-center justify-end">
                  {/*<Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                    Ver todos
                  </Text>*/}
                </View>
                <View className="gap-3">
                  {FEATURED_PLAYERS.map((player, index) => (
                    <View
                      className={index === FEATURED_PLAYERS.length - 1 ? 'flex-row items-center gap-3 pb-0' : 'flex-row items-center gap-3 pb-3'}
                      key={player.name}
                      style={index === FEATURED_PLAYERS.length - 1 ? undefined : { borderBottomColor: experienceTheme.borderDefault, borderBottomWidth: 1 }}
                    >
                      <View className="h-[52px] w-[52px] items-center justify-center rounded-full" style={{ backgroundColor: experienceTheme.surfaceBase, borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}>
                        <Ionicons color={experienceTheme.accentPrimary} name="person-outline" size={18} />
                      </View>
                      <View className="flex-1 gap-[2px]">
                        <Text className="text-[20px] font-bold leading-7" style={{ color: experienceTheme.textPrimary }}>
                          <Text className="font-slab" style={{ color: experienceTheme.accentPrimary }}>
                            {player.number}{' '}
                          </Text>
                          {player.name}
                        </Text>
                        <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textMuted }}>
                          {player.role}
                        </Text>
                      </View>
                      <View className="h-[42px] w-[42px] items-center justify-center rounded-[16px]" style={{ borderColor: experienceTheme.borderDefault, borderWidth: 1 }}>
                        <Ionicons
                          color={experienceTheme.accentPrimary}
                          name={index === 0 ? 'trophy-outline' : index === 1 ? 'ribbon-outline' : 'hand-left-outline'}
                          size={16}
                        />
                      </View>
                    </View>
                  ))}
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    {[0, 1, 2, 3, 4].map((item) => (
                      <View className="-mr-2 h-7 w-7 items-center justify-center rounded-full" key={item} style={{ backgroundColor: experienceTheme.surfaceBase, borderColor: experienceTheme.accentPrimary, borderWidth: 1 }}>
                        <Ionicons color={experienceTheme.accentPrimary} name="person-outline" size={10} />
                      </View>
                    ))}
                  </View>
                  <View className="h-[30px] w-[30px] items-center justify-center rounded-full" style={{ backgroundColor: experienceTheme.surfaceBase }}>
                    <Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textPrimary }}>
                      +5
                    </Text>
                  </View>
                </View>
              </FeatureCard>

              <FeatureCard contentCardWidth={contentCardWidth} experienceTheme={experienceTheme} isCompact={isCompact} title="Agenda" titleIcon="calendar-outline" {...hookProps('team-profile-card-agenda')}>
                
                <View className="gap-3">
                  {AGENDA_ITEMS.map((item, index) => (
                    <View
                      className={index === AGENDA_ITEMS.length - 1 ? 'flex-row items-center gap-3 pb-0' : 'flex-row items-center gap-3 pb-3'}
                      key={`${item.month}-${item.date}`}
                      style={index === AGENDA_ITEMS.length - 1 ? undefined : { borderBottomColor: experienceTheme.borderDefault, borderBottomWidth: 1 }}
                    >
                      <View className="h-16 w-[54px] items-center justify-center rounded-2xl" style={{ backgroundColor: experienceTheme.surfaceBase }}>
                        <Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                          {item.month}
                        </Text>
                        <Text className="font-slab text-[30px] leading-[34px]" style={{ color: experienceTheme.textPrimary }}>
                          {item.date}
                        </Text>
                      </View>
                      <View className="flex-1 gap-1">
                        <Text className="text-base font-bold leading-6" style={{ color: experienceTheme.textPrimary }}>
                          {item.title}
                        </Text>
                        <Text className="text-[13px] leading-[18px]" style={{ color: experienceTheme.textMuted }}>
                          {item.subtitle}
                        </Text>
                      </View>
                      <View className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: index === 0 ? experienceTheme.accentPrimary : experienceTheme.textMuted }} />
                    </View>
                  ))}
                </View>
                <View className="flex-row items-center justify-end">
                  <Text className="text-[11px] leading-[14px]" style={{ color: experienceTheme.textMuted }}>
                    Ver agenda
                  </Text>
                </View>
              </FeatureCard>
            </View>
          </View>
          </View>
        </ScrollView>

        <TeamExperienceBottomBar
          activeKey={null}
          hasUnreadNotifications={hasUnreadNotifications}
          onNotificationsPress={onOpenNotifications}
          onProfilePress={onProfilePress}
          onSearchPress={onOpenIconPreview}
          profileAvatarUrl={profileAvatarUrl}
          theme={experienceTheme}
        />
      </View>
    </ThemedTextureBackground>
  );
}

function FeatureCard({
  actionLabel,
  actionStyle,
  children,
  contentCardWidth,
  experienceTheme,
  isCompact,
  title,
  titleIcon,
  ...props
}: {
  actionLabel?: string;
  actionStyle?: 'primary';
  children: React.ReactNode;
  contentCardWidth: number | '100%';
  experienceTheme: TeamExperienceTheme;
  isCompact: boolean;
  title: string;
  titleIcon?: React.ComponentProps<typeof Ionicons>['name'];
  nativeID?: string;
  testID?: string;
}) {
  return (
    <View
      className={isCompact ? 'min-h-[252px] gap-[14px] rounded-3xl p-[14px]' : 'min-h-[286px] gap-[14px] rounded-3xl p-[18px]'}
      style={{ backgroundColor: experienceTheme.surfaceCard, borderColor: experienceTheme.borderDefault, borderWidth: 1, width: contentCardWidth }}
      {...props}
    >
      <View className="min-w-0 flex-row items-start gap-2 ">
        {titleIcon ? <Ionicons color={experienceTheme.accentPrimary} name={titleIcon} size={isCompact ? 22 : 26} style={{ marginTop: isCompact ? 2 : 4 }} /> : null}
        <Text className={isCompact ? 'min-w-0 flex-1 flex-wrap font-slab text-[24px]  uppercase' : 'min-w-0 flex-1 flex-wrap font-slab text-[30px] leading-[34px] uppercase'} style={{ color: experienceTheme.accentPrimary }}>
          {title}
        </Text>
      </View>
      {children}
      {actionLabel && actionStyle === 'primary' ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-row items-center justify-center gap-[10px] rounded-2xl px-[14px]"
          style={{ backgroundColor: experienceTheme.accentPrimary }}
        >
          <Text className="text-[1.2rem] font-bold leading-6" style={{ color: experienceTheme.accentOnPrimary }}>
            {actionLabel}
          </Text>
          <Ionicons color={experienceTheme.accentOnPrimary} name="chevron-forward" size={14} />
        </Pressable>
      ) : null}
    </View>
  );
}

function TeamProfileQuickActions({
  experienceTheme,
  isCompact,
  onOpenRoster,
}: {
  experienceTheme: TeamExperienceTheme;
  isCompact: boolean;
  onOpenRoster?: () => void;
}) {
  return (
    <View className="flex-row px-5 py-0" {...hookProps('team-profile-container-quick-actions')}>
      {QUICK_ACTIONS.map((action) => (
        <Pressable
          accessibilityRole="button"
          className="min-h-[50px] flex-1 items-center justify-center gap-[5px]"
          key={action.label}
          onPress={action.label === 'Elenco' ? onOpenRoster : undefined}
          {...hookProps(`team-profile-button-quick-action-${slugify(action.label)}`)}
        >
          <Ionicons color={experienceTheme.accentPrimary} name={action.icon} size={isCompact ? 18 : 20} />
          <Text className="text-center text-[0.75rem] leading-[0.875rem]" style={{ color: experienceTheme.textMuted }}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

type SummaryMetricProps = {
  compact?: boolean;
  desktop?: boolean;
  label: string;
  value: number;
  theme: TeamExperienceTheme;
  nativeID?: string;
  testID?: string;
};

function SummaryMetric({ compact, desktop, label, value, theme, ...props }: SummaryMetricProps) {
  const widthClass = compact ? 'w-[65px] min-w-[65px] max-w-[65px]' : desktop ? 'w-full max-w-[90px] flex-0' : 'min-w-[72px] flex-1';
  return (
    <View className={widthClass} {...props}>
      <View className="w-full gap-2 overflow-hidden">
        <Text numberOfLines={1} className="w-full overflow-hidden text-[11px] uppercase leading-[14px]" style={{ color: theme.textMuted }}>
          {label}
        </Text>
        <Text className={compact ? 'self-start font-slab text-[24px] leading-[26px]' : 'self-start font-slab text-[28px] leading-[30px]'} style={{ color: theme.accentPrimary }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ResultBadge({
  item,
}: {
  item: {
    label: MatchResult;
    tone: 'positive' | 'neutral' | 'negative';
  };
}) {
  const backgroundColor =
    item.tone === 'positive'
      ? '#4FA44F'
      : item.tone === 'neutral'
        ? '#555555'
        : '#C3473F';

  return (
    <View className="h-[30px] w-[30px] items-center justify-center rounded-full" style={{ backgroundColor }}>
      <Text className="text-[13px] font-bold leading-[18px] text-white">
        {item.label}
      </Text>
    </View>
  );
}

function formatFoundedLabel(team: TeamSummary) {
  if (team.founded_year && team.founded_month && team.founded_day) {
    const day = `${team.founded_day}`.padStart(2, '0');
    const month = `${team.founded_month}`.padStart(2, '0');
    return `Fundado em ${day}/${month}/${team.founded_year}`;
  }

  if (team.founded_year && team.founded_month) {
    return `Fundado em ${getMonthLabel(team.founded_month)} de ${team.founded_year}`;
  }

  if (team.founded_year) {
    return `Fundado em ${team.founded_year}`;
  }

  return null;
}

function getMonthLabel(month: number) {
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return months[month - 1] ?? `${month}`;
}

function buildSummaryStats(matches: MockMatch[]) {
  const wins = matches.filter((match) => match.goalsFor > match.goalsAgainst).length;
  const losses = matches.filter((match) => match.goalsFor < match.goalsAgainst).length;
  const draws = matches.filter((match) => match.goalsFor === match.goalsAgainst).length;
  const goalsFor = matches.reduce((total, match) => total + match.goalsFor, 0);
  const goalsAgainst = matches.reduce((total, match) => total + match.goalsAgainst, 0);
  const totalMatches = matches.length;
  const performance = totalMatches ? Math.round(((wins * 3 + draws) / (totalMatches * 3)) * 100) : null;

  return {
    draws,
    goalsAgainst,
    goalsFor,
    lastResults: matches.slice(0, 10).map((match) => mapResultTone(match)),
    losses,
    performanceLabel: performance === null ? '--' : `${performance}%`,
    wins,
  };
}

function mapResultTone(match: MockMatch): { label: MatchResult; tone: 'positive' | 'neutral' | 'negative' } {
  if (match.goalsFor > match.goalsAgainst) {
    return { label: 'V', tone: 'positive' };
  }

  if (match.goalsFor < match.goalsAgainst) {
    return { label: 'D', tone: 'negative' };
  }

  return { label: 'E', tone: 'neutral' };
}

function getAvailableSummaryFilters(now: Date) {
  const month = now.getMonth() + 1;
  return {
    month: true,
    sixMonths: month >= 6,
    start: true,
    threeMonths: month >= 3,
    year: true,
  };
}

function getMatchesForFilter(matches: readonly MockMatch[], filter: SummaryFilterKey, now: Date) {
  const sortedMatches = [...matches].sort((left, right) => getMatchDate(right).getTime() - getMatchDate(left).getTime());
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (filter === 'year') {
    return sortedMatches.filter((match) => getMatchDate(match).getFullYear() === currentYear);
  }

  if (filter === 'month') {
    return sortedMatches.filter((match) => {
      const date = getMatchDate(match);
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
    });
  }

  if (filter === 'threeMonths') {
    const startMonth = currentMonth - 2;
    return sortedMatches.filter((match) => {
      const date = getMatchDate(match);
      const month = date.getMonth() + 1;
      return date.getFullYear() === currentYear && month >= startMonth && month <= currentMonth;
    });
  }

  if (filter === 'sixMonths') {
    const startMonth = currentMonth - 5;
    return sortedMatches.filter((match) => {
      const date = getMatchDate(match);
      const month = date.getMonth() + 1;
      return date.getFullYear() === currentYear && month >= startMonth && month <= currentMonth;
    });
  }

  return sortedMatches;
}

function getMatchDate(match: MockMatch) {
  return new Date(`${match.date}T12:00:00`);
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
