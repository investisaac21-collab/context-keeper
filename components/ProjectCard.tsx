'use client'
// v2;
import { useState } from 'react';
import Link from 'next/link';
import { Project, UserVariable } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  variables?: UserVariable[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

const TAG_STYLES: Record<string, string> = {
  Desarrollo: 'bg-violet-50 text-violet-700 border border-violet-200',
  Dise\u00c3\u0083\u00c2\u00b1o: 'bg-purple-50 text-purple-700 border border-purple-200',
  Marketing: 'bg-amber-50 text-amber-700 border border-amber-200',
  Negocios: 'bg-orange-50 text-orange-700 border border-orange-200',
  Educacion: 'bg-teal-50 text-teal-700 border border-teal-200',
  Personal: 'bg-pink-50 text-pink-700 border border-pink-200',
  Otro: 'bg-gray-100 text-gray-600 border border-gray-200',
};

function countVars(context: string): string[] {
  const matches = context.match(/{{([^}]+)}}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))];
}

export default function ProjectCard({ project, variables = [], onEdit, onDelete, onCopy }: ProjectCardProps) {
  const [showVars, setShowVars] = useState(false);
  const [copied, setCopied] = useState(false);

  const vars = countVars(project.context || '');
  const tagStyle = TAG_STYLES[project.tag || ''] || TAG_STYLES['Otro'];

  const getFilledContext = () => {
    let ctx = project.context || '';
    const varMap: Record<string, string> = {};
    variables.forEach(v => { varMap[v.name] = v.default_value || ''; });
    ctx = ctx.replace(/{{([^}]+)}}/g, (_, name) => varMap[name.trim()] || `{{${name.trim()}}}`);
    return ctx;
  };

  const handleCopy = () => {
    const text = vars.length > 0 ? getFilledContext() : (project.context || '');
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChatGPT = () => {
    const text = vars.length > 0 ? getFilledContext() : (project.context || '');
    window.open('https://chatgpt.com/?q=' + encodeURIComponent(text), '_blank');
  };

  const excerpt = (project.context || '').replace(/{{[^}]+}}/g, '\u2022').slice(0, 110);

  return (
    <div className="bg-white rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={`/dashboard/proyecto/${project.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors line-clamp-1 block"
          >
            {project.name}
          </Link>
          {project.tag && (
            <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${tagStyle}`}>
              {project.tag}
            </span>
          )}
        </div>
        {/* Secondary actions top-right */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/dashboard/proyecto/${project.id}`}
            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title="Vista previa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Excerpt */}
      <div className="px-4 pb-3 flex-1">
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 font-normal">
          {excerpt}{(project.context || '').length > 110 ? '\u00c3\u00a2\u00c3\u0083\u00c2\u0082\u00c3\u0082\u00c2\u0080\u00c3\u0083\u00c2\u0082\u00c3\u0082\u00c2\u00a6' : ''}
        </p>
      </div>

      {/* Variables badge */}
      {vars.length > 0 && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowVars(!showVars)}
            className="inline-flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 px-2.5 py-1 rounded-full font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            {vars.length} variable{vars.length > 1 ? 's' : ''}
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform ${showVars ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showVars && (
            <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1.5 font-medium">Variables detectadas:</p>
              <div className="flex flex-wrap gap-1">
                {vars.map(v => (
                  <span key={v} className="text-xs bg-white text-violet-600 border border-violet-100 px-2 py-0.5 rounded font-mono">
                    {'{{'}{v}{'}}'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary action */}
      <div className="px-4 pb-4 pt-1 border-t border-gray-100 mt-auto">
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleChatGPT}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-medium transition-colors"
            title="Abrir en ChatGPT"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.564 19.9a4.5 4.5 0 0 1-5.964-1.595zm-1.243-9.93a4.475 4.475 0 0 1 2.343-1.97V12.3a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.503 4.503 0 0 1 2.357 8.373zm16.61 3.806l-5.815-3.355 2.015-1.168a.075.075 0 0 1 .072 0l4.83 2.781a4.503 4.503 0 0 1-.676 8.123v-5.91a.77.77 0 0 0-.426-.471zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.62V7.288a.08.08 0 0 1 .032-.066l4.83-2.786a4.492 4.492 0 0 1 6.678 4.652zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.492 4.492 0 0 1 7.37-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
            </svg>
            ChatGPT
          </button>
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-violet-600 hover:bg-violet-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar prompt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}