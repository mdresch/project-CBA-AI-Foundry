// src/components/ai/PromptInputDemo.tsx
import React, { useState } from 'react';
import { EnhancedPromptInput } from './EnhancedPromptInput';
import { useTheme } from '../../context/useTheme';
import { PromptTemplate } from '../../types';
import promptTemplatesData from '../../data/promptTemplates.json';

const promptTemplates: PromptTemplate[] = promptTemplatesData as PromptTemplate[];

export const PromptInputDemo: React.FC = () => {
    const { isDarkTheme } = useTheme();
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const availableModels = [
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gpt-4o',
        'gpt-4o-mini'
    ];

    const handleSubmit = (e: React.FormEvent, fileAttachments?: import('./FileUpload').FileAttachment[]) => {
        e.preventDefault();
        console.log('Submitted:', {
            prompt,
            selectedModel,
            selectedTemplate,
            templateVariables,
            fileAttachments: fileAttachments?.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            }))
        });
        
        // Simulate loading
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setPrompt('');
            setTemplateVariables({});
        }, 2000);
    };

    const handleVariableChange = (variableName: string, value: string) => {
        setTemplateVariables(prev => ({ ...prev, [variableName]: value }));
    };

    const clearTemplate = () => {
        setSelectedTemplate('');
        setTemplateVariables({});
        setPrompt('');
    };

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">Enhanced Prompt Input Demo</h1>
                
                <div className="space-y-6">
                    <div className={`
                        p-6 rounded-lg border
                        ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}
                    `}>
                        <h2 className="text-xl font-semibold mb-4">Features</h2>
                        <ul className="space-y-2 text-sm">
                            <li>✅ Textarea with auto-resize</li>
                            <li>✅ File upload with drag-and-drop</li>
                            <li>✅ Model selection dropdown</li>
                            <li>✅ Template variable support</li>
                            <li>✅ Keyboard shortcuts (Ctrl+Enter)</li>
                            <li>✅ File preview for images</li>
                            <li>✅ File size validation</li>
                            <li>✅ Fixed positioning at bottom</li>
                        </ul>
                    </div>

                    <div className={`
                        p-6 rounded-lg border
                        ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}
                    `}>
                        <h2 className="text-xl font-semibold mb-4">Current State</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Prompt:</strong> {prompt || 'Empty'}</p>
                            <p><strong>Model:</strong> {selectedModel}</p>
                            <p><strong>Template:</strong> {selectedTemplate || 'None'}</p>
                            <p><strong>Variables:</strong> {Object.keys(templateVariables).length > 0 ? JSON.stringify(templateVariables) : 'None'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <EnhancedPromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                availableModels={availableModels}
                selectedTemplate={selectedTemplate}
                templateVariables={templateVariables}
                promptTemplates={promptTemplates}
                handleVariableChange={handleVariableChange}
                clearTemplate={clearTemplate}
                isDarkTheme={isDarkTheme}
                placeholder="Try typing a message and attaching files..."
                maxFiles={5}
                maxFileSize={10}
                acceptedFileTypes={['image/*', 'text/*', 'application/pdf', 'application/json']}
            />
        </div>
    );
};
