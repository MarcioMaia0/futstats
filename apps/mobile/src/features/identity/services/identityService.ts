import { supabase } from '../../../lib/supabase';

const USER_AVATAR_BUCKET = 'user-avatars';

export type StartPathChoice = 'CREATE_TEAM' | 'JOIN_TEAM' | 'EXPLORE';
export type CompleteMyProfilePayload = {
  avatarUploadToken?: string | null;
  contactPhone?: string | null;
  displayName: string;
  username: string;
};

export async function bootstrapCurrentUser() {
  const { data, error } = await supabase.rpc('bootstrap_current_user');

  if (error) {
    throw error;
  }

  await syncCurrentUserProviderAvatar();

  return data;
}

async function syncCurrentUserProviderAvatar() {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return;
    }

    const providerAvatarUrl = resolveProviderAvatarUrl(authData.user.user_metadata);

    if (!providerAvatarUrl) {
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const currentAvatarUrl = typeof profile?.avatar_url === 'string' ? profile.avatar_url : null;

    if (currentAvatarUrl && !isProviderAvatarUrl(currentAvatarUrl)) {
      return;
    }

    const uploadedAvatarUrl = await uploadProviderAvatarToStorage(authData.user.id, providerAvatarUrl);

    if (!uploadedAvatarUrl) {
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: uploadedAvatarUrl })
      .eq('id', authData.user.id);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.warn('Could not sync provider avatar.', error);
  }
}

function resolveProviderAvatarUrl(metadata: Record<string, unknown> | null | undefined) {
  const avatarUrl = typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : null;
  const pictureUrl = typeof metadata?.picture === 'string' ? metadata.picture : null;

  return avatarUrl || pictureUrl;
}

function isProviderAvatarUrl(value: string) {
  return value.includes('googleusercontent.com') || value.includes('googleapis.com');
}

async function uploadProviderAvatarToStorage(userId: string, providerAvatarUrl: string) {
  const response = await fetch(providerAvatarUrl);

  if (!response.ok) {
    return null;
  }

  const contentType = normalizeAvatarContentType(response.headers.get('content-type'));

  if (!contentType) {
    return null;
  }

  const fileExtension = getAvatarFileExtension(contentType);
  const arrayBuffer = await response.arrayBuffer();
  const storagePath = `${userId}/provider-avatar.${fileExtension}`;
  const { error: uploadError } = await supabase.storage
    .from(USER_AVATAR_BUCKET)
    .upload(storagePath, arrayBuffer, {
      cacheControl: '31536000',
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(USER_AVATAR_BUCKET).getPublicUrl(storagePath);
  const cacheBuster = Date.now();

  return `${data.publicUrl}?v=${cacheBuster}`;
}

function normalizeAvatarContentType(value: string | null) {
  const contentType = value?.split(';')[0]?.trim().toLowerCase();

  if (contentType === 'image/jpeg' || contentType === 'image/png' || contentType === 'image/webp') {
    return contentType;
  }

  return null;
}

function getAvatarFileExtension(contentType: 'image/jpeg' | 'image/png' | 'image/webp') {
  if (contentType === 'image/png') {
    return 'png';
  }

  if (contentType === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

export async function getMe() {
  const { data, error } = await supabase.rpc('get_me');

  if (error) {
    throw error;
  }

  return data;
}

export async function completeStartPathChoice(choice: StartPathChoice) {
  const { data, error } = await supabase.rpc('complete_start_path_choice', {
    p_choice: choice,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function completeMyProfile({
  avatarUploadToken = null,
  contactPhone = null,
  displayName,
  username,
}: CompleteMyProfilePayload) {
  const { data, error } = await supabase.rpc('complete_my_profile', {
    p_payload: {
      avatar_upload_token: avatarUploadToken,
      contact_phone: contactPhone?.trim() || null,
      display_name: displayName.trim(),
      username: username.trim().toLowerCase(),
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
