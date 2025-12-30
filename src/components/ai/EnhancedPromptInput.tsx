// src/components/ai/EnhancedPromptInput.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FileUpload, FileAttachment } from './FileUpload';
import { PromptTemplate } from '../../types';

interface EnhancedPromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent, files?: FileAttachment[]) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  selectedTemplate?: string;
  templateVariables?: Record<string, string>;
  promptTemplates?: PromptTemplate[];
  handleVariableChange?: (variableName: string, value: string) => void;
  clearTemplate?: () => void;
  isDarkTheme: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  className?: string;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const EnhancedPromptInput: React.FC<EnhancedPromptInputProps> = ({
  prompt,
  setPrompt,
  isLoading,
  handleSubmit,
  selectedModel,
  setSelectedModel,
  availableModels,
  selectedTemplate,
  templateVariables,
  promptTemplates,
  handleVariableChange,
  clearTemplate,
  isDarkTheme,
  disabled = false,
  placeholder = "Type your message here...",
  maxFiles = 5,
  maxFileSize = 10,
  acceptedFileTypes = ['image/*', 'text/*', 'application/pdf', 'application/json'],
  className = "",
  isCollapsible = false,
  defaultCollapsed = false
}) => {
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitWithFiles = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e, attachedFiles);
    // Clear files after successful submission
    setAttachedFiles([]);
    setShowFileUpload(false);
  }, [handleSubmit, attachedFiles]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isLoading && prompt.trim() && selectedModel) {
        handleSubmitWithFiles(e as any);
      }
    }
  }, [handleSubmitWithFiles, isLoading, prompt, selectedModel]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    adjustTextareaHeight();
  }, [setPrompt, adjustTextareaHeight]);

  const toggleFileUpload = useCallback(() => {
    setShowFileUpload(prev => !prev);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const canSubmit = !isLoading && prompt.trim() && selectedModel && !disabled;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className={`
            border rounded-lg transition-all duration-300 ease-in-out
            ${isDarkTheme ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}
            ${isExpanded ? 'h-auto' : 'h-auto'}
            shadow-lg
          `}>
            <div className="p-4">
          <form onSubmit={handleSubmitWithFiles} className="space-y-4">
            {/* File Upload Section */}
            {showFileUpload && (
              <div className="mb-4">
                <FileUpload
                  files={attachedFiles}
                  onFilesChange={setAttachedFiles}
                  maxFiles={maxFiles}
                  maxSizePerFile={maxFileSize}
                  acceptedTypes={acceptedFileTypes}
                  isDarkTheme={isDarkTheme}
                  disabled={disabled}
                />
              </div>
            )}

            {/* Template Variables Section */}
            {selectedTemplate && templateVariables && promptTemplates && handleVariableChange && (
              <div className={`
                p-3 rounded-lg border space-y-3
                ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}
              `}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Template Variables
                  </h4>
                  {clearTemplate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearTemplate}
                      className="text-xs"
                    >
                      Clear Template
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(templateVariables).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="text-xs">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <input
                        id={key}
                        type="text"
                        value={value}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        className={`
                          w-full px-2 py-1 text-sm rounded border
                          ${isDarkTheme 
                            ? 'bg-zinc-700 border-zinc-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }
                        `}
                        placeholder={`Enter ${key}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Input Row */}
            <div className="flex gap-3 items-end">
              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handlePromptChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`
                    w-full resize-none rounded-lg p-3 pr-12 border focus:outline-none focus:ring-2 focus:border-transparent
                    ${isDarkTheme 
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-gray-400 focus:ring-white' 
                      : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-gray-900'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '200px' }}
                />
                
                {/* File Attachment Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleFileUpload}
                  disabled={disabled}
                  className={`
                    absolute right-2 top-2 h-8 w-8 p-0
                    ${showFileUpload 
                      ? (isDarkTheme ? 'text-blue-400' : 'text-blue-600')
                      : (isDarkTheme ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
                    }
                  `}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>

              {/* Model Selection */}
              <div className="flex-shrink-0">
                <Label htmlFor="model-select" className="text-xs mb-1 block">
                  Model
                </Label>
                <Select onValueChange={setSelectedModel} value={selectedModel} disabled={disabled}>
                  <SelectTrigger 
                    id="model-select"
                    className={`w-[180px] ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}
                  >
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!canSubmit}
                className={`
                  h-11 px-6 flex items-center gap-2 transition-colors
                  ${isDarkTheme 
                    ? 'bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </Button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between text-xs">
              <div className={`flex items-center gap-4 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                <span>Press Ctrl+Enter to send</span>
                {attachedFiles.length > 0 && (
                  <span>{attachedFiles.length} file(s) attached</span>
                )}
              </div>
              
              <div className={`flex items-center gap-2 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                <span>{prompt.length} characters</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpanded}
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
