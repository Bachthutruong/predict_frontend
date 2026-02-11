'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import apiService from '../../services/api';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  values = [],
  onChange,
  disabled = false,
  className,
  placeholder = "Upload images",
  maxImages = 20
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      const signatureResponse = await apiService.post('/cloudinary/signature', { 
        timestamp,
        folder: 'predict-win'
      });

      const signatureData = signatureResponse.data;
      const { signature, cloudName, apiKey, folder } = signatureData.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      formData.append('use_filename', 'true');
      formData.append('unique_filename', 'false');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorData}`);
      }

      const data = await uploadResponse.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a valid image. Only JPG, PNG, GIF, WebP are allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Max 5MB per file.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Check max images limit
    const remainingSlots = maxImages - values.length;
    if (validFiles.length > remainingSlots) {
      alert(`Can only upload ${remainingSlots} more image(s). Max ${maxImages} images total.`);
      validFiles.splice(remainingSlots);
    }

    setIsUploading(true);
    setTotalFiles(validFiles.length);
    setUploadProgress(0);

    const newUrls: string[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      try {
        const url = await uploadToCloudinary(validFiles[i]);
        newUrls.push(url);
        setUploadProgress(i + 1);
      } catch (error: any) {
        console.error(`Failed to upload file ${validFiles[i].name}:`, error);
      }
    }

    if (newUrls.length > 0) {
      onChange([...values, ...newUrls]);
    }

    setIsUploading(false);
    setUploadProgress(0);
    setTotalFiles(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Image Gallery Preview */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                disabled={disabled || isUploading}
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm">
                  Thumbnail
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={cn(
          "h-28 w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "border-blue-400 bg-blue-50/30 cursor-wait",
          values.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
      >
        {isUploading ? (
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-1.5 mx-auto" />
            <p className="text-sm text-blue-600 font-medium">
              Uploading {uploadProgress}/{totalFiles}...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-1.5">
              <ImageIcon className="h-6 w-6 text-gray-400 mx-auto" />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Upload className="h-3.5 w-3.5" />
              <span>{placeholder}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Select multiple files • JPG, PNG, GIF up to 5MB each
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
