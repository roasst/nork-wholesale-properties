import { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { optimizeImage, validateImageFile } from '../utils/imageOptimizer';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export const ImageUploader = ({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
}: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimizationStatus, setOptimizationStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setWarning(null);
    setOptimizationStatus('');

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);
      setOptimizationStatus('Optimizing image...');

      const optimized = await optimizeImage(file);

      const sizeSaved = ((optimized.originalSize - optimized.optimizedSize) / optimized.originalSize * 100).toFixed(0);
      setOptimizationStatus(
        `Optimized: ${(optimized.originalSize / 1024).toFixed(0)}KB → ${(optimized.optimizedSize / 1024).toFixed(0)}KB (${sizeSaved}% smaller)`
      );

      if (optimized.warning) {
        setWarning(optimized.warning);
      }

      setUploadProgress(40);
      setPreviewUrl(optimized.url);

      const contentType = optimized.fileName.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

      const { data, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(optimized.fileName, optimized.blob, {
          contentType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

      setUploadProgress(100);
      onImageUploaded(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreviewUrl(null);
      setOptimizationStatus('');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    setWarning(null);
    setOptimizationStatus('');
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#7CB342] bg-green-50'
              : 'border-gray-300 hover:border-[#7CB342] hover:bg-gray-50'
          }`}
        >
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 font-medium mb-2">
            Drop an image here or click to select
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG, WebP, or GIF (max 10MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Loader className="animate-spin" size={16} />
            <span>{optimizationStatus || `Uploading... ${uploadProgress}%`}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#7CB342] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {!isUploading && optimizationStatus && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          {optimizationStatus}
        </div>
      )}

      {warning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          {warning}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
};
