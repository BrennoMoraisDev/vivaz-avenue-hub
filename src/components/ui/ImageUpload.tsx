import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/uploadImage';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  bucket: 'avatars' | 'barbeiros' | 'servicos';
  label?: string;
  userId?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  label = 'Foto',
  userId,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const { url, error: uploadError } = await uploadImage(file, bucket, userId);

    if (uploadError) {
      setError(uploadError);
    } else if (url) {
      onChange(url);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {value ? (
        <div className="relative w-full">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border border-border"
          />
          <button
            onClick={() => onChange('')}
            disabled={disabled || uploading}
            className="absolute top-2 right-2 p-1 bg-destructive/90 hover:bg-destructive rounded-lg transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg bg-surface/50 hover:bg-surface transition-colors">
          <div className="text-center">
            <ImageIcon size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Clique para escolher uma imagem</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-full gap-2"
      >
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload size={16} />
            {value ? 'Alterar Imagem' : 'Escolher Imagem'}
          </>
        )}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
