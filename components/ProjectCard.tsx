'use client';

import { useState } from 'react';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onHistory: (project: Project) => void;
  onCopy?: () => void;
}

function fillVariables(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_match: string, key: string) => vars[key] || '{{' + key + '}}');
}

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m: string) => m.replace(/\{\{|\}\}/g, '')))];
}

export default function ProjectCard({ project, onEdit, onDelete, onHistory, onCopy }: ProjectCardProps) {
  const [copied, setCopied] = useState(false);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [showVars, setShowVars] = useState(false);

  const variables = extractVariables(project.context || '');
  const hasVars = variables.length > 0;

  const handleCopy = () => {
    const filled = hasVars ? fillVariables(project.context || '', varValues) : (project.context || '');
    navigator.clipboard.writeText(filled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryColors: Record<string, string> = {
    'coding': 'bg-blue-100 text-blue-800',
    'writing': 'bg-green-100 text-green-800',
    'analysis': 'bg-purple-100 text-purple-800',
    'marketing': 'bg-yellow-100 text-yellow-800',
    'other': 'bg-gray-100 text-gray-800',
  };

  const colorClass = categoryColors[project.category || 'other'] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
          {project.category && (
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
              {project.category}
            </span>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onHistory(project)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Ver historial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {project.context && (
        <p className="text-sm text-gray-600 line-clamp-3">{project.context}</p>
      )}

      {hasVars && (
        <div>
          <button
            onClick={() => setShowVars(!showVars)}
            className="text-xs text-indigo-600 hover:underline"
          >
            {showVars ? 'Ocultar variables' : `Rellenar variables (${variables.length})`}
          </button>
          {showVars && (
            <div className="mt-2 flex flex-col gap-2">
              {variables.map((v: string) => (
                <div key={v} className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-24 shrink-0">{v}</label>
                  <input
                    type="text"
                    value={varValues[v] || ''}
                    onChange={(e) => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                    placeholder={`valor para ${v}`}
                    className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleCopy}
        className={`mt-auto w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          copied
            ? 'bg-green-100 text-green-700'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {copied ? 'â Copiado!' : 'ð Copiar contexto'}
      </button>
    </div>
  );
}
