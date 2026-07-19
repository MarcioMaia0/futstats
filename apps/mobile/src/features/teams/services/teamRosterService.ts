export type TeamRosterRole = 'PLAYER' | 'COMMITTEE' | 'DIRECTOR' | 'PRESIDENT';

export type TeamRosterMember = {
  avatarUrl: string | null;
  displayName: string;
  fullName: string | null;
  hasLinkedUser: boolean;
  id: string;
  isOperational: boolean;
  joinedAtLabel: string;
  nickname: string | null;
  positionLabel: string | null;
  roles: TeamRosterRole[];
  shirtNumber: number | null;
};

export async function fetchTeamRoster(teamId: string): Promise<TeamRosterMember[]> {
  void teamId;

  return [
    {
      avatarUrl: null,
      displayName: 'Gui Silva',
      fullName: 'Guilherme Silva',
      hasLinkedUser: true,
      id: 'roster-gui',
      isOperational: false,
      joinedAtLabel: 'No elenco desde jun/2026',
      nickname: 'Gui Silva',
      positionLabel: 'Pivô',
      roles: ['PLAYER'],
      shirtNumber: 7,
    },
    {
      avatarUrl: null,
      displayName: 'Dudu',
      fullName: 'Eduardo Lima',
      hasLinkedUser: false,
      id: 'roster-dudu',
      isOperational: true,
      joinedAtLabel: 'Cadastro rápido do time',
      nickname: 'Dudu',
      positionLabel: 'Ala',
      roles: ['PLAYER'],
      shirtNumber: 10,
    },
    {
      avatarUrl: null,
      displayName: 'Rato',
      fullName: 'Mateus Rocha',
      hasLinkedUser: true,
      id: 'roster-rato',
      isOperational: false,
      joinedAtLabel: 'No elenco desde mai/2026',
      nickname: 'Rato',
      positionLabel: 'Goleiro',
      roles: ['PLAYER'],
      shirtNumber: 1,
    },
    {
      avatarUrl: null,
      displayName: 'Márcio Maia',
      fullName: 'Márcio Maia',
      hasLinkedUser: true,
      id: 'roster-marcio',
      isOperational: false,
      joinedAtLabel: 'Gestão inicial do time',
      nickname: null,
      positionLabel: 'Ala',
      roles: ['DIRECTOR', 'PLAYER'],
      shirtNumber: null,
    },
    {
      avatarUrl: null,
      displayName: 'Renata Souza',
      fullName: 'Renata Souza',
      hasLinkedUser: false,
      id: 'roster-renata',
      isOperational: true,
      joinedAtLabel: 'Cadastro rápido do time',
      nickname: null,
      positionLabel: null,
      roles: ['COMMITTEE'],
      shirtNumber: null,
    },
  ];
}
