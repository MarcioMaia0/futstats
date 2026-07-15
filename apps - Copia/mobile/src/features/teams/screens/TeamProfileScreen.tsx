import { FontAwesome5 } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { BackCircleButton } from '../../../components/navigation/BackCircleButton';
import { components, defaultTheme, layout, typography } from '../../../theme';
import type { TeamSummary } from '../services/teamService';

type TeamProfileScreenProps = {
  onBack?: () => void;
  team: TeamSummary;
};

const QUICK_ACTIONS = [
  { icon: 'futbol', label: 'Criar jogo' },
  { icon: 'calendar-alt', label: 'Agenda' },
  { icon: 'users', label: 'Elenco' },
  { icon: 'bullhorn', label: 'Publicar' },
  { icon: 'ticket-alt', label: 'Evento' },
] as const;

const FEATURED_PLAYERS = [
  { number: '7', role: 'Pivo', name: 'Gui Silva' },
  { number: '10', role: 'Ala', name: 'Dudu' },
  { number: '1', role: 'Goleiro', name: 'Rato' },
] as const;

const AGENDA_ITEMS = [
  { date: '24', month: 'MAI', title: 'Primeiro jogo do time', subtitle: 'Defina rival, local e horario' },
  { date: '31', month: 'MAI', title: 'Treino aberto', subtitle: 'Organize presenca da base' },
  { date: '07', month: 'JUN', title: 'Evento social', subtitle: 'A confirmar' },
] as const;

const BOTTOM_ITEMS = [
  { icon: 'home', label: 'Inicio', active: true },
  { icon: 'search', label: 'Buscar', active: false },
  { icon: 'bell', label: 'Notificacoes', active: false },
  { icon: 'user', label: 'Perfil', active: false },
] as const;

const SUMMARY_FILTERS = [
  { key: 'start', label: 'Inicio' },
  { key: 'year', label: 'Ano' },
  { key: 'sixMonths', label: '6 meses' },
  { key: 'threeMonths', label: '3 meses' },
  { key: 'month', label: 'Mes' },
] as const;

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

