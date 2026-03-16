import { supabase } from '@/lib/supabase';

export async function uploadImage(
  file: File,
  bucket: 'avatars' | 'barbeiros' | 'servicos',
  userId?: string
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  try {
    if (!file) {
      return { url: null, error: 'Nenhum arquivo selecionado' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'O arquivo deve ser uma imagem' };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'A imagem não pode exceder 5MB' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${random}.${ext}`;
    const path = userId ? `${userId}/${filename}` : filename;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return { url: data.publicUrl, error: null };
  } catch (error: any) {
    return { url: null, error: error.message || 'Erro ao fazer upload' };
  }
}
