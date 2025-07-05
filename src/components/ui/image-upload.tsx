'use client';

import { useState, useRef } from 'react';
import { Button } from './button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import apiService from '../../services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "Upload an image"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    try {
      // Step 1: Get signature from backend
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      console.log('Getting signature...');
      const signatureResponse = await apiService.post('/cloudinary/signature', { 
        timestamp,
        folder: 'predict-win'
      });

      const signatureData = signatureResponse.data;
      const { signature, cloudName, apiKey, folder } = signatureData.data;
      
      console.log('Signature received, uploading to Cloudinary...');

      // Step 2: Upload with signature
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

      console.log('Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        console.error('Upload failed:', errorData);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorData}`);
      }

      const data = await uploadResponse.json();
      console.log('Upload successful:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only image files are allowed: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please select a file smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Upload failed';
      alert(`Upload failed: ${errorMessage}\n\nPlease check:\n1. Internet connection\n2. Cloudinary credentials are configured\n3. You are logged in`);
    } finally {
      setIsUploading(false);
      // Reset input value so we can upload same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onRemove = () => {
    onChange('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {value ? (
        <div className="relative">
          <div className="relative h-40 w-full rounded-lg overflow-hidden border border-dashed border-gray-300">
            <img
              src={value}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            onClick={onRemove}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "h-40 w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "border-primary"
          )}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2 mx-auto"></div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>{placeholder}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 