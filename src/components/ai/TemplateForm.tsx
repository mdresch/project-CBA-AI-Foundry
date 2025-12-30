
// src/components/ai/TemplateForm.tsx
import React from 'react';
import { useTheme } from '../../context/useTheme';
import { PromptTemplate } from '../../types';

interface TemplateFormProps {
    selectedTemplate: string;
    templateVariables: { [key: string]: string };
    promptTemplates: PromptTemplate[];
    handleVariableChange: (variableName: string, value: string) => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
    selectedTemplate,
    templateVariables,
    promptTemplates,
    handleVariableChange,
}) => {
    const { isDarkTheme } = useTheme();
    const template = promptTemplates.find((t) => t.id === selectedTemplate);

    if (!selectedTemplate || !template?.variables) {
        return null;
    }

    return (
        <div className="space-y-2 mb-4">
            {template.variables.map((variable) => (
                <div key={variable.name}>
                    <label htmlFor={variable.name} className={`block text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                        {variable.label}:
                    </label>
                    {variable.type === 'text' && (
                        <input
                            type="text"
                            id={variable.name}
                            value={templateVariables[variable.name] || ''}
                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900 border-gray-300'}`}
                        />
                    )}
                    {variable.type === 'textarea' && (
                        <textarea
                            id={variable.name}
                            value={templateVariables[variable.name] || ''}
                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900 border-gray-300'}`}
                            rows={3}
                        />
                    )}
                    {/* Add other variable types like select, number etc. as needed */}
                </div>
            ))}
        </div>
    );
};
