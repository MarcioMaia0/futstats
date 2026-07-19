import type { SportModality } from '../features/teams/services/teamService';

export type ModalityPositionCode =
  | 'GOALKEEPER'
  | 'FIXED_DEFENDER'
  | 'RIGHT_WINGER'
  | 'LEFT_WINGER'
  | 'PIVOT'
  | 'RIGHT_CENTER_BACK'
  | 'LEFT_CENTER_BACK'
  | 'RIGHT_BACK'
  | 'LEFT_BACK'
  | 'DEFENSIVE_MIDFIELDER'
  | 'CENTRAL_MIDFIELDER'
  | 'ATTACKING_MIDFIELDER'
  | 'CENTER_FORWARD'
  | 'SECOND_STRIKER'
  | 'CENTER_BACK'
  | 'STRIKER';

export type ModalityPositionGroup = 'GOL' | 'DEFESA' | 'MEIO' | 'ATAQUE';

export type ModalityPositionOption = {
  code: ModalityPositionCode;
  group: ModalityPositionGroup;
  label: string;
  shortLabel: string;
  sortOrder: number;
};

export const FUTSAL_POSITION_OPTIONS: ModalityPositionOption[] = [
  { code: 'GOALKEEPER', group: 'GOL', label: 'Goleiro', shortLabel: 'GOL', sortOrder: 1 },
  { code: 'FIXED_DEFENDER', group: 'DEFESA', label: 'Fixo', shortLabel: 'FIX', sortOrder: 2 },
  { code: 'RIGHT_WINGER', group: 'MEIO', label: 'Ala direito', shortLabel: 'AD', sortOrder: 3 },
  { code: 'LEFT_WINGER', group: 'MEIO', label: 'Ala esquerdo', shortLabel: 'AE', sortOrder: 4 },
  { code: 'PIVOT', group: 'ATAQUE', label: 'Pivo', shortLabel: 'PIV', sortOrder: 5 },
];

export const FIELD_POSITION_OPTIONS: ModalityPositionOption[] = [
  { code: 'GOALKEEPER', group: 'GOL', label: 'Goleiro', shortLabel: 'GOL', sortOrder: 1 },
  { code: 'RIGHT_CENTER_BACK', group: 'DEFESA', label: 'Zagueiro direito', shortLabel: 'ZD', sortOrder: 2 },
  { code: 'LEFT_CENTER_BACK', group: 'DEFESA', label: 'Zagueiro esquerdo', shortLabel: 'ZE', sortOrder: 3 },
  { code: 'RIGHT_BACK', group: 'DEFESA', label: 'Lateral direito', shortLabel: 'LD', sortOrder: 4 },
  { code: 'LEFT_BACK', group: 'DEFESA', label: 'Lateral esquerdo', shortLabel: 'LE', sortOrder: 5 },
  { code: 'DEFENSIVE_MIDFIELDER', group: 'MEIO', label: 'Volante', shortLabel: 'VOL', sortOrder: 6 },
  { code: 'CENTRAL_MIDFIELDER', group: 'MEIO', label: 'Meia central', shortLabel: 'MC', sortOrder: 7 },
  { code: 'ATTACKING_MIDFIELDER', group: 'MEIO', label: 'Meia ofensivo', shortLabel: 'MO', sortOrder: 8 },
  { code: 'RIGHT_WINGER', group: 'ATAQUE', label: 'Ponta direita', shortLabel: 'PD', sortOrder: 9 },
  { code: 'LEFT_WINGER', group: 'ATAQUE', label: 'Ponta esquerda', shortLabel: 'PE', sortOrder: 10 },
  { code: 'SECOND_STRIKER', group: 'ATAQUE', label: 'Segundo atacante', shortLabel: 'SA', sortOrder: 11 },
  { code: 'CENTER_FORWARD', group: 'ATAQUE', label: 'Centroavante', shortLabel: 'ATA', sortOrder: 12 },
];

export const SOCIETY_POSITION_OPTIONS: ModalityPositionOption[] = [
  { code: 'GOALKEEPER', group: 'GOL', label: 'Goleiro', shortLabel: 'GOL', sortOrder: 1 },
  { code: 'CENTER_BACK', group: 'DEFESA', label: 'Zagueiro', shortLabel: 'ZAG', sortOrder: 2 },
  { code: 'RIGHT_BACK', group: 'DEFESA', label: 'Lateral direito', shortLabel: 'LD', sortOrder: 3 },
  { code: 'LEFT_BACK', group: 'DEFESA', label: 'Lateral esquerdo', shortLabel: 'LE', sortOrder: 4 },
  { code: 'DEFENSIVE_MIDFIELDER', group: 'MEIO', label: 'Volante', shortLabel: 'VOL', sortOrder: 5 },
  { code: 'CENTRAL_MIDFIELDER', group: 'MEIO', label: 'Meio-campista', shortLabel: 'MC', sortOrder: 6 },
  { code: 'RIGHT_WINGER', group: 'MEIO', label: 'Ala direita', shortLabel: 'AD', sortOrder: 7 },
  { code: 'LEFT_WINGER', group: 'MEIO', label: 'Ala esquerda', shortLabel: 'AE', sortOrder: 8 },
  { code: 'STRIKER', group: 'ATAQUE', label: 'Atacante', shortLabel: 'ATA', sortOrder: 9 },
  { code: 'CENTER_FORWARD', group: 'ATAQUE', label: 'Centroavante', shortLabel: 'CA', sortOrder: 10 },
];

export function getModalityPositionOptions(modality: SportModality): ModalityPositionOption[] {
  if (modality === 'FIELD') {
    return FIELD_POSITION_OPTIONS;
  }

  if (modality === 'SOCIETY') {
    return SOCIETY_POSITION_OPTIONS;
  }

  return FUTSAL_POSITION_OPTIONS;
}

export function getModalityPositionLabel(modality: SportModality, code: ModalityPositionCode): string {
  return getModalityPositionOptions(modality).find((option) => option.code === code)?.label ?? code;
}

export function getModalityPositionShortLabel(modality: SportModality, code: ModalityPositionCode): string {
  return getModalityPositionOptions(modality).find((option) => option.code === code)?.shortLabel ?? code;
}

export function getModalityLabel(modality: SportModality): string {
  if (modality === 'FIELD') {
    return 'Campo';
  }

  if (modality === 'SOCIETY') {
    return 'Society';
  }

  return 'Futsal';
}
