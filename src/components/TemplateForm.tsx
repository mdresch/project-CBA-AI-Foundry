// TemplateForm.tsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface TemplateFormProps {
    selectedTemplate: string;
    promptTemplates: any[]; // Replace 'any' with the correct type
    templateVariables: { [key: string]: string };
    handleVariableChange: (variableName: string, value: string) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
    selectedTemplate,
    promptTemplates,
    templateVariables,
    handleVariableChange,
}) => {
    const {isDarkTheme} = useTheme();

    const template = promptTemplates.find(t => t.id === selectedTemplate);

    return (
        <>
            {selectedTemplate &&
                template?.variables?.map(variable => (
                    <div key={variable.name} className="mb-2">
                        <label
                            htmlFor={variable.name}
                            className={`block text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                            {variable.label}:
                        </label>
                        {variable.type === 'text' && (
                            <input
                                type="text"
                                id={variable.name}
                                value={templateVariables[variable.name] || ''}
                                onChange={e => handleVariableChange(variable.name, e.target.value)}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                    isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                }`}
                            />
                        )}
                        {variable.type === 'number' && (
                            <input
                                type="number"
                                id={variable.name}
                                value={templateVariables[variable.name] || ''}
                                onChange={e => handleVariableChange(variable.name, e.target.value)}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                    isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                }`}
                            />
                        )}
                        {variable.type === 'select' && (
                            <select
                                id={variable.name}
                                value={templateVariables[variable.name] || ''}
                                onChange={e => handleVariableChange(variable.name, e.target.value)}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                    isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                }`}
                            >
                                <option value="">Select an option</option>
                                {variable.options?.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        )}
                        {variable.type === 'textarea' && (
                            <textarea
                                id={variable.name}
                                value={templateVariables[variable.name] || ''}
                                onChange={e => handleVariableChange(variable.name, e.target.value)}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                    isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                }`}
                                rows={4}
                            />
                        )}
                    </div>
                ))}
        </>
    );
};

export default TemplateForm;