import { supabase } from '../../../lib/supabase';
import type { ModalityPositionCode } from '../../../config/modalityPositions';
import type { SportModality } from './teamService';

export type TeamRosterRole = 'PLAYER' | 'COMMITTEE' | 'DIRECTOR' | 'PRESIDENT';

export type TeamRosterMember = {
  avatarUrl: string | null;
  displayName: string;
  fullName: string | null;
  frameDefaultsByModality: Partial<Record<SportModality, 'UNASSIGNED' | 'FIRST_FRAME' | 'SECOND_FRAME'>>;
  hasLinkedUser: boolean;
  id: string;
  isOperational: boolean;
  joinedAtLabel: string;
  nickname: string | null;
  positionLabelsByModality: Partial<Record<SportModality, string[]>>;
  positionLabel: string | null;
  roles: TeamRosterRole[];
  shirtNumber: number | null;
};

export type CreateQuickTeamRosterPersonPayload = {
  addAsPlayer: boolean;
  dominantFoot: 'RIGHT' | 'LEFT' | 'BOTH' | null;
  fullName: string;
  modality: string | null;
  nickname: string;
  positionCodes: string[];
  sportContexts?: Partial<Record<SportModality, {
    frameType: 'UNASSIGNED' | 'FIRST_FRAME' | 'SECOND_FRAME';
    positionCodes: ModalityPositionCode[];
  }>>;
};

type TeamMemberRow = {
  id: string;
  joined_at: string | null;
  person_id: string;
};

type PersonRow = {
  avatar_media_id: string | null;
  full_name: string | null;
  id: string;
  nickname: string | null;
};

type UserRow = {
  avatar_url: string | null;
  display_name: string | null;
  id: string;
  person_id: string;
};

type PlayerPositionRow = {
  modality_position_id: string;
  player_id: string;
};

type TeamPlayerRow = {
  player_id: string;
  team_member_id: string;
};

type ModalityPositionRow = {
  id: string;
  label: string;
  modality: SportModality;
  sort_order: number;
};

type UserTeamRoleRow = {
  role: TeamRosterRole;
  user_id: string;
};

type MediaAssetRow = {
  id: string;
  public_url: string | null;
};

type TeamPlayerFrameDefaultRow = {
  default_frame_type: 'UNASSIGNED' | 'FIRST_FRAME' | 'SECOND_FRAME';
  modality: SportModality;
  player_id: string;
};