export function TeamProfileScreen({ onBack, team }: TeamProfileScreenProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 520;
  const shouldBreakSummaryRows = width <= 768;
  const shouldStackContentCards = width <= 768;
  const pageHorizontalPadding = isCompact ? 14 : 18;
  const shellWidth = Math.min(width - pageHorizontalPadding * 2, 920);
  const contentCardWidth = shouldStackContentCards ? '100%' : (shellWidth - 16) / 2;
  const crestUri = team.crest_url;
  const cityStateLabel = [team.region_city, team.region_state].filter(Boolean).join(', ');
  const zoneLabel = team.region_zone?.trim() || 'Zona em definicao';
  const foundedLabel = formatFoundedLabel(team);
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilterKey>('start');

  const availableFilters = useMemo(() => getAvailableSummaryFilters(new Date()), []);
  const filteredMatches = useMemo(
    () => getMatchesForFilter(MOCK_TEAM_MATCHES, summaryFilter, new Date()),
    [summaryFilter],
  );
  const summary = useMemo(() => buildSummaryStats(filteredMatches), [filteredMatches]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isCompact && styles.scrollContentCompact]} showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <View style={styles.topSection}>
          <View style={[styles.topSectionInner, { maxWidth: shellWidth, paddingHorizontal: pageHorizontalPadding }]}>
          <View style={styles.heroCluster}>
          <View style={styles.topBar}>
            <BackCircleButton onPress={onBack} />
            <Pressable accessibilityRole="button" style={styles.shareButton}>
              <FontAwesome5 color={defaultTheme.text.body} name="share-alt" size={isCompact ? 14 : 16} />
              <Text style={[styles.shareButtonText, isCompact && styles.shareButtonTextCompact]}>Compartilhar</Text>
            </Pressable>
          </View>

          <View style={[styles.quickActionsBar, isCompact && styles.quickActionsBarCompact]}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable accessibilityRole="button" key={action.label} style={styles.quickActionItem}>
                <FontAwesome5 color={defaultTheme.text.accent} name={action.icon} size={isCompact ? 18 : 20} />
                <Text style={[styles.quickActionText, isCompact && styles.quickActionTextCompact]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.quickActionsDivider} />

          <View style={[styles.hero, isCompact && styles.heroCompact]}>
            <View style={[styles.crestColumn, isCompact && styles.crestColumnCompact]}>
              <View style={[styles.crestShell, isCompact && styles.crestShellCompact]}>
                {crestUri ? (
                  <Image resizeMode="contain" source={{ uri: crestUri }} style={styles.crestImage} />
                ) : (
                  <View style={styles.crestFallback}>
                    <FontAwesome5 color={defaultTheme.text.accent} name="shield-alt" size={isCompact ? 72 : 88} />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.identityColumn}>
              {/*
              <View style={styles.verifiedBadge}>
                <FontAwesome5 color={components.button.primary.textColor} name="check" size={10} />
                <Text style={styles.verifiedBadgeText}>Verificado</Text>
              </View>
              */}

              <Text numberOfLines={2} style={[styles.teamName, isCompact && styles.teamNameCompact]}>
                {team.name}
              </Text>

              <View style={styles.locationRow}>
                <FontAwesome5 color={defaultTheme.text.body} name="map-marker-alt" size={isCompact ? 14 : 16} />
                <Text style={[styles.locationText, isCompact && styles.locationTextCompact]}>{cityStateLabel || 'Localidade em definicao'}</Text>
                <Text style={styles.locationDivider}>•</Text>
                <Text style={[styles.locationText, isCompact && styles.locationTextCompact]}>{zoneLabel}</Text>
              </View>

              {/*
              <View style={styles.colorsRow}>
                {colors.length ? (
                  colors.slice(0, 2).map((color, index) => (
                    <View key={`${color}-${index}`} style={styles.colorLegendItem}>
                      <View
                        style={[
                          styles.colorLegendDot,
                          index === 1 && styles.colorLegendDotOutline,
                          {
                            backgroundColor: index === 1 ? 'transparent' : color ?? defaultTheme.surface.input,
                            borderColor: color ?? defaultTheme.border.emphasis,
                          },
                        ]}
                      />
                      <Text style={styles.colorLegendText}>{index === 0 ? 'Principal' : 'Secundaria'}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.heroSubtleText}>Cores em definicao</Text>
                )}
              </View>
              */}

              {foundedLabel ? (
                <View style={styles.metaPillsRow}>
                  <View style={styles.metaPill}>
                    <FontAwesome5 color={defaultTheme.gray[400]} name="crown" size={12} />
                    <Text style={styles.metaPillText}>{foundedLabel}</Text>
                  </View>
                  {/*
                  <View style={styles.metaPill}>
                    <FontAwesome5 color={defaultTheme.text.accent} name="users" size={12} />
                    <Text numberOfLines={1} style={styles.metaPillText}>
                      {modalitiesLabel}
                    </Text>
                  </View>
                  */}
                </View>
              ) : null}
            </View>
          </View>
          </View>
          </View>
          </View>

          <View style={[styles.contentSection, { maxWidth: shellWidth, paddingHorizontal: pageHorizontalPadding }]}>
          <View style={[styles.statsPanel, isCompact && styles.statsPanelCompact]}>
            <View style={styles.summaryFiltersRow}>
              {SUMMARY_FILTERS.map((filter) => {
                const enabled = availableFilters[filter.key];
                const active = summaryFilter === filter.key;

                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={!enabled}
                    key={filter.key}
                    onPress={() => {
                      if (enabled) {
                        setSummaryFilter(filter.key);
                      }
                    }}
                    style={[styles.summaryFilterBadge, active && styles.summaryFilterBadgeActive, !enabled && styles.summaryFilterBadgeDisabled]}
                  >
                    <Text
                      style={[
                        styles.summaryFilterBadgeText,
                        active && styles.summaryFilterBadgeTextActive,
                        !enabled && styles.summaryFilterBadgeTextDisabled,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {shouldBreakSummaryRows ? (
              <>
                <View style={[styles.summaryTopRow, styles.summaryTopRowCompact]}>
                  <View style={[styles.summaryMetricItem, styles.summaryMetricItemCompact]}>
                    <View style={styles.summaryMetricContent}>
                      <Text numberOfLines={1} style={styles.statLabel}>
                        Vitorias
                      </Text>
                      <Text style={[styles.summaryMetricValue, isCompact && styles.summaryMetricValueCompact]}>{summary.wins}</Text>
                    </View>
                  </View>
                  <View style={[styles.summaryMetricItem, styles.summaryMetricItemCompact]}>
                    <View style={styles.summaryMetricContent}>
                      <Text numberOfLines={1} style={styles.statLabel}>
                        Derrotas
                      </Text>
                      <Text style={[styles.summaryMetricValue, isCompact && styles.summaryMetricValueCompact]}>{summary.losses}</Text>
                    </View>
                  </View>
                  <View style={[styles.summaryMetricItem, styles.summaryMetricItemCompact]}>
                    <View style={styles.summaryMetricContent}>
                      <Text numberOfLines={1} style={styles.statLabel}>
                        Empates
                      </Text>
                      <Text style={[styles.summaryMetricValue, isCompact && styles.summaryMetricValueCompact]}>{summary.draws}</Text>
                    </View>
                  </View>
                  <View style={[styles.summaryMetricItem, styles.summaryMetricItemCompact]}>
                    <View style={styles.summaryMetricContent}>
                      <Text numberOfLines={1} style={styles.statLabel}>
                        Gols feitos
                      </Text>
                      <Text style={[styles.summaryMetricValue, isCompact && styles.summaryMetricValueCompact]}>{summary.goalsFor}</Text>
                    </View>
                  </View>
                  <View style={[styles.summaryMetricItem, styles.summaryMetricItemCompact]}>
                    <View style={styles.summaryMetricContent}>
                      <Text numberOfLines={1} style={styles.statLabel}>
                        Gols sofridos
                      </Text>
                      <Text style={[styles.summaryMetricValue, isCompact && styles.summaryMetricValueCompact]}>{summary.goalsAgainst}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.summaryBottomRow, styles.summaryBottomRowCompact]}>
                  <View style={[styles.summaryHistoryBlock, styles.summaryHistoryBlockCompact]}>
                    <Text style={styles.statLabel}>Historico dos ultimos jogos</Text>
                    <View style={styles.formBadgesRow}>
                      {summary.lastResults.length ? (
                        summary.lastResults.slice(0, 5).map((item, index) => (
                          <View
                            key={`${item.label}-${item.tone}-${index}`}
                            style={[
                              styles.formBadge,
                              item.tone === 'positive' && styles.formBadgePositive,
                              item.tone === 'neutral' && styles.formBadgeNeutral,
                              item.tone === 'negative' && styles.formBadgeNegative,
                            ]}
                          >
                            <Text style={styles.formBadgeText}>{item.label}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.statMeta}>Sem jogos no filtro</Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.summaryPerformanceBlock, styles.summaryPerformanceBlockCompact]}>
                    <Text style={styles.statLabel}>Aproveitamento %</Text>
                    <Text style={[styles.summaryMetricValue, isCompact && styles.summaryMetricValueCompact]}>{summary.performanceLabel}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.summaryDesktopRow}>
                <View style={[styles.summaryMetricItem, styles.summaryMetricItemDesktop]}>
                  <View style={styles.summaryMetricContent}>
                    <Text numberOfLines={1} style={styles.statLabel}>
                      Vitorias
                    </Text>
                    <Text style={styles.summaryMetricValue}>{summary.wins}</Text>
                  </View>
                </View>
                <View style={[styles.summaryMetricItem, styles.summaryMetricItemDesktop]}>
                  <View style={styles.summaryMetricContent}>
                    <Text numberOfLines={1} style={styles.statLabel}>
                      Derrotas
                    </Text>
                    <Text style={styles.summaryMetricValue}>{summary.losses}</Text>
                  </View>
                </View>
                <View style={[styles.summaryMetricItem, styles.summaryMetricItemDesktop]}>
                  <View style={styles.summaryMetricContent}>
                    <Text numberOfLines={1} style={styles.statLabel}>
                      Empates
                    </Text>
                    <Text style={styles.summaryMetricValue}>{summary.draws}</Text>
                  </View>
                </View>
                <View style={[styles.summaryMetricItem, styles.summaryMetricItemDesktop]}>
                  <View style={styles.summaryMetricContent}>
                    <Text numberOfLines={1} style={styles.statLabel}>
                      Gols feitos
                    </Text>
                    <Text style={styles.summaryMetricValue}>{summary.goalsFor}</Text>
                  </View>
                </View>
                <View style={[styles.summaryMetricItem, styles.summaryMetricItemDesktop]}>
                  <View style={styles.summaryMetricContent}>
                    <Text numberOfLines={1} style={styles.statLabel}>
                      Gols sofridos
                    </Text>
                    <Text style={styles.summaryMetricValue}>{summary.goalsAgainst}</Text>
                  </View>
                </View>
                <View style={styles.summaryHistoryBlockDesktop}>
                  <Text style={styles.statLabel}>Historico dos ultimos jogos</Text>
                  <View style={styles.formBadgesRow}>
                    {summary.lastResults.length ? (
                      summary.lastResults.slice(0, 5).map((item, index) => (
                        <View
                          key={`${item.label}-${item.tone}-${index}`}
                          style={[
                            styles.formBadge,
                            item.tone === 'positive' && styles.formBadgePositive,
                            item.tone === 'neutral' && styles.formBadgeNeutral,
                            item.tone === 'negative' && styles.formBadgeNegative,
                          ]}
                        >
                          <Text style={styles.formBadgeText}>{item.label}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.statMeta}>Sem jogos no filtro</Text>
                    )}
                  </View>
                </View>
                <View style={styles.summaryPerformanceBlockDesktop}>
                  <Text style={styles.statLabel}>Aproveitamento %</Text>
                  <Text style={styles.summaryMetricValue}>{summary.performanceLabel}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.cardsGrid}>
            <View style={[styles.largeCard, { width: contentCardWidth }, isCompact && styles.largeCardCompact]}>
              <Text style={[styles.sectionHeading, isCompact && styles.sectionHeadingCompact]}>Proximo jogo</Text>
              <View style={styles.matchHeader}>
                <Text style={styles.matchEyebrow}>Primeiro desafio</Text>
                <Text style={styles.matchRound}>A definir</Text>
              </View>
              <View style={styles.matchVisual}>
                <View style={[styles.matchCrestBox, isCompact && styles.matchCrestBoxCompact]}>
                  {crestUri ? (
                    <Image resizeMode="contain" source={{ uri: crestUri }} style={styles.smallCrestImage} />
                  ) : (
                    <FontAwesome5 color={defaultTheme.text.accent} name="shield-alt" size={isCompact ? 34 : 42} />
                  )}
                </View>
                <Text style={[styles.versusText, isCompact && styles.versusTextCompact]}>X</Text>
                <View style={[styles.matchCrestBox, isCompact && styles.matchCrestBoxCompact]}>
                  <FontAwesome5 color={defaultTheme.text.muted} name="shield-alt" size={isCompact ? 34 : 42} />
                </View>
              </View>
              <View style={styles.matchInfoList}>
                <Text style={styles.matchInfoText}>Defina adversario, data e local para abrir a agenda do time.</Text>
              </View>
              <Pressable accessibilityRole="button" style={styles.primaryInlineAction}>
                <Text style={styles.primaryInlineActionText}>Ver detalhes</Text>
                <FontAwesome5 color={components.button.primary.textColor} name="chevron-right" size={14} />
              </Pressable>
            </View>

            <View style={[styles.largeCard, { width: contentCardWidth }, isCompact && styles.largeCardCompact]}>
              <Text style={[styles.sectionHeading, isCompact && styles.sectionHeadingCompact]}>Ultima publicacao</Text>
              <View style={styles.postHeader}>
                <View style={styles.postMiniCrest}>
                  {crestUri ? (
                    <Image resizeMode="contain" source={{ uri: crestUri }} style={styles.postMiniCrestImage} />
                  ) : (
                    <FontAwesome5 color={defaultTheme.text.accent} name="shield-alt" size={16} />
                  )}
                </View>
                <View style={styles.postHeaderText}>
                  <Text style={styles.postAuthor}>{team.name}</Text>
                  <Text style={styles.postTimestamp}>Agora mesmo</Text>
                </View>
                <FontAwesome5 color={defaultTheme.text.muted} name="ellipsis-v" size={14} />
              </View>
              <View style={styles.postPreviewImage}>
                <View style={styles.postPreviewFallback} />
              </View>
              <Text style={styles.postBody}>Sua primeira publicacao do time aparece aqui. Use esse espaco para resultados, avisos e resenha.</Text>
              <View style={styles.postFooter}>
                <View style={styles.postMetric}>
                  <FontAwesome5 color="#F05D5E" name="heart" size={16} />
                  <Text style={styles.postMetricText}>0</Text>
                </View>
                <View style={styles.postMetric}>
                  <FontAwesome5 color={defaultTheme.text.body} name="comment" size={16} />
                  <Text style={styles.postMetricText}>0</Text>
                </View>
                <Text style={styles.cardLink}>Ver todos</Text>
              </View>
            </View>

            <View style={[styles.largeCard, { width: contentCardWidth }, isCompact && styles.largeCardCompact]}>
              <View style={styles.cardTopRow}>
                <Text style={[styles.sectionHeading, isCompact && styles.sectionHeadingCompact]}>Elenco em destaque</Text>
                <Text style={styles.cardLink}>Ver todos</Text>
              </View>
              <View style={styles.playersList}>
                {FEATURED_PLAYERS.map((player, index) => (
                  <View key={player.name} style={[styles.playerRow, index === FEATURED_PLAYERS.length - 1 && styles.playerRowLast]}>
                    <View style={styles.playerAvatar}>
                      <FontAwesome5 color={defaultTheme.text.accent} name="user" size={18} />
                    </View>
                    <View style={styles.playerMainInfo}>
                      <Text style={styles.playerName}>
                        <Text style={styles.playerNumber}>{player.number} </Text>
                        {player.name}
                      </Text>
                      <Text style={styles.playerRole}>{player.role}</Text>
                    </View>
                    <View style={styles.playerBadge}>
                      <FontAwesome5 color={defaultTheme.text.accent} name={index === 0 ? 'crown' : index === 1 ? 'copyright' : 'hand-paper'} size={16} />
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.playersFooter}>
                <View style={styles.playersMiniAvatars}>
                  {[0, 1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.miniAvatar}>
                      <FontAwesome5 color={defaultTheme.text.accent} name="user" size={10} />
                    </View>
                  ))}
                </View>
                <View style={styles.plusCountBadge}>
                  <Text style={styles.plusCountText}>+5</Text>
                </View>
              </View>
            </View>

            <View style={[styles.largeCard, { width: contentCardWidth }, isCompact && styles.largeCardCompact]}>
              <View style={styles.cardTopRow}>
                <Text style={[styles.sectionHeading, isCompact && styles.sectionHeadingCompact]}>Agenda</Text>
                <Text style={styles.cardLink}>Ver agenda</Text>
              </View>
              <View style={styles.agendaList}>
                {AGENDA_ITEMS.map((item, index) => (
                  <View key={`${item.month}-${item.date}`} style={[styles.agendaRow, index === AGENDA_ITEMS.length - 1 && styles.agendaRowLast]}>
                    <View style={styles.agendaDateCard}>
                      <Text style={styles.agendaMonth}>{item.month}</Text>
                      <Text style={styles.agendaDay}>{item.date}</Text>
                    </View>
                    <View style={styles.agendaTextBlock}>
                      <Text style={styles.agendaTitle}>{item.title}</Text>
                      <Text style={styles.agendaSubtitle}>{item.subtitle}</Text>
                    </View>
                    <View style={[styles.agendaStatusDot, index === 0 && styles.agendaStatusDotActive]} />
                  </View>
                ))}
              </View>
            </View>
          </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {BOTTOM_ITEMS.slice(0, 2).map((item) => (
          <Pressable accessibilityRole="button" key={item.label} style={styles.bottomBarItem}>
            <FontAwesome5 color={item.active ? defaultTheme.text.accent : defaultTheme.text.muted} name={item.icon} size={22} />
            <Text style={[styles.bottomBarText, item.active && styles.bottomBarTextActive]}>{item.label}</Text>
          </Pressable>
        ))}

        <View style={styles.fabSpacer} />

        {BOTTOM_ITEMS.slice(2).map((item) => (
          <Pressable accessibilityRole="button" key={item.label} style={styles.bottomBarItem}>
            <View>
              <FontAwesome5 color={item.active ? defaultTheme.text.accent : defaultTheme.text.muted} name={item.icon} size={22} />
              {item.label === 'Notificacoes' ? <View style={styles.notificationDot} /> : null}
            </View>
            <Text style={[styles.bottomBarText, item.active && styles.bottomBarTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable accessibilityRole="button" style={styles.fab}>
        <FontAwesome5 color={components.button.primary.textColor} name="plus" size={34} />
        <Text style={styles.fabText}>Criar</Text>
      </Pressable>
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
    performanceTone: performance === null ? 'Sem base' : performance >= 60 ? 'Boa fase' : performance >= 40 ? 'Oscilando' : 'Em ajuste',
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
  const currentMonth = now.getMonth() + 1;

  return {
    month: true,
    start: true,
    threeMonths: currentMonth > 3,
    sixMonths: currentMonth > 6,
    year: true,
  } as const;
}

function getMatchesForFilter(matches: readonly MockMatch[], filter: SummaryFilterKey, now: Date) {
  const sortedMatches = [...matches].sort((left, right) => right.date.localeCompare(left.date));
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (filter === 'start') {
    return sortedMatches;
  }

  if (filter === 'year') {
    return sortedMatches.filter((match) => getMatchDate(match).getFullYear() === currentYear);
  }

  if (filter === 'month') {
    return sortedMatches.filter((match) => {
      const matchDate = getMatchDate(match);
      return matchDate.getFullYear() === currentYear && matchDate.getMonth() + 1 === currentMonth;
    });
  }

  if (filter === 'threeMonths' || filter === 'sixMonths') {
    const span = filter === 'threeMonths' ? 3 : 6;

    if (currentMonth <= span) {
      return [];
    }

    const startMonth = currentMonth - span;
    const endMonth = currentMonth - 1;

    return sortedMatches.filter((match) => {
      const matchDate = getMatchDate(match);
      const matchMonth = matchDate.getMonth() + 1;
      return matchDate.getFullYear() === currentYear && matchMonth >= startMonth && matchMonth <= endMonth;
    });
  }

  return sortedMatches;
}

function getMatchDate(match: MockMatch) {
  return new Date(`${match.date}T12:00:00`);
}

const styles = StyleSheet.create({
  agendaDateCard: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.cardMuted,
    borderRadius: layout.radius.md,
    justifyContent: 'center',
    minHeight: 64,
    width: 54,
  },
  agendaDay: {
    color: defaultTheme.text.body,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
  },
  agendaList: {
    gap: 12,
  },
  agendaMonth: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: typography.textStyles.caption.lineHeight,
  },
  agendaRow: {
    alignItems: 'center',
    borderBottomColor: defaultTheme.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
  },
  agendaRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  agendaStatusDot: {
    backgroundColor: defaultTheme.text.muted,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  agendaStatusDotActive: {
    backgroundColor: defaultTheme.text.accent,
  },
  agendaSubtitle: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  agendaTextBlock: {
    flex: 1,
    gap: 4,
  },
  agendaTitle: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.body.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.body.lineHeight,
  },
  bottomBar: {
    backgroundColor: 'rgba(16, 16, 16, 0.98)',
    borderTopColor: defaultTheme.border.subtle,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 94,
    left: 0,
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  bottomBarItem: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  bottomBarText: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  bottomBarTextActive: {
    color: defaultTheme.text.accent,
  },
  cardLink: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorLegendDot: {
    borderRadius: 999,
    borderWidth: 1.5,
    height: 18,
    width: 18,
  },
  colorLegendDotOutline: {
    backgroundColor: 'transparent',
  },
  colorLegendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  colorLegendText: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.body.fontSize,
    lineHeight: typography.textStyles.body.lineHeight,
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  crestColumn: {
    justifyContent: 'flex-start',
    marginRight: 16,
    width: 224,
  },
  crestColumnCompact: {
    width: 136,
  },
  crestFallback: {
    alignItems: 'center',
    backgroundColor: 'rgba(14, 14, 14, 0.8)',
    flex: 1,
    justifyContent: 'center',
  },
  crestImage: {
    height: '100%',
    width: '100%',
  },
  crestShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 8, 8, 0.84)',
    borderRadius: 999,
    height: 224,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 224,
  },
  crestShellCompact: {
    height: 136,
    width: 136,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.primaryAction,
    borderRadius: 999,
    bottom: 28,
    height: 120,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -60,
    position: 'absolute',
    width: 120,
  },
  fabSpacer: {
    width: 120,
  },
  fabText: {
    color: components.button.primary.textColor,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingMd.fontSize,
    fontWeight: typography.textStyles.headingMd.fontWeight,
    lineHeight: typography.textStyles.headingMd.lineHeight,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  formBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  formBadgeNegative: {
    backgroundColor: '#C3473F',
  },
  formBadgeNeutral: {
    backgroundColor: '#555555',
  },
  formBadgePositive: {
    backgroundColor: '#4FA44F',
  },
  formBadgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  formBadgeText: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  formMeta: {
    color: '#67C56A',
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingSm.fontSize,
    fontWeight: typography.textStyles.headingSm.fontWeight,
    lineHeight: typography.textStyles.headingSm.lineHeight,
  },
  hero: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    minHeight: 250,
    paddingBottom: 16,
    paddingTop: 8,
  },
  heroCluster: {
    gap: 8,
  },
  topSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
  },
  topSectionInner: {
    alignSelf: 'center',
    width: '100%',
  },
  quickActionsDivider: {
    backgroundColor: defaultTheme.border.subtle,
    height: 1,
    width: '100%',
  },
  heroCompact: {
    gap: 12,
    minHeight: 208,
  },
  heroSubtleText: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  identityColumn: {
    flex: 1,
    gap: 12,
    justifyContent: 'flex-start',
    paddingBottom: 4,
  },
  largeCard: {
    backgroundColor: 'rgba(24, 24, 24, 0.96)',
    borderColor: defaultTheme.border.default,
    borderRadius: layout.radius['2xl'],
    borderWidth: 1,
    gap: 14,
    minHeight: 286,
    padding: 18,
  },
  largeCardCompact: {
    minHeight: 252,
    padding: 14,
  },
  locationDivider: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.body.fontSize,
    lineHeight: typography.textStyles.body.lineHeight,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationText: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.headingMd.fontSize,
    lineHeight: typography.textStyles.headingMd.lineHeight,
  },
  locationTextCompact: {
    fontSize: typography.textStyles.body.fontSize,
    lineHeight: typography.textStyles.body.lineHeight,
  },
  matchCrestBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderColor: defaultTheme.border.subtle,
    borderRadius: layout.radius.xl,
    borderWidth: 1,
    height: 102,
    justifyContent: 'center',
    width: 102,
  },
  matchCrestBoxCompact: {
    height: 74,
    width: 74,
  },
  matchEyebrow: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: typography.textStyles.caption.lineHeight,
    textTransform: 'uppercase',
  },
  matchHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchInfoList: {
    gap: 8,
  },
  matchInfoText: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  matchRound: {
    color: defaultTheme.text.accent,
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  matchVisual: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaPill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  metaPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaPillText: {
    color: defaultTheme.gray[400],
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '400',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  miniAvatar: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.cardMuted,
    borderColor: defaultTheme.border.emphasis,
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    marginRight: -8,
    width: 28,
  },
  notificationDot: {
    backgroundColor: defaultTheme.text.accent,
    borderRadius: 999,
    height: 8,
    position: 'absolute',
    right: -2,
    top: -2,
    width: 8,
  },
  playerAvatar: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.cardMuted,
    borderColor: defaultTheme.border.emphasis,
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  playerBadge: {
    alignItems: 'center',
    borderColor: defaultTheme.border.default,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  playerMainInfo: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.headingMd.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.headingMd.lineHeight,
  },
  playerNumber: {
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
  },
  playerRole: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  playerRow: {
    alignItems: 'center',
    borderBottomColor: defaultTheme.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
  },
  playerRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  playersFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playersList: {
    gap: 12,
  },
  playersMiniAvatars: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  plusCountBadge: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.cardMuted,
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  plusCountText: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: typography.textStyles.caption.lineHeight,
  },
  postAuthor: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.body.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.body.lineHeight,
  },
  postBody: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  postFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  postMetric: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  postMetricText: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.fieldHint.fontSize,
    lineHeight: typography.textStyles.fieldHint.lineHeight,
  },
  postMiniCrest: {
    alignItems: 'center',
    borderColor: defaultTheme.border.emphasis,
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 30,
  },
  postMiniCrestImage: {
    height: '100%',
    width: '100%',
  },
  postPreviewImage: {
    borderRadius: layout.radius.lg,
    height: 118,
    overflow: 'hidden',
  },
  postPreviewFallback: {
    backgroundColor: 'rgba(42, 42, 42, 0.9)',
    flex: 1,
  },
  postTimestamp: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: typography.textStyles.caption.lineHeight,
  },
  primaryInlineAction: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.primaryAction,
    borderRadius: layout.radius.md,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  primaryInlineActionText: {
    color: components.button.primary.textColor,
    fontSize: components.button.primary.textStyle.fontSize,
    fontWeight: components.button.primary.textStyle.fontWeight,
    lineHeight: components.button.primary.textStyle.lineHeight,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
    justifyContent: 'center',
    minHeight: 50,
    position: 'relative',
  },
  quickActionsBar: {
    flexDirection: 'row',
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    zIndex: 2,
  },
  quickActionsBarCompact: {
    marginBottom: 0,
  },
  quickActionText: {
    color: defaultTheme.gray[400],
    fontSize: typography.baseFontSize * 0.75,
    lineHeight: typography.baseFontSize * 0.875,
    textAlign: 'center',
  },
  quickActionTextCompact: {
    fontSize: typography.baseFontSize * 0.75,
    lineHeight: typography.baseFontSize * 0.875,
  },
  contentSection: {
    alignSelf: 'center',
    gap: 16,
    width: '100%',
  },
  screen: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 190,
    paddingTop: layout.shell.pagePaddingTop,
  },
  scrollContentCompact: {
    paddingTop: 18,
  },
  sectionHeading: {
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
    textTransform: 'uppercase',
  },
  sectionHeadingCompact: {
    fontSize: typography.textStyles.headingMd.fontSize,
    lineHeight: typography.textStyles.headingMd.lineHeight,
  },
  shareButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(22, 22, 22, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.34)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 18,
  },
  shareButtonText: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.headingMd.fontSize,
    lineHeight: typography.textStyles.headingMd.lineHeight,
  },
  shareButtonTextCompact: {
    fontSize: typography.textStyles.body.fontSize,
    lineHeight: typography.textStyles.body.lineHeight,
  },
  shell: {
    alignSelf: 'center',
    gap: 16,
    maxWidth: 920,
    width: '100%',
  },
  smallCrestImage: {
    height: '100%',
    width: '100%',
  },
  statColumn: {
    flex: 1,
    gap: 8,
    minWidth: 56,
  },
  statLabel: {
    color: defaultTheme.text.muted,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: typography.textStyles.caption.lineHeight,
    overflow: 'hidden',
    textTransform: 'uppercase',
    width: '100%',
  },
  statMeta: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: typography.textStyles.caption.lineHeight,
  },
  statsDivider: {
    backgroundColor: defaultTheme.border.subtle,
    height: 102,
    width: 1,
  },
  statsPanel: {
    backgroundColor: 'rgba(24, 24, 24, 0.96)',
    borderColor: defaultTheme.border.default,
    borderRadius: layout.radius['2xl'],
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  statsPanelCompact: {
    paddingHorizontal: 12,
  },
  summaryBottomRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  summaryBottomRowCompact: {
    alignItems: 'stretch',
  },
  summaryDesktopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  summaryFilterBadge: {
    alignItems: 'center',
    borderColor: defaultTheme.border.default,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  summaryFilterBadgeActive: {
    backgroundColor: defaultTheme.surface.primaryAction,
    borderColor: defaultTheme.surface.primaryAction,
  },
  summaryFilterBadgeDisabled: {
    opacity: 0.32,
  },
  summaryFilterBadgeText: {
    color: defaultTheme.text.subdued,
    fontSize: typography.textStyles.caption.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.caption.lineHeight,
  },
  summaryFilterBadgeTextActive: {
    color: components.button.primary.textColor,
  },
  summaryFilterBadgeTextDisabled: {
    color: defaultTheme.text.muted,
  },
  summaryFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryHistoryBlock: {
    flex: 1.6,
    gap: 10,
    minWidth: 0,
  },
  summaryHistoryBlockCompact: {
    minWidth: 0,
  },
  summaryHistoryBlockDesktop: {
    flex: 1.5,
    gap: 10,
    maxWidth: 180,
    minWidth: 0,
  },
  summaryMetricItem: {
    flex: 1,
    minWidth: 72,
  },
  summaryMetricItemDesktop: {
    flex: 0,
    maxWidth: 90,
    width: '100%',
  },
  summaryMetricContent: {
    alignItems: 'stretch',
    gap: 8,
    overflow: 'hidden',
    width: '100%',
  },
  summaryMetricItemCompact: {
    maxWidth: 65,
    minWidth: 65,
    width: 65,
  },
  summaryMetricValue: {
    alignSelf: 'flex-start',
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: 28,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: 30,
  },
  summaryMetricValueCompact: {
    fontSize: 24,
    lineHeight: 26,
  },
  summaryPerformanceBlock: {
    alignItems: 'stretch',
    gap: 8,
    minWidth: 108,
    width: 112,
  },
  summaryPerformanceBlockCompact: {
    minWidth: 0,
    width: '34%',
  },
  summaryPerformanceBlockDesktop: {
    alignItems: 'stretch',
    gap: 8,
    maxWidth: 110,
    minWidth: 84,
  },
  summaryTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  summaryTopRowCompact: {
    gap: 5,
  },
  teamName: {
    color: defaultTheme.color.primary,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: 60,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: 60,
  },
  teamNameCompact: {
    fontSize: 30,
    lineHeight: 32,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  verifiedBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: defaultTheme.surface.primaryAction,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  verifiedBadgeText: {
    color: components.button.primary.textColor,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.fieldHint.fontSize,
    fontWeight: '700',
    lineHeight: typography.textStyles.fieldHint.lineHeight,
    textTransform: 'uppercase',
  },
  versusText: {
    color: defaultTheme.text.body,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 40,
  },
  versusTextCompact: {
    fontSize: 28,
    lineHeight: 30,
  },
});
