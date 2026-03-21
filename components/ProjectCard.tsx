'use client'
import { useState, useRef, useCallback } from 'react';
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
  Desarrollo: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Diseño': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Marketing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Negocios: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Educacion: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  General: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

function countVars(context: string): string[] {
  const matches = context.match(/\{\{([^}]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
}

export default function ProjectCard({ project, variables = [], onEdit, onDelete, onCopy }: ProjectCardProps) {
  const [copied, setCopied] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null as HTMLDivElement | null);

  const vars = countVars(project.context || '');
  const tagStyle = TAG_STYLES[project.tag || ''] || TAG_STYLES['General'];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  const getFilledContext = () => {
    let ctx = project.context || '';
    variables.forEach(v => {
      ctx = ctx.replace(new RegExp('\\{\\{' + v.name + '\\}\\}', 'g'), v.value);
    });
    return ctx;
  };

  const handleCopy = () => {
    const text = getFilledContext();
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChatGPT = () => {
    const text = getFilledContext();
    const url = 'https://chatgpt.com/?prompt=' + encodeURIComponent(text);
    window.open(url, '_blank');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-500 group"
      style={{
        background: hovered
          ? 'radial-gradient(600px circle at ' + mousePos.x + '% ' + mousePos.y + '%, rgba(139,92,246,0.06) 0%, rgba(18,17,23,0.98) 60%)'
          : 'rgba(18,17,23,0.98)',
        borderColor: hovered ? 'rgba(139,92,246,0.3)' : 'rgba(63,63,70,0.5)',
        boxShadow: hovered
          ? '0 0 0 1px rgba(139,92,246,0.15), 0 8px 32px rgba(139,92,246,0.08), inset 0 1px 0 rgba(139,92,246,0.08)'
          : '0 1px 0 rgba(255,255,255,0.02)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Shimmer sweep on hover */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 rounded-2xl overflow-hidden"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.04) 50%, transparent 60%)',
            transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 0.8s ease',
          }}
        />
      </div>

      {/* AI status dot — top right corner */}
      <div className="absolute top-3 right-3 z-10">
        <div className="relative flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-zinc-600 font-medium tracking-wide uppercase">IA</span>
          <div className="relative w-1.5 h-1.5">
            <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-60" style={{ animationDuration: '1.5s' }} />
            <div className="relative w-1.5 h-1.5 rounded-full bg-violet-400" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 pr-8">
          <Link
            href={'/dashboard/proyecto/' + project.id}
            className="text-sm font-semibold text-zinc-100 hover:text-violet-400 transition-colors duration-200 line-clamp-1 block"
          >
            {project.name}
          </Link>
          {project.tag && (
            <span className={'mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ' + tagStyle}>
              {project.tag}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-0.5">
          <button
            onClick={() => onEdit(project)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all duration-150"
            title="Editar"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
            title="Eliminar"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Context preview */}
      <div className="px-5 pb-4 flex-1">
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 font-mono">
          {project.context || 'Sin contexto'}
        </p>
      </div>

      {/* Variables badge */}
      {vars.length > 0 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowVars(!showVars)}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-violet-400 bg-violet-500/8 hover:bg-violet-500/12 border border-violet-500/15 hover:border-violet-500/30 px-2.5 py-1 rounded-full uppercase tracking-wide transition-all duration-200"
          >
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            {vars.length} variable{vars.length > 1 ? 's' : ''}
            <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={'transition-transform duration-200 ' + (showVars ? 'rotate-180' : '')}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showVars && (
            <div className="mt-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-wide font-semibold">Variables</p>
              <div className="flex flex-wrap gap-1">
                {vars.map(v => (
                  <span key={v} className="text-[10px] bg-violet-500/8 text-violet-400 border border-violet-500/15 px-1.5 py-0.5 rounded-md font-mono">
                    {'{{'}{v}{'}}'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="px-4 pb-4 pt-3 border-t border-zinc-800/60">
        <div className="flex gap-2">
          <button
            onClick={handleChatGPT}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl font-medium transition-all duration-200"
            title="Abrir en ChatGPT"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494z"/>
            </svg>
            ChatGPT
          </button>
          <button
            onClick={handleCopy}
            className={'flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ' + (copied ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20')}
          >
            {copied ? (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
                Copiar contexto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
