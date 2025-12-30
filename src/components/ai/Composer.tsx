
// src/components/ai/Composer.tsx
import React from 'react';
import { Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { TemplateForm } from './TemplateForm';
import { PromptTemplate } from '../../types';

interface ComposerProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    isLoading: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    availableModels: string[];
    selectedTemplate: string;
    templateVariables: Record<string, string>;
    promptTemplates: PromptTemplate[];
    handleVariableChange: (variableName: string, value: string) => void;
    clearTemplate: () => void;
    isDarkTheme: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
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
    isDarkTheme
}) => {
    return (
        <form onSubmit={handleSubmit} className={`border-b p-4 ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>
            <TemplateForm
                selectedTemplate={selectedTemplate}
                templateVariables={templateVariables}
                promptTemplates={promptTemplates}
                handleVariableChange={handleVariableChange}
            />

            <div className="flex gap-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type your message here..."
                    className={`flex-1 resize-none rounded-lg p-3 border focus:outline-none focus:ring-2 focus:border-transparent ${isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-white placeholder-gray-500 focus:ring-white' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-gray-900'}`}
                    rows={3}
                />

                <div className="flex flex-col">
                    <Label htmlFor="model">Model</Label>
                    <Select onValueChange={setSelectedModel} value={selectedModel}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a model" /></SelectTrigger>
                        <SelectContent>{availableModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>

                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim() || !selectedModel}
                        className={`self-end rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors ${isDarkTheme ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                    </button>
                    {selectedTemplate && <button type="button" onClick={clearTemplate} className={`self-end mt-2 rounded-lg px-4 py-2 transition-colors ${isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Clear Template</button>}
                </div>
            </div>
        </form>
    );
};
