// src/components/ai/FileUpload.tsx
import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image, FileText, FileCode } from 'lucide-react';
import { Button } from '../ui/button';

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string; // For images
}

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  isDarkTheme: boolean;
  disabled?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('text/') || type.includes('document')) return FileText;
  if (type.includes('code/') || type.includes('javascript') || type.includes('typescript')) return FileCode;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizePerFile = 10, // 10MB default
  acceptedTypes = ['image/*', 'text/*', 'application/pdf', 'application/json'],
  isDarkTheme,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File ${file.name} is too large. Maximum size is ${maxSizePerFile}MB.`;
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return `File type ${file.type} is not supported.`;
    }

    return null;
  };

  const processFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileAttachment[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        return;
      }

      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const fileAttachment: FileAttachment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileAttachment.preview = e.target?.result as string;
          onFilesChange([...files, ...validFiles, fileAttachment]);
        };
        reader.readAsDataURL(file);
      } else {
        validFiles.push(fileAttachment);
      }
    });

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }

    if (errors.length > 0) {
      // You might want to show these errors in a toast or alert
      console.warn('File upload errors:', errors);
    }
  }, [files, maxFiles, maxSizePerFile, acceptedTypes, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  }, [files, onFilesChange]);

  return (
    <div className="space-y-3">
      {/* File Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragOver 
            ? (isDarkTheme ? 'border-blue-400 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
            : (isDarkTheme ? 'border-zinc-600 hover:border-zinc-500' : 'border-gray-300 hover:border-gray-400')
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className={`w-8 h-8 mx-auto mb-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            {isDragOver 
              ? 'Drop files here...' 
              : 'Drag & drop files here or click to browse'
            }
          </p>
          <p className={`text-xs mt-1 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
            Max {maxFiles} files, {maxSizePerFile}MB each
          </p>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            Attached Files ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {files.map((file) => {
              const IconComponent = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg border
                    ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}
                  `}
                >
                  <IconComponent className={`w-4 h-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                  
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      {file.name}
                    </p>
                    <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={disabled}
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