export async function fetchTeamRoster(teamId: string): Promise<TeamRosterMember[]> {
  const { data: memberRows, error: membersError } = await supabase
    .from('team_members')
    .select('id, person_id, joined_at')
    .eq('team_id', teamId)
    .eq('membership_status', 'ACTIVE')
    .order('joined_at', { ascending: true, nullsFirst: false });

  if (membersError) {
    throw membersError;
  }

  const members = (memberRows ?? []) as TeamMemberRow[];

  if (!members.length) {
    return [];
  }

  const personIds = uniqueValues(members.map((member) => member.person_id));

  const memberIds = uniqueValues(members.map((member) => member.id));

  const [
    { data: personRows, error: personsError },
    { data: userRows, error: usersError },
    { data: teamPlayerRows, error: teamPlayersError },
  ] = await Promise.all([
    supabase
      .from('persons')
      .select('id, full_name, nickname, avatar_media_id')
      .in('id', personIds),
    supabase
      .from('users')
      .select('id, person_id, display_name, avatar_url')
      .in('person_id', personIds)
      .is('deleted_at', null),
    supabase
      .from('team_players')
      .select('team_member_id, player_id')
      .in('team_member_id', memberIds)
      .eq('status', 'ACTIVE'),
  ]);

  if (personsError) {
    throw personsError;
  }

  if (usersError) {
    throw usersError;
  }

  if (teamPlayersError) {
    throw teamPlayersError;
  }

  const people = (personRows ?? []) as PersonRow[];
  const users = (userRows ?? []) as UserRow[];
  const teamPlayers = (teamPlayerRows ?? []) as TeamPlayerRow[];

  const userIds = uniqueValues(users.map((user) => user.id));
  const playerIds = uniqueValues(teamPlayers.map((teamPlayer) => teamPlayer.player_id));
  const avatarMediaIds = uniqueValues(people.map((person) => person.avatar_media_id).filter(Boolean) as string[]);

  const [
    { data: roleRows, error: rolesError },
    { data: playerPositionRows, error: playerPositionsError },
    { data: frameDefaultRows, error: frameDefaultsError },
    { data: mediaRows, error: mediaError },
  ] = await Promise.all([
    userIds.length
      ? supabase
          .from('user_team_roles')
          .select('user_id, role')
          .eq('team_id', teamId)
          .is('revoked_at', null)
          .in('user_id', userIds)
      : Promise.resolve({ data: [], error: null }),
    playerIds.length
      ? supabase
          .from('player_positions')
          .select('player_id, modality_position_id')
          .in('player_id', playerIds)
      : Promise.resolve({ data: [], error: null }),
    playerIds.length
      ? supabase
          .from('team_player_frame_defaults')
          .select('player_id, modality, default_frame_type')
          .eq('team_id', teamId)
          .in('player_id', playerIds)
      : Promise.resolve({ data: [], error: null }),
    avatarMediaIds.length
      ? supabase
          .from('media_assets')
          .select('id, public_url')
          .in('id', avatarMediaIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (rolesError) {
    throw rolesError;
  }

  if (playerPositionsError) {
    throw playerPositionsError;
  }

  if (frameDefaultsError) {
    throw frameDefaultsError;
  }

  if (mediaError) {
    throw mediaError;
  }

  const positionRows = (playerPositionRows ?? []) as PlayerPositionRow[];
  const modalityPositionIds = uniqueValues(positionRows.map((position) => position.modality_position_id));
  const { data: modalityPositionRows, error: modalityPositionsError } = modalityPositionIds.length
    ? await supabase
        .from('modality_positions')
        .select('id, label, modality, sort_order')
        .in('id', modalityPositionIds)
        .order('sort_order', { ascending: true })
    : { data: [], error: null };

  if (modalityPositionsError) {
    throw modalityPositionsError;
  }

  const personById = new Map(people.map((person) => [person.id, person]));
  const userByPersonId = new Map(users.map((user) => [user.person_id, user]));
  const teamPlayerByMemberId = new Map(teamPlayers.map((teamPlayer) => [teamPlayer.team_member_id, teamPlayer]));
  const mediaById = new Map(((mediaRows ?? []) as MediaAssetRow[]).map((media) => [media.id, media]));
  const rolesByUserId = groupRolesByUserId((roleRows ?? []) as UserTeamRoleRow[]);
  const positionLabelsByPlayerId = groupPositionLabelsByPlayerId(
    positionRows,
    (modalityPositionRows ?? []) as ModalityPositionRow[],
  );
  const positionLabelsByModalityByPlayerId = groupPositionLabelsByModalityByPlayerId(
    positionRows,
    (modalityPositionRows ?? []) as ModalityPositionRow[],
  );
  const frameDefaultsByPlayerId = groupFrameDefaultsByPlayerId((frameDefaultRows ?? []) as TeamPlayerFrameDefaultRow[]);

  return members.map((member) => {
    const person = personById.get(member.person_id);
    const user = userByPersonId.get(member.person_id);
    const teamPlayer = teamPlayerByMemberId.get(member.id);
    const roles = uniqueRoles([
      ...(teamPlayer ? ['PLAYER' as TeamRosterRole] : []),
      ...(user ? rolesByUserId.get(user.id) ?? [] : []),
    ]);
    const displayName = normalizeDisplayName(user?.display_name, person?.nickname, person?.full_name);
    const avatarUrl = user?.avatar_url ?? (person?.avatar_media_id ? mediaById.get(person.avatar_media_id)?.public_url ?? null : null);
    const positionLabels = teamPlayer ? positionLabelsByPlayerId.get(teamPlayer.player_id) ?? [] : [];
    const positionLabelsByModality = teamPlayer ? positionLabelsByModalityByPlayerId.get(teamPlayer.player_id) ?? {} : {};
    const frameDefaultsByModality = teamPlayer ? frameDefaultsByPlayerId.get(teamPlayer.player_id) ?? {} : {};

    return {
      avatarUrl,
      displayName,
      frameDefaultsByModality,
      fullName: person?.full_name ?? null,
      hasLinkedUser: Boolean(user),
      id: member.id,
      isOperational: !user,
      joinedAtLabel: formatJoinedAtLabel(member.joined_at, Boolean(user)),
      nickname: person?.nickname ?? null,
      positionLabelsByModality,
      positionLabel: positionLabels.length ? positionLabels.join(', ') : null,
      roles,
      shirtNumber: null,
    };
  });
}

export async function createQuickTeamRosterPerson(
  teamId: string,
  payload: CreateQuickTeamRosterPersonPayload,
): Promise<void> {
  const { error } = await supabase.rpc('create_team_roster_quick_person', {
    p_payload: {
      add_as_player: payload.addAsPlayer,
      dominant_foot: payload.dominantFoot,
      full_name: payload.fullName,
      modality: payload.modality,
      nickname: payload.nickname,
      position_codes: payload.positionCodes,
      sport_contexts: buildSportContextsPayload(payload.sportContexts),
    },
    p_team_id: teamId,
  });

  if (error) {
    throw error;
  }
}

function buildSportContextsPayload(
  sportContexts?: CreateQuickTeamRosterPersonPayload['sportContexts'],
) {
  return Object.entries(sportContexts ?? {}).map(([modality, context]) => ({
    default_frame_type: context?.frameType ?? 'UNASSIGNED',
    modality,
    position_codes: context?.positionCodes ?? [],
  }));
}

function groupRolesByUserId(rows: UserTeamRoleRow[]) {
  const grouped = new Map<string, TeamRosterRole[]>();

  for (const row of rows) {
    grouped.set(row.user_id, uniqueRoles([...(grouped.get(row.user_id) ?? []), row.role]));
  }

  return grouped;
}

function groupPositionLabelsByPlayerId(rows: PlayerPositionRow[], modalityPositions: ModalityPositionRow[]) {
  const labelByPositionId = new Map(modalityPositions.map((position) => [position.id, position.label]));
  const grouped = new Map<string, string[]>();

  for (const row of rows) {
    const label = labelByPositionId.get(row.modality_position_id);

    if (!label) {
      continue;
    }

    grouped.set(row.player_id, uniqueValues([...(grouped.get(row.player_id) ?? []), label]));
  }

  return grouped;
}

function groupPositionLabelsByModalityByPlayerId(rows: PlayerPositionRow[], modalityPositions: ModalityPositionRow[]) {
  const positionById = new Map(modalityPositions.map((position) => [position.id, position]));
  const grouped = new Map<string, Partial<Record<SportModality, string[]>>>();

  for (const row of rows) {
    const position = positionById.get(row.modality_position_id);

    if (!position) {
      continue;
    }

    const current = grouped.get(row.player_id) ?? {};
    current[position.modality] = uniqueValues([...(current[position.modality] ?? []), position.label]);
    grouped.set(row.player_id, current);
  }

  return grouped;
}

function groupFrameDefaultsByPlayerId(rows: TeamPlayerFrameDefaultRow[]) {
  const grouped = new Map<string, Partial<Record<SportModality, 'UNASSIGNED' | 'FIRST_FRAME' | 'SECOND_FRAME'>>>();

  for (const row of rows) {
    const current = grouped.get(row.player_id) ?? {};
    current[row.modality] = row.default_frame_type;
    grouped.set(row.player_id, current);
  }

  return grouped;
}

function normalizeDisplayName(...values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? 'Integrante sem nome';
}

function formatJoinedAtLabel(value: string | null, hasLinkedUser: boolean) {
  if (!value) {
    return hasLinkedUser ? 'Integrante vinculado ao time' : 'Cadastro rapido do time';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return hasLinkedUser ? 'Integrante vinculado ao time' : 'Cadastro rapido do time';
  }

  return `No elenco desde ${parsed.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
}

function uniqueRoles(values: TeamRosterRole[]) {
  return Array.from(new Set(values));
}

function uniqueValues<T>(values: T[]) {
  return Array.from(new Set(values));
}
