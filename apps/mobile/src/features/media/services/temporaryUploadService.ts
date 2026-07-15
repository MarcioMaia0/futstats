import { supabase } from '../../../lib/supabase';

type TemporaryUploadPurpose = 'TEAM_CREST';
type TemporaryUploadDomain = 'TEAMS';

type CreateTemporaryImageUploadParams = {
  byteSize: number;
  dataUrl: string;
  domain: TemporaryUploadDomain;
  metadata?: Record<string, unknown>;
  mimeType: string;
  purpose: TemporaryUploadPurpose;
};

type TemporaryImageUploadResult = {
  publicUrl: string;
  uploadToken: string;
};

export async function createTemporaryImageUpload({
  byteSize,
  dataUrl,
  domain,
  metadata,
  mimeType,
  purpose,
}: CreateTemporaryImageUploadParams): Promise<TemporaryImageUploadResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  const uploadToken = generateUploadToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

  const { error } = await supabase.from('media_assets').insert({
    owner_user_id: user.id,
    domain,
    purpose,
    public_url: dataUrl,
    mime_type: mimeType,
    byte_size: byteSize,
    status: 'UPLOADED',
    is_temporary: true,
    upload_token: uploadToken,
    expires_at: expiresAt,
    metadata: metadata ?? {},
  });

  if (error) {
    throw error;
  }

  return {
    publicUrl: dataUrl,
    uploadToken,
  };
}

function generateUploadToken() {
  const randomChunk = Math.random().toString(36).slice(2, 10);
  return `temp_${Date.now()}_${randomChunk}`;
}
