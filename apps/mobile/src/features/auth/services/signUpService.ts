import { supabase } from '../../../lib/supabase';

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'buscar',
  'configuracoes',
  'conta',
  'explorar',
  'futstats',
  'home',
  'inicio',
  'login',
  'me',
  'notifications',
  'notificacoes',
  'perfil',
  'search',
  'settings',
  'signup',
  'suporte',
  'team',
  'teams',
  'time',
  'times',
  'user',
  'users',
]);

export type UsernameValidationCode =
  | 'EMPTY'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'INVALID_FORMAT'
  | 'RESERVED'
  | 'OK';

export type UsernameValidationResult = {
  code: UsernameValidationCode;
  valid: boolean;
  username: string;
};

export type UsernameAvailabilityResult = {
  available: boolean;
  error?: string;
  username: string;
};

export type ResolveUsernameSuggestionResult = {
  checkedCandidates: string[];
  selectedUsername: string;
  selectedUsernameAvailable: boolean;
};

export type SignUpPayloadInput = {
  contactPhone?: string | null;
  displayName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  username: string;
};

export function normalizeDisplayName(input: string) {
  return input.replace(/\s+/g, ' ').trim();
}

export function normalizeUsernameCandidate(input: string) {
  const ascii = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/['’`"]/g, '')
    .replace(/[^a-z0-9._\s-]/g, ' ')
    .replace(/[.\s-]+/g, '')
    .trim();

  return ascii.slice(0, USERNAME_MAX_LENGTH);
}

export function validateUsernameCandidate(input: string): UsernameValidationResult {
  const username = normalizeUsernameCandidate(input);

  if (!username) {
    return { code: 'EMPTY', valid: false, username };
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return { code: 'TOO_SHORT', valid: false, username };
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return { code: 'TOO_LONG', valid: false, username };
  }

  if (!/^[a-z0-9._]+$/.test(username)) {
    return { code: 'INVALID_FORMAT', valid: false, username };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { code: 'RESERVED', valid: false, username };
  }

  return { code: 'OK', valid: true, username };
}

export function buildUsernameSuggestionCandidates(displayName: string) {
  const normalizedDisplayName = normalizeDisplayName(displayName);
  const words = normalizedDisplayName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);

  const primaryBase = normalizeUsernameCandidate(words.join(''));
  const twoWordBase = normalizeUsernameCandidate(words.slice(0, 2).join(''));
  const initialsBase = normalizeUsernameCandidate(
    words.length > 1 ? `${words[0] ?? ''}${words.slice(1).map((word) => word[0]).join('')}` : primaryBase,
  );

  const fallbackBase = primaryBase || twoWordBase || initialsBase || 'jogador';
  const uniqueCandidates = new Set<string>();

  [primaryBase, twoWordBase, initialsBase, fallbackBase].forEach((candidate) => {
    const validation = validateUsernameCandidate(candidate);

    if (validation.valid) {
      uniqueCandidates.add(validation.username);
    }
  });

  for (let suffix = 1; suffix <= 20; suffix += 1) {
    const suffixLabel = `${suffix}`.padStart(2, '0');
    const base = fallbackBase.slice(0, Math.max(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH - suffixLabel.length));
    const candidate = normalizeUsernameCandidate(`${base}${suffixLabel}`);
    const validation = validateUsernameCandidate(candidate);

    if (validation.valid) {
      uniqueCandidates.add(validation.username);
    }
  }

  return Array.from(uniqueCandidates);
}

export async function checkUsernameAvailability(username: string): Promise<UsernameAvailabilityResult> {
  const validation = validateUsernameCandidate(username);

  if (!validation.valid) {
    return {
      available: false,
      error: validation.code,
      username: validation.username,
    };
  }

  const { data, error } = await supabase.rpc('check_username_availability', {
    p_username: validation.username,
  });

  if (error) {
    return {
      available: false,
      error: error.message,
      username: validation.username,
    };
  }

  const resolvedUsername = typeof data?.username === 'string' ? data.username : validation.username;
  const available = data?.available === true;
  const resolvedError = typeof data?.error === 'string' ? data.error : undefined;

  return {
    available,
    error: resolvedError,
    username: resolvedUsername,
  };
}

export async function resolveUsernameSuggestion(displayName: string): Promise<ResolveUsernameSuggestionResult> {
  const candidates = buildUsernameSuggestionCandidates(displayName);

  for (const candidate of candidates) {
    const availability = await checkUsernameAvailability(candidate);

    if (availability.available) {
      return {
        checkedCandidates: candidates,
        selectedUsername: availability.username,
        selectedUsernameAvailable: true,
      };
    }
  }

  return {
    checkedCandidates: candidates,
    selectedUsername: candidates[0] ?? 'jogador',
    selectedUsernameAvailable: false,
  };
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  return password.trim().length >= 8 && password === confirmation;
}

export function buildSignUpPayload(input: SignUpPayloadInput) {
  return {
    contact_phone: input.contactPhone?.trim() || null,
    display_name: normalizeDisplayName(input.displayName),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    terms_accepted: input.termsAccepted,
    username: validateUsernameCandidate(input.username).username,
  };
}
