import { Platform } from 'react-native';

import { supabase } from '../../../lib/supabase';

type EmailAuthPayload = {
  email: string;
  password: string;
};

type IdentifierAuthPayload = {
  identifier: string;
  password: string;
};

type SignUpWithEmailPayload = EmailAuthPayload & {
  contactPhone?: string | null;
  displayName: string;
  termsAccepted: boolean;
  username: string;
};

function getRedirectTo() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  return undefined;
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectTo(),
    },
  });
}

export async function signInWithEmailPassword({ email, password }: EmailAuthPayload) {
  return signInWithResolvedEmail(email, password);
}

export async function signInWithIdentifierPassword({ identifier, password }: IdentifierAuthPayload) {
  const normalizedIdentifier = identifier.trim();

  if (normalizedIdentifier.includes('@') && !normalizedIdentifier.startsWith('@')) {
    return signInWithResolvedEmail(normalizedIdentifier, password);
  }

  const resolvedEmail = await resolveLoginIdentifier(normalizedIdentifier);

  if (!resolvedEmail) {
    return buildInvalidCredentialsResult();
  }

  return signInWithResolvedEmail(resolvedEmail, password);
}

async function signInWithResolvedEmail(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (result.error) {
    const normalizedMessage = normalizeAuthErrorMessage(result.error.message);
    return {
      ...result,
      error: {
        ...result.error,
        message: normalizedMessage,
      },
    };
  }

  return result;
}

async function resolveLoginIdentifier(identifier: string) {
  const { data, error } = await supabase.rpc('resolve_login_identifier', {
    p_identifier: identifier,
  });

  if (error || typeof data !== 'string') {
    return null;
  }

  return data;
}

function buildInvalidCredentialsResult() {
  return {
    data: {
      session: null,
      user: null,
    },
    error: {
      message: 'Identificador ou senha incorretos.',
      name: 'AuthApiError',
      status: 400,
    },
  };
}

export async function signUpWithEmail({
  contactPhone = null,
  displayName,
  email,
  password,
  termsAccepted,
  username,
}: SignUpWithEmailPayload) {
  return supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        contact_phone: contactPhone?.trim() || null,
        display_name: displayName.trim(),
        full_name: displayName.trim(),
        name: displayName.trim(),
        terms_accepted: termsAccepted,
        username: username.trim().toLowerCase(),
      },
      emailRedirectTo: getRedirectTo(),
    },
  });
}

export async function signOutCurrentUser() {
  return supabase.auth.signOut();
}

function normalizeAuthErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('email not confirmed')
  ) {
    return 'Identificador ou senha incorretos.';
  }

  if (normalized.includes('email rate limit exceeded')) {
    return 'Muitas tentativas seguidas. Aguarde um pouco e tente novamente.';
  }

  return 'Não foi possível entrar agora. Tente novamente.';
}
