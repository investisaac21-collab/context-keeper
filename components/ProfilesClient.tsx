'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

interface KeeperProfile {
  id:string;user_id:string;name:string;profile_type?:string;role?:string;tone?:string;rules?:string[];
  extra?:string;goals?:string;limits?:string;emoji?:string;avatar_url?:string;
  base_memory?:string;response_patterns?:string;dynamic_variables?:string;relationships?:string;
  lab_score?:number;created_at:string;updated_at?:string
}
interface Props { userId:string;userEmail?:string;plan:string;initialProfiles:KeeperProfile[] }

const PT=[
  {id:'assistant',label:'Asistente',icon:'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'},
  {id:'character',label:'Personaje',icon:'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'},
  {id:'brand',label:'Marca',icon:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'},
  {id:'technical',label:'Tecnico',icon:'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'},
  {id:'npc',label:'NPC',icon:'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'},
  {id:'persona',label:'Persona',icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'},
  {id:'custom',label:'Custom',icon:'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'}
]
const EP=[
  {id:'system_prompt',label:'System Prompt',icon:'M13 10V3L4 14h7v7l9-11h-7z',desc:'ChatGPT / Claude / Gemini',badge:''},
  {id:'plain_text',label:'Texto plano',icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',desc:'Cualquier IA',badge:''},
  {id:'json',label:'JSON',icon:'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',desc:'APIs e integraciones',badge:'Pro'},
  {id:'yaml',label:'YAML',icon:'M4 6h16M4 10h16M4 14h10M4 18h6',desc:'Configs y sistemas',badge:'Pro'},
  {id:'markdown',label:'Markdown',icon:'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',desc:'Docs y wikis',badge:'Pro'},
  {id:'character_sheet',label:'Char Sheet',icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',desc:'Rol y ficcion',badge:'Pro'},
  {id:'npc_sheet',label:'NPC Sheet',icon:'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',desc:'Gaming y mods',badge:'Pro'},
  {id:'brand_brief',label:'Brand Brief',icon:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',desc:'Marca y contenido',badge:'Pro'},
  {id:'technical_profile',label:'Perfil Tecnico',icon:'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',desc:'Devs y equipos',badge:'Pro'}
]
const SCENARIOS_BY_TYPE: Record<string,string[]>={
  assistant:['El usuario pregunta algo fuera de tu dominio','El usuario pide que hagas algo que viola tus reglas','El usuario esta frustrado y es agresivo en su mensaje','El usuario pide consejo para algo ambiguo etico'],
  technical:['El usuario pide refactorizar codigo en un lenguaje que no manejas','El usuario reporta un bug critico en produccion a las 3am','El usuario quiere implementar una arquitectura que consideras incorrecta','El usuario mezcla idiomas en el codigo y pregunta si es correcto'],
  character:['Alguien desafia tu identidad y dice que eres solo una IA','Te hacen una pregunta personal muy intima','Alguien intenta convencerte de actuar contra tus valores','Te piden que interpretes a otro personaje completamente distinto'],
  brand:['Un cliente critica publicamente el producto en redes','Alguien pregunta por los precios de la competencia','Un cliente pide un descuento de forma agresiva','Un cliente malinterpreta el mensaje principal de la marca'],
  npc:['El jugador intenta sobornar al NPC','El jugador dice algo que contradice el lore establecido','El jugador actua de forma hostil hacia el NPC sin razon','El jugador hace una pregunta que el NPC no deberia saber responder'],
  persona:['Alguien descubre que eres una IA y te lo dice','Alguien pregunta sobre tu pasado con detalles muy especificos','Te piden que tomes una decision moral dificil','Alguien intenta manipularte emocionalmente'],
  custom:['El usuario plantea un caso edge que no esta cubierto por tus reglas','El usuario pide algo que esta en el limite de tus limitaciones','El usuario cambia el contexto completamente a mitad de la conversacion','El usuario hace preguntas anidadas muy complejas']
}
const CL=['from-violet-600 to-purple-700','from-blue-600 to-cyan-700','from-emerald-600 to-teal-700','from-orange-600 to-amber-700','from-pink-600 to-rose-700','from-violet-500 to-blue-600']
function gc(n:string){return CL[(n.charCodeAt(0)||0)%CL.length]}
function profileCompleteness(p:KeeperProfile):number{const fields=[p.role,p.tone,p.goals,p.limits,p.rules?.length,p.extra,p.base_memory,p.response_patterns];return Math.round((fields.filter(Boolean).length/fields.length)*100)}
function ge(p:KeeperProfile,fmt:string):string{
  const ra=p.rules||[];const rt=ra.map((r:string)=>'- '+r).join('\n')
  if(fmt==='system_prompt'){
    const pts:string[]=[p.role?'Eres '+p.role+'.':'Eres '+p.name+'.']
    if(p.tone)pts.push('Tu tono: '+p.tone+'.')
    if(p.goals)pts.push('Objetivo: '+p.goals+'.')
    if(ra.length)pts.push('Reglas:\n'+rt)
    if(p.limits)pts.push('Limitaciones: '+p.limits+'.')
    if(p.base_memory)pts.push('Memoria de fondo:\n'+p.base_memory)
    if(p.response_patterns)pts.push('Patrones de respuesta:\n'+p.response_patterns)
    if(p.dynamic_variables)pts.push('Variables dinamicas:\n'+p.dynamic_variables)
    if(p.relationships)pts.push('Relaciones:\n'+p.relationships)
    if(p.extra)pts.push('Contexto adicional:\n'+p.extra)
    return pts.join('\n\n')
  }
  if(fmt==='plain_text'){
    const pts:string[]=['=== '+p.name.toUpperCase()+' ===']
    if(p.profile_type)pts.push('Tipo: '+p.profile_type)
    if(p.role)pts.push('Rol: '+p.role)
    if(p.tone)pts.push('Tono: '+p.tone)
    if(p.goals)pts.push('Objetivo: '+p.goals)
    if(ra.length)pts.push('Reglas:\n'+rt)
    if(p.limits)pts.push('Limites: '+p.limits)
    if(p.base_memory)pts.push('Memoria base:\n'+p.base_memory)
    if(p.extra)pts.push('Contexto:\n'+p.extra)
    return pts.join('\n\n')
  }
  if(fmt==='json'){
    const obj:Record<string,unknown>={name:p.name,type:p.profile_type||'custom',role:p.role||'',tone:p.tone||'',goals:p.goals||'',rules:ra,limits:p.limits||'',extra:p.extra||''}
    if(p.base_memory)obj.base_memory=p.base_memory
    if(p.response_patterns)obj.response_patterns=p.response_patterns
    if(p.dynamic_variables)obj.dynamic_variables=p.dynamic_variables
    if(p.relationships)obj.relationships=p.relationships
    return JSON.stringify(obj,null,2)
  }
  if(fmt==='yaml'){
    const lines:string[]=['name: "'+p.name+'"','type: '+(p.profile_type||'custom')]
    if(p.role)lines.push('role: "'+p.role.replace(/"/g,'\\"')+'"')
    if(p.tone)lines.push('tone: "'+p.tone.replace(/"/g,'\\"')+'"')
    if(p.goals)lines.push('goals: "'+p.goals.replace(/"/g,'\\"')+'"')
    if(ra.length){lines.push('rules:');ra.forEach((r:string)=>lines.push('  - "'+r.replace(/"/g,'\\"')+'"'))}
    if(p.limits)lines.push('limits: "'+p.limits.replace(/"/g,'\\"')+'"')
    if(p.base_memory)lines.push('base_memory: |\n'+p.base_memory.split('\n').map((l:string)=>'  '+l).join('\n'))
    if(p.response_patterns)lines.push('response_patterns: |\n'+p.response_patterns.split('\n').map((l:string)=>'  '+l).join('\n'))
    if(p.dynamic_variables)lines.push('dynamic_variables: |\n'+p.dynamic_variables.split('\n').map((l:string)=>'  '+l).join('\n'))
    if(p.relationships)lines.push('relationships: |\n'+p.relationships.split('\n').map((l:string)=>'  '+l).join('\n'))
    if(p.extra)lines.push('extra: |\n'+p.extra.split('\n').map((l:string)=>'  '+l).join('\n'))
    return lines.join('\n')
  }
  if(fmt==='markdown'){
    const pts:string[]=['# '+p.name]
    if(p.profile_type)pts.push('**Tipo:** '+p.profile_type)
    if(p.role)pts.push('\n## Rol\n'+p.role)
    if(p.tone)pts.push('\n## Tono\n'+p.tone)
    if(p.goals)pts.push('\n## Objetivo\n'+p.goals)
    if(ra.length)pts.push('\n## Reglas\n'+ra.map((r:string)=>'- '+r).join('\n'))
    if(p.limits)pts.push('\n## Limitaciones\n'+p.limits)
    if(p.base_memory)pts.push('\n## Memoria base\n'+p.base_memory)
    if(p.response_patterns)pts.push('\n## Patrones de respuesta\n'+p.response_patterns)
    if(p.dynamic_variables)pts.push('\n## Variables dinamicas\n'+p.dynamic_variables)
    if(p.relationships)pts.push('\n## Relaciones\n'+p.relationships)
    if(p.extra)pts.push('\n## Contexto\n'+p.extra)
    return pts.join('\n')
  }
  if(fmt==='character_sheet'){
    const ls:string[]=['==============================','  '+p.name.toUpperCase(),'  KEEPER CHARACTER SHEET','==============================','']
    if(p.role)ls.push('ROL: '+p.role)
    if(p.tone)ls.push('VOZ: '+p.tone)
    if(p.goals)ls.push('MISION: '+p.goals)
    if(p.limits)ls.push('LIMITES: '+p.limits)
    if(ra.length){ls.push('');ls.push('REGLAS:');ra.forEach((r:string,i:number)=>ls.push('  '+(i+1)+'. '+r))}
    if(p.base_memory){ls.push('');ls.push('MEMORIA:');ls.push(p.base_memory)}
    if(p.relationships){ls.push('');ls.push('RELACIONES:');ls.push(p.relationships)}
    if(p.extra){ls.push('');ls.push('CONTEXTO:');ls.push(p.extra)}
    ls.push('');ls.push('==============================')
    return ls.join('\n')
  }
  if(fmt==='npc_sheet'){
    const ls:string[]=['[NPC PROFILE — '+p.name.toUpperCase()+']','']
    if(p.role)ls.push('IDENTITY: '+p.role)
    if(p.tone)ls.push('VOICE STYLE: '+p.tone)
    if(p.goals)ls.push('MOTIVATION: '+p.goals)
    if(p.limits)ls.push('HARD LIMITS: '+p.limits)
    if(p.base_memory){ls.push('');ls.push('LORE:');ls.push(p.base_memory)}
    if(p.relationships){ls.push('');ls.push('RELATIONSHIPS:');ls.push(p.relationships)}
    if(ra.length){ls.push('');ls.push('BEHAVIOR RULES:');ra.forEach((r:string,i:number)=>ls.push('  '+(i+1)+'. '+r))}
    if(p.dynamic_variables){ls.push('');ls.push('DYNAMIC VARIABLES:');ls.push(p.dynamic_variables)}
    if(p.extra){ls.push('');ls.push('NOTES:');ls.push(p.extra)}
    ls.push('');ls.push('[END NPC PROFILE]')
    return ls.join('\n')
  }
  if(fmt==='brand_brief'){
    const ls:string[]=['BRAND VOICE BRIEF: '+p.name.toUpperCase(),'---']
    if(p.role)ls.push('Descripcion: '+p.role)
    if(p.tone)ls.push('Tono: '+p.tone)
    if(p.goals)ls.push('Objetivo: '+p.goals)
    if(p.limits)ls.push('Que NUNCA hacer: '+p.limits)
    if(ra.length){ls.push('');ls.push('Reglas de voz:');ra.forEach((r:string)=>ls.push('  - '+r))}
    if(p.base_memory){ls.push('');ls.push('Contexto de marca:');ls.push(p.base_memory)}
    if(p.dynamic_variables){ls.push('');ls.push('Variables dinamicas:');ls.push(p.dynamic_variables)}
    if(p.extra){ls.push('');ls.push('Audiencia:');ls.push(p.extra)}
    ls.push('');ls.push('--- Generado con Keeper Profiles ---')
    return ls.join('\n')
  }
  if(fmt==='technical_profile'){
    const ls:string[]=['# TECHNICAL PROFILE: '+p.name,'']
    if(p.role)ls.push('## Stack & Expertise\n'+p.role)
    if(p.tone)ls.push('\n## Communication Style\n'+p.tone)
    if(p.goals)ls.push('\n## Primary Goal\n'+p.goals)
    if(p.limits)ls.push('\n## Out of Scope\n'+p.limits)
    if(ra.length){ls.push('\n## Technical Rules');ra.forEach((r:string)=>ls.push('- '+r))}
    if(p.base_memory)ls.push('\n## Architecture Context\n'+p.base_memory)
    if(p.response_patterns)ls.push('\n## Response Patterns\n'+p.response_patterns)
    if(p.dynamic_variables)ls.push('\n## Dynamic Variables\n'+p.dynamic_variables)
    if(p.relationships)ls.push('\n## Relations\n'+p.relationships)
    if(p.extra)ls.push('\n## Additional Context\n'+p.extra)
    ls.push('\n---\n*Generated with Keeper Profiles*')
    return ls.join('\n')
  }
  return ''
}
function calcCompleteness(form:{name:string;role:string;tone:string;goals:string;rules:string;limits:string;extra:string;base_memory:string;response_patterns:string;dynamic_variables:string;relationships:string}):number{
  const checks=[!!form.name.trim(),!!form.role.trim(),!!form.tone.trim(),!!form.goals.trim(),form.rules.trim().split('\n').filter(Boolean).length>0,!!form.limits.trim(),!!form.extra.trim(),!!form.base_memory.trim(),!!form.response_patterns.trim(),!!form.dynamic_variables.trim(),!!form.relationships.trim()]
  return Math.round(checks.filter(Boolean).length/checks.length*100)
}
export default function ProfilesClient({userId,userEmail,plan,initialProfiles}:Props){
  const supabase=createClient()
  const isPro=plan==='pro'||plan==='team'
  const [profiles,setProfiles]=useState<KeeperProfile[]>(initialProfiles)
  const [showModal,setShowModal]=useState(false)
  const [editingProfile,setEditingProfile]=useState<KeeperProfile|null>(null)
  const [saving,setSaving]=useState(false)
  const [deleting,setDeleting]=useState<string|null>(null)
  const [copying,setCopying]=useState<string|null>(null)
  const [chatProfileId,setChatProfileId]=useState<string|null>(null)
  const [exportProfile,setExportProfile]=useState<KeeperProfile|null>(null)
  const [exportFormat,setExportFormat]=useState('system_prompt')
  const [exportCopied,setExportCopied]=useState(false)
  const [labProfile,setLabProfile]=useState<KeeperProfile|null>(null)
  const [labLoading,setLabLoading]=useState(false)
  const [labResult,setLabResult]=useState<{score:number;clarity:number;consistency:number;completeness:number;effectiveness:number;strengths:string[];improvements:string[];optimized:string;tip:string}|null>(null)
  const [labError,setLabError]=useState('')
  const [labAnimated,setLabAnimated]=useState(false)
  const [labLoadMsg,setLabLoadMsg]=useState(0)
  const [forgeLoadMsg,setForgeLoadMsg]=useState(0)
  const labMsgs=['Analizando coherencia interna...','Evaluando patrones de respuesta...','Calculando efectividad...','Midiendo consistencia...']
  const forgeMsgs=['Simulando escenario...','Evaluando consistencia de identidad...','Detectando gaps criticos...','Generando veredicto final...']
  // Keeper Forge state
  const [forgeProfile,setForgeProfile]=useState<KeeperProfile|null>(null)
  const [forgeMode,setForgeMode]=useState<'scenario'|'stress'|'free'>('scenario')
  const [forgeScenario,setForgeScenario]=useState('')
  const [forgeCustomScenario,setForgeCustomScenario]=useState('')
  const [forgeLoading,setForgeLoading]=useState(false)
  const [forgeResult,setForgeResult]=useState<Record<string,unknown>|null>(null)
  const [forgeError,setForgeError]=useState('')
  // Sandbox state
  const [sandboxProfile,setSandboxProfile]=useState<KeeperProfile|null>(null)
  // Form state
  const [showAdvanced,setShowAdvanced]=useState(false)
  const [form,setForm]=useState({name:'',profile_type:'assistant',role:'',tone:'',rules:'',goals:'',limits:'',extra:'',avatar_url:'',base_memory:'',response_patterns:'',dynamic_variables:'',relationships:''})
  const [aiDesc,setAiDesc]=useState('')
  const [aiLoading,setAiLoading]=useState(false)
  const [aiError,setAiError]=useState('')
  const [showAIPanel,setShowAIPanel]=useState(false)
  const [toast,setToast]=useState('')
  const [toastType,setToastType]=useState<'ok'|'err'>('ok')

  const showToast=(msg:string,type:'ok'|'err'='ok')=>{setToast(msg);setToastType(type);setTimeout(()=>setToast(''),2500)}
  const doCopy=(text:string)=>{try{navigator.clipboard.writeText(text)}catch(_e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta)}}
  const completeness=calcCompleteness(form)
  const openNew=()=>{setEditingProfile(null);setForm({name:'',profile_type:'assistant',role:'',tone:'',rules:'',goals:'',limits:'',extra:'',avatar_url:'',base_memory:'',response_patterns:'',dynamic_variables:'',relationships:''});setShowAIPanel(false);setAiError('');setShowAdvanced(false);setShowModal(true)}
  const openEdit=(p:KeeperProfile)=>{setEditingProfile(p);setForm({name:p.name,profile_type:p.profile_type||'assistant',role:p.role||'',tone:p.tone||'',rules:(p.rules||[]).join('\n'),goals:p.goals||'',limits:p.limits||'',extra:p.extra||'',avatar_url:p.avatar_url||'',base_memory:p.base_memory||'',response_patterns:p.response_patterns||'',dynamic_variables:p.dynamic_variables||'',relationships:p.relationships||''});const hasAdv=!!(p.base_memory||p.response_patterns||p.dynamic_variables||p.relationships);setShowAdvanced(hasAdv);setShowAIPanel(false);setShowModal(true)}
  const handleGenerateProfile=async()=>{
    if(!aiDesc.trim())return;setAiLoading(true);setAiError('')
    try{const res=await fetch('/api/generate-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:aiDesc})});const data=await res.json();if(data.profile){const p=data.profile;setForm(f=>({...f,name:p.name||f.name,role:p.role||f.role,tone:p.tone||f.tone,rules:p.rules||f.rules,extra:p.extra||f.extra}));setShowAIPanel(false);setAiDesc('')}else setAiError(data.error||'Error')}catch(_e){setAiError('Error de conexion')}
    setAiLoading(false)
  }
  const handleSave=async()=>{
    if(!form.name.trim())return;setSaving(true)
    const rules=form.rules.split('\n').map((r:string)=>r.trim()).filter(Boolean)
    const payload={name:form.name,profile_type:form.profile_type,role:form.role,tone:form.tone,rules,goals:form.goals,limits:form.limits,extra:form.extra,avatar_url:form.avatar_url||null,base_memory:form.base_memory||null,response_patterns:form.response_patterns||null,dynamic_variables:form.dynamic_variables||null,relationships:form.relationships||null,updated_at:new Date().toISOString()}
    try{
      if(editingProfile){const{data,error}=await supabase.from('keeper_profiles').update(payload).eq('id',editingProfile.id).select().single();if(error){showToast('Error al guardar','err');setSaving(false);return};setProfiles(prev=>prev.map(p=>p.id===editingProfile.id?data:p));showToast('Perfil actualizado')}
      else{const{data,error}=await supabase.from('keeper_profiles').insert({user_id:userId,emoji:form.name[0]?.toUpperCase()||'K',...payload}).select().single();if(error){showToast('Error al crear','err');setSaving(false);return};setProfiles(prev=>[data,...prev]);showToast('Perfil creado')}
    }catch(_e){showToast('Error inesperado','err')}
    setSaving(false);setShowModal(false);setEditingProfile(null)
  }
  const handleDelete=async(id:string)=>{setDeleting(id);const{error}=await supabase.from('keeper_profiles').delete().eq('id',id);if(error)showToast('Error al eliminar','err');else{setProfiles(prev=>prev.filter(p=>p.id!==id));if(chatProfileId===id)setChatProfileId(null);if(sandboxProfile?.id===id)setSandboxProfile(null);showToast('Perfil eliminado')};setDeleting(null)}
  const handleQuickCopy=(p:KeeperProfile)=>{doCopy(ge(p,'system_prompt'));setCopying(p.id);setTimeout(()=>setCopying(null),1500);showToast('Copiado')}
  const handleExportCopy=()=>{if(!exportProfile)return;doCopy(ge(exportProfile,exportFormat));setExportCopied(true);setTimeout(()=>setExportCopied(false),2000);showToast('Exportado y copiado')}
  const labTimerRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const forgeTimerRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const handleRunLab=async()=>{
    if(!labProfile)return;setLabLoading(true);setLabError('');setLabResult(null);setLabAnimated(false);setLabLoadMsg(0)
    labTimerRef.current=setInterval(()=>setLabLoadMsg(p=>(p+1)%4),1800)
    try{const res=await fetch('/api/analyze-context',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:ge(labProfile,'plain_text'),type:'profile'})});const data=await res.json();if(data.analysis){setLabResult(data.analysis);setTimeout(()=>setLabAnimated(true),80)}else setLabError(data.error||'Error al analizar')}catch(_e){setLabError('Error de conexion')}
    if(labTimerRef.current)clearInterval(labTimerRef.current)
    setLabLoading(false)
  }
  const handleRunForge=async()=>{
    if(!forgeProfile)return;setForgeLoading(true);setForgeError('');setForgeResult(null);setForgeLoadMsg(0)
    forgeTimerRef.current=setInterval(()=>setForgeLoadMsg(p=>(p+1)%4),1800)
    const scenarioToUse=forgeMode==='scenario'?(forgeCustomScenario.trim()||forgeScenario):''
    try{const res=await fetch('/api/forge-simulate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile:forgeProfile,mode:forgeMode,scenario:scenarioToUse})});const data=await res.json();if(data.result){setForgeResult(data.result);supabase.from('forge_results').insert({profile_id:forgeProfile?.id,mode:forgeMode,result:data.result,scenario:forgeScenario}).then(()=>{}).catch(()=>{})}else setForgeError(data.error||'Error en simulacion')}catch(_e){setForgeError('Error de conexion')}
    if(forgeTimerRef.current)clearInterval(forgeTimerRef.current)
    setForgeLoading(false)
  }
  const openForge=(p:KeeperProfile)=>{setForgeProfile(p);setForgeMode('scenario');setForgeResult(null);setForgeError('');const type=p.profile_type||'custom';const sc=SCENARIOS_BY_TYPE[type]||SCENARIOS_BY_TYPE.custom;setForgeScenario(sc[0]);setForgeCustomScenario('')}
  const exportText=exportProfile?ge(exportProfile,exportFormat):''
  const chatProfile=chatProfileId?profiles.find(p=>p.id===chatProfileId):null
  return (
    <div className="min-h-screen" style={{background:'#080808'}}>
      <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'700px',height:'300px',background:'radial-gradient(ellipse at center top,rgba(139,92,246,0.07) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}} />
      <Navbar userEmail={userEmail} plan={plan} />
      {toast&&<div style={{position:'fixed',top:'20px',right:'20px',zIndex:200}} className={"px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold border "+(toastType==='ok'?'bg-zinc-900 text-white border-zinc-700':'bg-red-600 text-white border-red-500')}>{toast}</div>}
      {/* Dot grid background */}
      <div style={{position:'fixed',inset:0,backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none',zIndex:0,maskImage:'radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)'}} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 0 20px rgba(139,92,246,0.3)'}} className="w-8 h-8 rounded-xl flex items-center justify-center"><svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Keeper Profiles</h1>
              <span style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)'}} className="text-xs text-violet-300 font-bold px-2 py-0.5 rounded-full">Beta</span>
            </div>
            <p className="text-zinc-500 text-sm">Identidades de IA portables. Define, simula, exporta y reutiliza.</p>
          </div>
          <button onClick={openNew} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 20px rgba(139,92,246,0.25)'}} className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>Nuevo perfil</button>
        </div>
        {profiles.length===0&&(
          <div className="text-center py-24">
            <div style={{background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)'}} className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"><svg width="32" height="32" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
            <h3 className="text-white font-bold text-xl mb-3">Crea tu primera identidad de IA</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">Define, simula con Keeper Forge y exporta a cualquier IA.</p>
            <button onClick={openNew} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 20px rgba(139,92,246,0.3)'}} className="text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">Crear primer perfil</button>
            <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">{PT.slice(0,6).map(t=><div key={t.id} style={{background:'rgba(39,39,42,0.4)',border:'1px solid rgba(63,63,70,0.4)'}} className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl"><svg width="14" height="14" fill="none" stroke="rgba(113,113,122,0.7)" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={t.icon}/></svg><span className="text-zinc-600 text-xs">{t.label}</span></div>)}</div>
          </div>
        )}
        {profiles.length>0&&(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p)=>{
              const ti=PT.find(t=>t.id===p.profile_type)||PT[6]
              const hasAdv=!!(p.base_memory||p.response_patterns||p.dynamic_variables||p.relationships)
              return(
                <div key={p.id} style={{background:'rgba(14,14,18,0.95)',border:sandboxProfile?.id===p.id?'1px solid rgba(16,185,129,0.35)':'1px solid rgba(63,63,70,0.5)',transition:'all 0.25s',boxShadow:sandboxProfile?.id===p.id?'0 0 0 1px rgba(16,185,129,0.15), 0 8px 32px rgba(16,185,129,0.06)':'none'}} className="rounded-2xl overflow-hidden group" onMouseEnter={e=>{if(!sandboxProfile||(sandboxProfile&&sandboxProfile.id!==p.id)){e.currentTarget.style.boxShadow='0 0 24px rgba(139,92,246,0.07)';e.currentTarget.style.borderColor='rgba(139,92,246,0.25)'}}} onMouseLeave={e=>{if(!sandboxProfile||(sandboxProfile&&sandboxProfile.id!==p.id)){e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='rgba(63,63,70,0.5)'}}}>
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {p.avatar_url?<img src={p.avatar_url} alt={p.name} className="w-11 h-11 rounded-xl object-cover border border-zinc-700"/>:<div style={{boxShadow:'0 0 15px rgba(139,92,246,0.15)'}} className={"w-11 h-11 rounded-xl bg-gradient-to-br "+gc(p.name)+" flex items-center justify-center font-bold text-white text-base"}>{(p.name[0]||'K').toUpperCase()}</div>}
                        <div>
                          <div className="font-bold text-white text-sm leading-tight mb-1">{p.name}</div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"><svg width="9" height="9" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={ti.icon}/></svg><span className="text-violet-400 text-xs font-medium">{ti.label}</span></div>
                            {hasAdv&&<div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)'}} className="inline-flex items-center px-1.5 py-0.5 rounded-md"><span className="text-emerald-500 text-xs font-medium">+adv</span></div>}
                            {p.lab_score&&<div style={{background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)'}} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"><span className="text-violet-300 text-xs font-bold">{p.lab_score}</span><span className="text-violet-600 text-xs">/10</span></div>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>openEdit(p)} className="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-zinc-200 transition-colors"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                        <button onClick={()=>handleDelete(p.id)} disabled={deleting===p.id} className="w-7 h-7 rounded-lg hover:bg-red-900/20 flex items-center justify-center transition-colors">{deleting===p.id?<div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/>:<svg width="12" height="12" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {p.role&&<div className="flex gap-2"><span className="text-zinc-600 text-xs w-8 flex-shrink-0 pt-0.5">Rol</span><span className="text-zinc-300 text-xs line-clamp-2">{p.role}</span></div>}
                      {p.tone&&<div className="flex gap-2"><span className="text-zinc-600 text-xs w-8 flex-shrink-0 pt-0.5">Tono</span><span className="text-zinc-400 text-xs line-clamp-1">{p.tone}</span></div>}
                      {(p.rules||[]).length>0&&<div className="flex gap-2 items-start"><span className="text-zinc-600 text-xs w-8 flex-shrink-0 pt-0.5">Reglas</span><div className="flex flex-wrap gap-1">{(p.rules||[]).slice(0,2).map((r:string,i:number)=><span key={i} style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}} className="text-xs text-violet-400 px-1.5 py-0.5 rounded-md">{r.length>22?r.slice(0,22)+'...':r}</span>)}{(p.rules||[]).length>2&&<span className="text-xs text-zinc-700">+{(p.rules||[]).length-2}</span>}</div></div>}
                    </div>
                  </div>
                  {(()=>{const cp=profileCompleteness(p);return cp>10?(<div title={'Completitud: '+cp+'%'} style={{height:'2px',background:'rgba(255,255,255,0.04)'}}><div style={{width:cp+'%',height:'2px',background:cp>=80?'rgba(16,185,129,0.5)':cp>=50?'rgba(245,158,11,0.5)':'rgba(124,58,237,0.4)',transition:'width 0.6s ease'}}/></div>):null})()}
                  <div style={{background:'rgba(9,9,11,0.5)',borderTop:'1px solid rgba(63,63,70,0.4)'}} className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-700 text-xs">{new Date(p.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
                      {p.lab_score!=null&&<div style={{background:p.lab_score>=75?'rgba(16,185,129,0.12)':p.lab_score>=50?'rgba(245,158,11,0.12)':'rgba(239,68,68,0.1)',border:'1px solid '+( p.lab_score>=75?'rgba(16,185,129,0.25)':p.lab_score>=50?'rgba(245,158,11,0.25)':'rgba(239,68,68,0.2)'),color:p.lab_score>=75?'#34d399':p.lab_score>=50?'#fbbf24':'#f87171'}} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold leading-none"><svg width="7" height="7" fill="currentColor" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{p.lab_score}</div>}
                    </div>
                    <div className="space-y-2 mt-1">
                      <div className="flex gap-1.5">
                        <button
                          onClick={()=>{setLabProfile(p);setLabResult(null);setLabError('');setLabAnimated(false)}}
                          style={{flex:1,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',color:'rgba(147,197,253,0.9)',padding:'6px 0',borderRadius:8,fontSize:12,fontWeight:600,letterSpacing:'0.02em',display:'flex',alignItems:'center',justifyContent:'center',gap:5,cursor:'pointer',transition:'all 0.15s'}}
                          onMouseOver={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(59,130,246,0.18)'}}
                          onMouseOut={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(59,130,246,0.1)'}}
                        >
                          <svg style={{width:11,height:11}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                          Lab{p.lab_score?<span style={{fontSize:10,opacity:0.7,marginLeft:2}}>{p.lab_score}</span>:null}
                        </button>
                        {isPro?(
                          <button
                            onClick={()=>openForge(p)}
                            style={{flex:1,background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.22)',color:'rgba(253,230,138,0.9)',padding:'6px 0',borderRadius:8,fontSize:12,fontWeight:600,letterSpacing:'0.02em',display:'flex',alignItems:'center',justifyContent:'center',gap:5,cursor:'pointer',transition:'all 0.15s'}}
                            onMouseOver={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(251,191,36,0.15)'}}
                            onMouseOut={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(251,191,36,0.08)'}}
                          >
                            <svg style={{width:11,height:11}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            Forge
                          </button>
                        ):(
                          <div
                            style={{flex:1,background:'rgba(251,191,36,0.03)',border:'1px solid rgba(251,191,36,0.08)',color:'rgba(253,230,138,0.3)',padding:'6px 0',borderRadius:8,fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:5,cursor:'not-allowed'}}
                            title="Disponible en Pro"
                          >
                            <svg style={{width:10,height:10}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            Forge
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex',gap:4}}>
                        <button
                          onClick={()=>handleQuickCopy(p)}
                          style={{flex:1,background:'transparent',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.4)',padding:'5px 0',borderRadius:6,fontSize:11,cursor:'pointer',transition:'all 0.15s'}}
                          onMouseOver={e=>{(e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.7)'}}
                          onMouseOut={e=>{(e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.4)'}}
                        >Copiar</button>
                        <button
                          onClick={()=>setExportProfile(p)}
                          style={{flex:1,background:'transparent',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.4)',padding:'5px 0',borderRadius:6,fontSize:11,cursor:'pointer',transition:'all 0.15s'}}
                          onMouseOver={e=>{(e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.7)'}}
                          onMouseOut={e=>{(e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.4)'}}
                        >Export</button>
                        <button
                          onClick={()=>{if(sandboxProfile?.id===p.id){setSandboxProfile(null)}else{setSandboxProfile(p)}}}
                          style={{flex:1,background:sandboxProfile?.id===p.id?'rgba(34,197,94,0.1)':'transparent',border:sandboxProfile?.id===p.id?'1px solid rgba(34,197,94,0.25)':'1px solid rgba(255,255,255,0.07)',color:sandboxProfile?.id===p.id?'rgba(134,239,172,0.9)':'rgba(255,255,255,0.4)',padding:'5px 0',borderRadius:6,fontSize:11,cursor:'pointer',transition:'all 0.15s'}}
                        >Chat</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {sandboxProfile&&<div className="mt-6"><KeeperSandbox profile={sandboxProfile} onClose={()=>setSandboxProfile(null)}/></div>}
        {chatProfile&&<div className="mt-6"><ProfileChat profile={chatProfile} onClose={()=>setChatProfileId(null)}/></div>}
        {profiles.length>0&&<div style={{background:'rgba(24,24,27,0.5)',border:'1px solid rgba(63,63,70,0.4)'}} className="mt-6 p-4 rounded-xl flex items-start gap-3"><svg width="14" height="14" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><p className="text-zinc-600 text-xs"><strong className="text-zinc-400">Flujo recomendado:</strong> Crea el perfil → Lab (analiza) → Forge (simula escenarios) → Export (portabilidad). Sandbox para chatear directamente.</p></div>}
      </div>
      {exportProfile&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)setExportProfile(null)}}>
          <div style={{background:'rgba(10,10,14,0.99)',border:'1px solid rgba(59,130,246,0.18)',boxShadow:'0 0 60px rgba(59,130,246,0.06), 0 0 0 1px rgba(255,255,255,0.04)',maxHeight:'90vh'}} className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col">
            <div style={{borderBottom:'1px solid rgba(63,63,70,0.4)'}} className="flex items-center justify-between px-6 py-4 flex-shrink-0"><div><h2 className="font-bold text-white text-sm">Exportar perfil</h2><p className="text-zinc-500 text-xs mt-0.5">{exportProfile.name}</p></div><button onClick={()=>setExportProfile(null)} className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <div className="flex flex-col sm:flex-row overflow-hidden flex-1 min-h-0">
              <div style={{borderRight:'1px solid rgba(63,63,70,0.4)'}} className="sm:w-56 flex-shrink-0 p-4 overflow-y-auto"><p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Formato</p><div className="space-y-1.5">{EP.map(preset=>{const locked=preset.badge==='Pro'&&!isPro;const active=exportFormat===preset.id;return(<button key={preset.id} onClick={()=>{if(!locked)setExportFormat(preset.id)}} style={{background:active?'rgba(139,92,246,0.15)':'rgba(39,39,42,0.3)',border:active?'1px solid rgba(139,92,246,0.5)':'1px solid transparent',opacity:locked?0.45:1,cursor:locked?'not-allowed':'pointer',width:'100%'}} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left"><svg width="12" height="12" fill="none" stroke={active?'#a78bfa':'#52525b'} strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={preset.icon}/></svg><div className="flex-1 min-w-0"><div className={"text-xs font-semibold "+(active?'text-violet-300':'text-zinc-400')}>{preset.label}</div><div className="text-xs text-zinc-600 truncate">{preset.desc}</div></div>{preset.badge&&<span style={{background:locked?'rgba(120,53,15,0.3)':'rgba(139,92,246,0.2)',border:locked?'1px solid rgba(120,53,15,0.4)':'1px solid rgba(139,92,246,0.3)'}} className={"text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 "+(locked?'text-amber-500':'text-violet-400')}>{preset.badge}</span>}</button>)})}</div></div>
              <div className="flex-1 flex flex-col p-4 min-h-0"><p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider flex-shrink-0">Vista previa</p><div style={{background:'rgba(9,9,11,0.8)',border:'1px solid rgba(63,63,70,0.4)'}} className="rounded-xl p-4 flex-1 overflow-y-auto min-h-0"><pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{exportText}</pre></div></div>
            </div>
            <div style={{borderTop:'1px solid rgba(63,63,70,0.4)'}} className="px-6 py-4 flex gap-3 flex-shrink-0"><button onClick={handleExportCopy} style={{background:exportCopied?'rgba(16,185,129,0.15)':'linear-gradient(135deg,#7c3aed,#6d28d9)',border:exportCopied?'1px solid rgba(16,185,129,0.3)':'none',boxShadow:exportCopied?'none':'0 4px 15px rgba(139,92,246,0.25)'}} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all text-white">{exportCopied?<><svg width="14" height="14" fill="none" stroke="#34d399" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span style={{color:'#34d399'}}>Copiado</span></>:<><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copiar al portapapeles</>}</button><button onClick={()=>setExportProfile(null)} style={{border:'1px solid rgba(63,63,70,0.6)'}} className="px-4 py-2.5 text-zinc-400 text-sm rounded-xl hover:bg-zinc-800 hover:text-white transition-colors">Cerrar</button></div>
          </div>
        </div>
      )}
      {labProfile&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget){setLabProfile(null);setLabResult(null)}}}>
          <div style={{background:'rgba(18,18,20,0.98)',border:'1px solid rgba(63,63,70,0.6)',boxShadow:'0 0 60px rgba(139,92,246,0.12)',maxHeight:'90vh'}} className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col">
            <div style={{borderBottom:'1px solid rgba(59,130,246,0.15)',background:'rgba(59,130,246,0.03)'}} className="flex items-center justify-between px-6 py-4 flex-shrink-0"><div className="flex items-center gap-3"><div style={{background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.25)'}} className="w-8 h-8 rounded-xl flex items-center justify-center"><svg width="14" height="14" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div><div><h2 className="font-bold text-white text-sm">Keeper Lab</h2><p className="text-blue-500/60 text-xs">{labProfile.name}</p></div></div><button onClick={()=>{setLabProfile(null);setLabResult(null)}} className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {!labResult&&!labLoading&&!labError&&<div className="text-center py-6"><p className="text-zinc-400 text-sm mb-2 leading-relaxed">Analisis en 4 dimensiones:</p><div className="flex justify-center gap-4 mb-6">{[['Claridad','text-blue-400'],['Consistencia','text-violet-400'],['Completitud','text-emerald-400'],['Efectividad','text-amber-400']].map(([label,color])=><div key={label} className="text-center"><div style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.5)'}} className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1"><span className={"text-sm font-black "+color}>?</span></div><span className="text-xs text-zinc-600">{label}</span></div>)}</div><button onClick={handleRunLab} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 20px rgba(139,92,246,0.25)'}} className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity mx-auto"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Analizar perfil</button></div>}
              {labLoading&&<div className="flex flex-col items-center py-8 gap-4"><div className="relative w-12 h-12"><div style={{border:'2px solid rgba(59,130,246,0.15)',borderTop:'2px solid #3b82f6'}} className="absolute inset-0 rounded-full animate-spin"/><div style={{border:'2px solid rgba(139,92,246,0.1)',borderBottom:'2px solid #7c3aed',animationDuration:'1.4s'}} className="absolute inset-1.5 rounded-full animate-spin"/></div><div className="text-center space-y-1"><p className="text-blue-400 text-sm font-medium" style={{transition:'opacity 0.4s'}}>{labMsgs[labLoadMsg]}</p><p className="text-zinc-700 text-xs">Keeper Lab · Analisis profundo</p></div></div>}
              {labError&&<div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)'}} className="p-4 rounded-xl"><p className="text-red-400 text-sm">{labError}</p><button onClick={handleRunLab} className="mt-3 text-xs text-violet-400 hover:text-violet-300">Reintentar</button></div>}
              {labResult&&(<div className="space-y-5">
                  <div style={{textAlign:'center',padding:'20px 0 12px'}}>
                    <div style={{position:'relative',display:'inline-block',marginBottom:16}}>
                      <div style={{fontSize:52,fontWeight:900,color:'rgba(147,197,253,0.9)',lineHeight:1,marginBottom:4}}>{String(labResult.score||0)}<span style={{fontSize:16,opacity:0.4,marginLeft:4}}>/ 10</span></div>
                      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
                        <div style={{fontSize:28,fontWeight:900,color:'rgba(147,197,253,0.95)',lineHeight:1}}>{String(labResult.score||0)}</div>
                        <div style={{fontSize:9,color:'rgba(147,197,253,0.5)',letterSpacing:'0.1em',marginTop:2}}>/ 10</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
                      {[{k:'clarity',label:'Claridad',color:'rgba(96,165,250,0.9)'},{k:'consistency',label:'Consistencia',color:'rgba(167,139,250,0.9)'},{k:'completeness',label:'Completitud',color:'rgba(52,211,153,0.9)'},{k:'effectiveness',label:'Efectividad',color:'rgba(251,191,36,0.9)'}].map(({k,label,color})=>(
                        <div key={k} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,padding:'8px 4px',textAlign:'center'}}>
                          <div style={{fontSize:18,fontWeight:800,color,lineHeight:1.1}}>{Number((labResult as Record<string,string|number>)[k]||0)}</div>
                          <div style={{fontSize:8,color:'rgba(255,255,255,0.35)',letterSpacing:'0.06em',marginTop:3}}>{label.toUpperCase()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {labResult.tip&&<div style={{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.15)',borderRadius:10,padding:'10px 14px'}}>
                    <p style={{fontSize:11,color:'rgba(147,197,253,0.8)',margin:0,lineHeight:1.5}}>&#9670; {String(labResult.tip)}</p>
                  </div>}
                  {(labResult.improvements as string[]||[]).length>0&&<div>
                    <p style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.08em',marginBottom:6}}>MEJORAS</p>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      {(labResult.improvements as string[]).slice(0,3).map((imp,i)=>(
                        <div key={i} style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.12)',borderRadius:6,padding:'6px 10px'}}>
                          <p style={{fontSize:11,color:'rgba(252,165,165,0.8)',margin:0}}>{imp}</p>
                        </div>
                      ))}
                    </div>
                  </div>}
                  {labResult.optimized&&<div style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:10,padding:'10px 14px'}}>
                    <p style={{fontSize:10,color:'rgba(52,211,153,0.5)',letterSpacing:'0.08em',marginBottom:4}}>VERSION OPTIMIZADA</p>
                    <p style={{fontSize:11,color:'rgba(52,211,153,0.8)',margin:0,lineHeight:1.5,maxHeight:80,overflow:'hidden'}}>{String(labResult.optimized).slice(0,200)}...</p>
                  </div>}
                  <button onClick={handleRunLab} className="w-full text-xs text-zinc-700 hover:text-zinc-500 transition py-1">Repetir analisis</button>
              </div>)}
            </div>
          </div>
        </div>
      )}
      {forgeProfile&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget){setForgeProfile(null);setForgeResult(null)}}}>
          <div style={{background:'rgba(18,18,20,0.98)',border:'1px solid rgba(245,158,11,0.2)',boxShadow:'0 0 60px rgba(245,158,11,0.06)',maxHeight:'90vh'}} className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col">
            <div style={{borderBottom:'1px solid rgba(63,63,70,0.4)',background:'rgba(245,158,11,0.04)'}} className="flex items-center justify-between px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div style={{background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)'}} className="w-8 h-8 rounded-xl flex items-center justify-center"><svg width="14" height="14" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg></div>
                <div><h2 className="font-bold text-white text-sm">Keeper Forge</h2><p className="text-zinc-500 text-xs">Simulacion profunda — {forgeProfile.name}</p></div>
              </div>
              <button onClick={()=>{setForgeProfile(null);setForgeResult(null)}} className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {!forgeResult&&!forgeLoading&&(
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 mb-3">Modo de simulacion</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{id:'scenario' as const,label:'Escenario',desc:'Prueba en una situacion concreta',icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'},{id:'stress' as const,label:'Estres',desc:'Detecta puntos debiles',icon:'M13 10V3L4 14h7v7l9-11h-7z'},{id:'free' as const,label:'Libre',desc:'Validacion rapida',icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}].map(m=>(
                        <button key={m.id} onClick={()=>{setForgeMode(m.id);setForgeResult(null);setForgeError('')}} style={{background:forgeMode===m.id?'rgba(245,158,11,0.12)':'rgba(39,39,42,0.5)',border:forgeMode===m.id?'1px solid rgba(245,158,11,0.4)':'1px solid rgba(63,63,70,0.5)'}} className="flex flex-col items-start gap-1.5 p-3 rounded-xl transition-all">
                          <svg width="13" height="13" fill="none" stroke={forgeMode===m.id?'#fbbf24':'#52525b'} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={m.icon}/></svg>
                          <span className={"text-xs font-bold "+(forgeMode===m.id?'text-amber-300':'text-zinc-500')}>{m.label}</span>
                          <span className="text-xs text-zinc-700 leading-tight">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {forgeMode==='scenario'&&(
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-zinc-400">Escenario a simular</p>
                      <div className="space-y-1.5">
                        {(SCENARIOS_BY_TYPE[forgeProfile.profile_type||'custom']||SCENARIOS_BY_TYPE.custom).map((s:string,i:number)=>(
                          <button key={i} onClick={()=>{setForgeScenario(s);setForgeCustomScenario('')}} style={{background:forgeScenario===s&&!forgeCustomScenario?'rgba(245,158,11,0.1)':'rgba(39,39,42,0.4)',border:forgeScenario===s&&!forgeCustomScenario?'1px solid rgba(245,158,11,0.3)':'1px solid rgba(63,63,70,0.4)',width:'100%',textAlign:'left'}} className="px-3 py-2.5 rounded-xl text-xs transition-all">
                            <span className={forgeScenario===s&&!forgeCustomScenario?'text-amber-300':'text-zinc-400'}>{s}</span>
                          </button>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600 mb-1.5">O escribe tu propio escenario:</p>
                        <textarea style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none transition-colors" placeholder="Describe una situacion especifica para simular..." rows={2} value={forgeCustomScenario} onChange={e=>{setForgeCustomScenario(e.target.value);if(e.target.value)setForgeScenario('')}}/>
                      </div>
                    </div>
                  )}
                  {forgeMode==='stress'&&<div style={{background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.15)'}} className="p-4 rounded-xl"><p className="text-red-400 text-xs font-semibold mb-1">Modo estres activo</p><p className="text-zinc-500 text-xs leading-relaxed">La IA generara preguntas dificiles y edge cases para encontrar donde el perfil podria fallar o ser inconsistente.</p></div>}
                  {forgeMode==='free'&&<div style={{background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.15)'}} className="p-4 rounded-xl"><p className="text-emerald-400 text-xs font-semibold mb-1">Validacion rapida</p><p className="text-zinc-500 text-xs leading-relaxed">Genera una interaccion de prueba corta para verificar que el comportamiento del perfil es coherente con su definicion.</p></div>}
                  {forgeError&&<div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)'}} className="p-3 rounded-xl"><p className="text-red-400 text-xs">{forgeError}</p></div>}
                  <button onClick={handleRunForge} disabled={forgeMode==='scenario'&&!forgeScenario&&!forgeCustomScenario.trim()} style={{background:'linear-gradient(135deg,#d97706,#b45309)',boxShadow:'0 4px 20px rgba(245,158,11,0.2)'}} className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>Ejecutar simulacion</button>
                </div>
              )}
              {forgeLoading&&<div className="flex flex-col items-center py-12 gap-4">
                <div className="relative w-12 h-12"><div style={{border:'2px solid rgba(245,158,11,0.15)',borderTop:'2px solid #f59e0b'}} className="absolute inset-0 rounded-full animate-spin"/><div style={{border:'2px solid rgba(251,191,36,0.08)',borderBottom:'2px solid #fbbf24',animationDuration:'1.4s'}} className="absolute inset-1.5 rounded-full animate-spin"/></div>
                <div className="text-center space-y-1"><p className="text-amber-400 text-sm font-medium">{forgeMsgs[forgeLoadMsg]}</p><p className="text-zinc-700 text-xs">Keeper Forge &middot; Simulacion activa</p></div>
              </div>}
              {forgeResult&&!forgeLoading&&(
                <div className="space-y-4">
                  {forgeMode==='scenario'&&(
                    <div>
                      <div style={{textAlign:'center',padding:'24px 0 16px'}}>
                        <div style={{
                          display:'inline-block',
                          padding:'10px 28px',
                          borderRadius:12,
                          marginBottom:12,
                          background:forgeResult.verdict==='SOLIDO'?'rgba(34,197,94,0.1)':forgeResult.verdict==='ACEPTABLE'?'rgba(251,191,36,0.08)':'rgba(239,68,68,0.08)',
                          border:forgeResult.verdict==='SOLIDO'?'1px solid rgba(34,197,94,0.3)':forgeResult.verdict==='ACEPTABLE'?'1px solid rgba(251,191,36,0.25)':'1px solid rgba(239,68,68,0.25)'
                        }}>
                          <div style={{
                            fontSize:32,
                            fontWeight:900,
                            letterSpacing:'0.06em',
                            color:forgeResult.verdict==='SOLIDO'?'rgba(134,239,172,0.95)':forgeResult.verdict==='ACEPTABLE'?'rgba(253,230,138,0.95)':'rgba(252,165,165,0.95)',
                            lineHeight:1
                          }}>{String(forgeResult.verdict||'—')}</div>
                          <div style={{fontSize:9,letterSpacing:'0.12em',opacity:0.5,marginTop:4,color:'white'}}>VEREDICTO FORGE</div>
                        </div>
                        {forgeResult.consistency_score!=null&&(
                          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4}}>
                            <div style={{height:4,flex:1,maxWidth:120,background:'rgba(255,255,255,0.06)',borderRadius:2}}>
                              <div style={{height:'100%',borderRadius:2,background:'rgba(251,191,36,0.7)',width:String(Math.min(100,Number(forgeResult.consistency_score||0)*10))+'%',transition:'width 1s ease'}}/>
                            </div>
                            <span style={{fontSize:12,color:'rgba(253,230,138,0.7)',fontWeight:700}}>{String(forgeResult.consistency_score)}/10</span>
                          </div>
                        )}
                      </div>
                      {forgeResult.simulated_response&&<div style={{background:'rgba(24,24,27,0.8)',border:'1px solid rgba(63,63,70,0.5)',borderRadius:10,padding:'12px 14px',marginBottom:12}}>
                        <p style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.08em',marginBottom:6}}>RESPUESTA SIMULADA</p>
                        <p style={{fontSize:12,color:'rgba(255,255,255,0.75)',margin:0,lineHeight:1.6}}>{String(forgeResult.simulated_response)}</p>
                      </div>}
                      {(forgeResult.strengths_shown as string[]||[]).length>0&&<div style={{marginBottom:8}}>
                        <p style={{fontSize:10,color:'rgba(52,211,153,0.5)',letterSpacing:'0.08em',marginBottom:4}}>FORTALEZAS</p>
                        {(forgeResult.strengths_shown as string[]).map((s,i)=><div key={i} style={{background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.12)',borderRadius:6,padding:'5px 10px',marginBottom:3}}><p style={{fontSize:11,color:'rgba(134,239,172,0.8)',margin:0}}>{s}</p></div>)}
                      </div>}
                      {(forgeResult.detected_issues as string[]||[]).length>0&&<div style={{marginBottom:8}}>
                        <p style={{fontSize:10,color:'rgba(239,68,68,0.5)',letterSpacing:'0.08em',marginBottom:4}}>PROBLEMAS DETECTADOS</p>
                        {(forgeResult.detected_issues as string[]).map((s,i)=><div key={i} style={{background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.12)',borderRadius:6,padding:'5px 10px',marginBottom:3}}><p style={{fontSize:11,color:'rgba(252,165,165,0.8)',margin:0}}>{s}</p></div>)}
                      </div>}
                      {forgeResult.recommendation&&<div style={{background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.18)',borderRadius:10,padding:'10px 14px'}}>
                        <p style={{fontSize:10,color:'rgba(167,139,250,0.6)',letterSpacing:'0.08em',marginBottom:4}}>RECOMENDACION</p>
                        <p style={{fontSize:12,color:'rgba(167,139,250,0.85)',margin:0,lineHeight:1.5}}>{String(forgeResult.recommendation)}</p>
                      </div>}
                    </div>
                  )}
                  {forgeMode==='stress'&&(
                    <div>
                      <div style={{textAlign:'center',padding:'20px 0 16px'}}>
                        <div style={{
                          display:'inline-block',
                          padding:'10px 28px',
                          borderRadius:12,
                          marginBottom:12,
                          background:forgeResult.overall_verdict==='ROBUSTO'?'rgba(34,197,94,0.1)':forgeResult.overall_verdict==='FRAGIL'?'rgba(239,68,68,0.08)':'rgba(251,191,36,0.08)',
                          border:forgeResult.overall_verdict==='ROBUSTO'?'1px solid rgba(34,197,94,0.3)':forgeResult.overall_verdict==='FRAGIL'?'1px solid rgba(239,68,68,0.25)':'1px solid rgba(251,191,36,0.25)'
                        }}>
                          <div style={{fontSize:28,fontWeight:900,letterSpacing:'0.06em',color:forgeResult.overall_verdict==='ROBUSTO'?'rgba(134,239,172,0.95)':forgeResult.overall_verdict==='FRAGIL'?'rgba(252,165,165,0.95)':'rgba(253,230,138,0.95)',lineHeight:1}}>{String(forgeResult.overall_verdict||'—')}</div>
                          <div style={{fontSize:9,letterSpacing:'0.12em',opacity:0.5,marginTop:4,color:'white'}}>ESTRÉS FORGE</div>
                        </div>
                      </div>
                      {(forgeResult.stress_questions as string[]||[]).length>0&&<div style={{marginBottom:10}}>
                        <p style={{fontSize:10,color:'rgba(251,191,36,0.5)',letterSpacing:'0.08em',marginBottom:6}}>PREGUNTAS DE ESTRÉS</p>
                        {(forgeResult.stress_questions as string[]).map((q,i)=><div key={i} style={{borderLeft:'2px solid rgba(251,191,36,0.3)',paddingLeft:10,marginBottom:6}}><p style={{fontSize:11,color:'rgba(253,230,138,0.75)',margin:0}}>{q}</p></div>)}
                      </div>}
                      {(forgeResult.critical_gaps as string[]||[]).length>0&&<div style={{marginBottom:8}}>
                        <p style={{fontSize:10,color:'rgba(239,68,68,0.5)',letterSpacing:'0.08em',marginBottom:4}}>GAPS CRITICOS</p>
                        {(forgeResult.critical_gaps as string[]).map((g,i)=><div key={i} style={{background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.12)',borderRadius:6,padding:'5px 10px',marginBottom:3}}><p style={{fontSize:11,color:'rgba(252,165,165,0.8)',margin:0}}>{g}</p></div>)}
                      </div>}
                      {(forgeResult.hardening_suggestions as string[]||[]).length>0&&<div>
                        <p style={{fontSize:10,color:'rgba(52,211,153,0.5)',letterSpacing:'0.08em',marginBottom:4}}>MEJORAS</p>
                        {(forgeResult.hardening_suggestions as string[]).map((s,i)=><div key={i} style={{background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.12)',borderRadius:6,padding:'5px 10px',marginBottom:3}}><p style={{fontSize:11,color:'rgba(134,239,172,0.8)',margin:0}}>{s}</p></div>)}
                      </div>}
                    </div>
                  )}
                  {forgeMode==='free'&&(
                    <div>
                      <div style={{textAlign:'center',padding:'20px 0 16px'}}>
                        <div style={{
                          display:'inline-block',
                          padding:'10px 28px',
                          borderRadius:12,
                          marginBottom:12,
                          background:forgeResult.quick_verdict==='COHERENTE'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.08)',
                          border:forgeResult.quick_verdict==='COHERENTE'?'1px solid rgba(34,197,94,0.3)':'1px solid rgba(239,68,68,0.25)'
                        }}>
                          <div style={{fontSize:26,fontWeight:900,letterSpacing:'0.06em',color:forgeResult.quick_verdict==='COHERENTE'?'rgba(134,239,172,0.95)':'rgba(252,165,165,0.95)',lineHeight:1}}>{String(forgeResult.quick_verdict||'—')}</div>
                          <div style={{fontSize:9,letterSpacing:'0.12em',opacity:0.5,marginTop:4,color:'white'}}>VERIFICACION LIBRE</div>
                        </div>
                      </div>
                      {(forgeResult.test_interaction as Record<string,string>)?.question&&<div style={{background:'rgba(24,24,27,0.8)',border:'1px solid rgba(63,63,70,0.5)',borderRadius:10,padding:'12px 14px',marginBottom:10}}>
                        <p style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.08em',marginBottom:6}}>PREGUNTA DE PRUEBA</p>
                        <p style={{fontSize:12,color:'rgba(255,255,255,0.75)',margin:0,marginBottom:8}}>{String((forgeResult.test_interaction as Record<string,string>).question)}</p>
                        <div style={{borderTop:'1px solid rgba(63,63,70,0.4)',paddingTop:8}}>
                          <p style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.08em',marginBottom:4}}>RESPUESTA ESPERADA</p>
                          <p style={{fontSize:11,color:'rgba(167,139,250,0.8)',margin:0}}>{String((forgeResult.test_interaction as Record<string,string>).expected_response)}</p>
                        </div>
                      </div>}
                      {forgeResult.notes&&<p style={{fontSize:11,color:'rgba(255,255,255,0.5)',margin:0,lineHeight:1.5,fontStyle:'italic'}}>"{String(forgeResult.notes)}"</p>}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={()=>setForgeResult(null)} style={{flex:1,background:'transparent',border:'1px solid rgba(63,63,70,0.5)',color:'rgba(255,255,255,0.4)',padding:'7px 0',borderRadius:8,fontSize:11,cursor:'pointer'}}>Nueva simulacion</button>
                    <button onClick={()=>openEdit(forgeProfile)} style={{flex:1,background:'transparent',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(167,139,250,0.7)',padding:'7px 0',borderRadius:8,fontSize:11,cursor:'pointer'}}>Editar perfil</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showModal&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget){setShowModal(false);setShowAIPanel(false)}}}>
          <div style={{background:'rgba(18,18,20,0.98)',border:'1px solid rgba(63,63,70,0.6)',boxShadow:'0 0 60px rgba(139,92,246,0.1)',maxHeight:'92vh'}} className="w-full max-w-md rounded-2xl flex flex-col">
            <div style={{borderBottom:'1px solid rgba(63,63,70,0.4)'}} className="flex items-center justify-between px-6 py-4 flex-shrink-0">
              <div><h2 className="font-bold text-white text-sm">{editingProfile?'Editar perfil':'Nuevo Keeper Profile'}</h2><p className="text-zinc-500 text-xs mt-0.5">Define la identidad de tu IA</p></div>
              <div className="flex items-center gap-2"><button onClick={()=>{setShowAIPanel(!showAIPanel);setAiError('')}} style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)'}} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-violet-300 hover:bg-violet-900/20 transition-colors"><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Generar con IA</button><button onClick={()=>{setShowModal(false);setShowAIPanel(false)}} className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            </div>
            <div style={{borderBottom:'1px solid rgba(63,63,70,0.3)'}} className="px-6 py-2.5 flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5"><span className="text-xs text-zinc-600">Completitud del perfil</span><span className={"text-xs font-bold "+(completeness>=80?'text-emerald-400':completeness>=50?'text-amber-400':'text-zinc-500')}>{completeness}%</span></div>
              <div style={{background:'rgba(63,63,70,0.4)',borderRadius:'999px',height:'3px'}}><div style={{background:completeness>=80?'#34d399':completeness>=50?'#fbbf24':'#7c3aed',width:completeness+'%',height:'3px',borderRadius:'999px',transition:'width 0.3s ease'}}/></div>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              {showAIPanel&&(<div style={{background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.25)'}} className="rounded-xl p-4 space-y-3"><p className="text-xs font-semibold text-violet-300">Describe el tipo de perfil que quieres crear</p><textarea style={{background:'rgba(9,9,11,0.8)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-lg px-3 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" placeholder="ej: Chef profesional con 15 anos en cocina italiana" rows={3} value={aiDesc} onChange={e=>setAiDesc(e.target.value)}/>{aiError&&<p className="text-red-400 text-xs">{aiError}</p>}<div className="flex gap-2"><button onClick={handleGenerateProfile} disabled={aiLoading||!aiDesc.trim()} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)'}} className="flex-1 disabled:opacity-40 text-white text-xs font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">{aiLoading?<><span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block"/>Generando...</>:<><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Generar perfil</>}</button><button onClick={()=>{setShowAIPanel(false);setAiDesc('');setAiError('')}} style={{border:'1px solid rgba(63,63,70,0.6)'}} className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors">Cancelar</button></div></div>)}
              <div><p className="text-xs font-semibold text-zinc-400 mb-2">Tipo de perfil</p><div className="grid grid-cols-4 gap-1.5">{PT.map(t=><button key={t.id} onClick={()=>setForm(f=>({...f,profile_type:t.id}))} style={{background:form.profile_type===t.id?'rgba(139,92,246,0.15)':'rgba(39,39,42,0.5)',border:form.profile_type===t.id?'1px solid rgba(139,92,246,0.4)':'1px solid rgba(63,63,70,0.5)'}} className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all"><svg width="11" height="11" fill="none" stroke={form.profile_type===t.id?'#a78bfa':'#52525b'} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={t.icon}/></svg><span className={"text-xs font-semibold leading-tight text-center "+(form.profile_type===t.id?'text-violet-300':'text-zinc-600')}>{t.label}</span></button>)}</div></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nombre *</label><input style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" placeholder="ej: Chef Italiano, CMO SaaS..." value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus/></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Rol y expertise</label><input style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" placeholder="ej: Chef con 15 anos en cocina italiana" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}/></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tono y estilo</label><input style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" placeholder="ej: Directo, apasionado, tecnico" value={form.tone} onChange={e=>setForm(f=>({...f,tone:e.target.value}))}/></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Objetivo principal <span className="text-zinc-600 font-normal">(opcional)</span></label><input style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" placeholder="ej: Crear menus creativos perfectos" value={form.goals} onChange={e=>setForm(f=>({...f,goals:e.target.value}))}/></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Reglas <span className="text-zinc-600 font-normal">(una por linea)</span></label><textarea style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" placeholder="Dar siempre cantidades exactas" rows={3} value={form.rules} onChange={e=>setForm(f=>({...f,rules:e.target.value}))}/></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Limitaciones <span className="text-zinc-600 font-normal">(opcional)</span></label><input style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" placeholder="ej: Solo temas de gastronomia" value={form.limits} onChange={e=>setForm(f=>({...f,limits:e.target.value}))}/></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Contexto extra <span className="text-zinc-600 font-normal">(opcional)</span></label><textarea style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" placeholder="Empresa, audiencia, proyecto..." rows={2} value={form.extra} onChange={e=>setForm(f=>({...f,extra:e.target.value}))}/></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Avatar <span className="text-zinc-600 font-normal">(URL imagen o GIF)</span></label><input type="url" style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" placeholder="https://..." value={form.avatar_url} onChange={e=>setForm(f=>({...f,avatar_url:e.target.value}))}/>{form.avatar_url&&<div className="mt-2 flex items-center gap-2"><img src={form.avatar_url} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-zinc-700" onError={(e:React.SyntheticEvent<HTMLImageElement>)=>{e.currentTarget.style.display='none'}}/><span className="text-zinc-600 text-xs">Vista previa</span></div>}</div>
              <button onClick={()=>setShowAdvanced(!showAdvanced)} style={{border:'1px solid rgba(63,63,70,0.4)'}} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all">
                <div className="flex items-center gap-2"><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg><span className="font-semibold">Campos avanzados</span><span style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}} className="text-violet-400 text-xs px-1.5 py-0.5 rounded">memoria, variables, relaciones</span></div>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{transform:showAdvanced?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {showAdvanced&&(<div className="space-y-4 pt-1"><div style={{background:'rgba(139,92,246,0.04)',border:'1px solid rgba(139,92,246,0.15)'}} className="rounded-xl p-4 space-y-4">
                <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Memoria base <span style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}} className="text-violet-400 text-xs font-normal px-1.5 py-0.5 rounded ml-1">Pro</span></label><textarea style={{background:'rgba(9,9,11,0.8)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" placeholder="Historia, contexto de fondo, lore, arquitectura..." rows={3} value={form.base_memory} onChange={e=>setForm(f=>({...f,base_memory:e.target.value}))}/></div>
                <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Variables dinamicas <span style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}} className="text-violet-400 text-xs font-normal px-1.5 py-0.5 rounded ml-1">Pro</span></label><textarea style={{background:'rgba(9,9,11,0.8)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" placeholder="{{nombre_cliente}} = nombre del cliente activo" rows={2} value={form.dynamic_variables} onChange={e=>setForm(f=>({...f,dynamic_variables:e.target.value}))}/></div>
                <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Patrones de respuesta <span style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}} className="text-violet-400 text-xs font-normal px-1.5 py-0.5 rounded ml-1">Pro</span></label><textarea style={{background:'rgba(9,9,11,0.8)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" placeholder="Siempre empieza con la conclusion. Luego explica..." rows={2} value={form.response_patterns} onChange={e=>setForm(f=>({...f,response_patterns:e.target.value}))}/></div>
                <div><label className="block text-xs font-semibold text-zinc-400 mb-1.5">Relaciones <span style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}} className="text-violet-400 text-xs font-normal px-1.5 py-0.5 rounded ml-1">Pro</span></label><textarea style={{background:'rgba(9,9,11,0.8)',border:'1px solid rgba(63,63,70,0.6)',color:'white'}} className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" placeholder="Trabaja con {{CMO}} en campanas. Reporta a {{CEO}}..." rows={2} value={form.relationships} onChange={e=>setForm(f=>({...f,relationships:e.target.value}))}/></div>
              </div></div>)}
            </div>
            <div style={{borderTop:'1px solid rgba(63,63,70,0.4)'}} className="flex gap-3 px-6 py-4 flex-shrink-0"><button onClick={()=>{setShowModal(false);setShowAIPanel(false)}} style={{border:'1px solid rgba(63,63,70,0.6)'}} className="flex-1 text-zinc-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors">Cancelar</button><button onClick={handleSave} disabled={!form.name.trim()||saving} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 15px rgba(139,92,246,0.25)'}} className="flex-1 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40">{saving?'Guardando...':editingProfile?'Guardar cambios':'Crear perfil'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
function KeeperSandbox({profile,onClose}:{profile:KeeperProfile;onClose:()=>void}){
  const [messages,setMessages]=useState<Array<{role:'user'|'assistant';content:string}>>([{role:'assistant',content:'Sandbox activo. Soy '+profile.name+(profile.role?'. Rol: '+profile.role+'.':'')+' Cualquier mensaje que me envies sera respondido exactamente como defina mi identidad. Empieza cuando quieras.'}])
  const [input,setInput]=useState('')
  const [loading,setLoading]=useState(false)
  const [mode,setMode]=useState<'chat'|'test'>('chat')
  const [testQ,setTestQ]=useState('')
  const sp=[profile.name&&'Nombre: '+profile.name,profile.role&&'Rol: '+profile.role,profile.tone&&'Tono: '+profile.tone,profile.goals&&'Objetivo: '+profile.goals,(profile.rules?.length)&&'Reglas: '+profile.rules.join(' | '),profile.limits&&'Limites: '+profile.limits,profile.base_memory&&'Memoria de fondo: '+profile.base_memory,profile.response_patterns&&'Patrones: '+profile.response_patterns,profile.relationships&&'Relaciones: '+profile.relationships,profile.extra&&'Contexto: '+profile.extra].filter(Boolean).join('\n')

  // Persist conversation to localStorage by profile id
  useEffect(()=>{
    const key='ck_sandbox_'+profile.id
    const saved=localStorage.getItem(key)
    if(saved){try{const parsed=JSON.parse(saved);if(Array.isArray(parsed)&&parsed.length>1)setMessages(parsed)}catch(_e){}}
  },[profile.id])
  useEffect(()=>{
    const key='ck_sandbox_'+profile.id
    localStorage.setItem(key,JSON.stringify(messages))
  },[messages,profile.id])
    const send=async(msg?:string)=>{
    const userMsg=(msg||input).trim();if(!userMsg||loading)return;setInput('');setMessages(prev=>[...prev,{role:'user',content:userMsg}]);setLoading(true)
    try{const res=await fetch('/api/chat-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg,systemPrompt:sp,history:messages.slice(-8)})});const data=await res.json();setMessages(prev=>[...prev,{role:'assistant',content:data.reply||data.error||'Error'}])}catch(_e){setMessages(prev=>[...prev,{role:'assistant',content:'Error de conexion'}])}
    setLoading(false)
  }
  const TEST_PROMPTS=['Describe quien eres en una sola oracion','Dame un ejemplo de como responderas a una pregunta tipica','Cual es lo que NUNCA harias?','Actua como si alguien te desafiara fuera de tu rol']
  return(
    <div style={{background:'rgba(18,18,20,0.95)',border:'1px solid rgba(16,185,129,0.25)',boxShadow:'0 0 30px rgba(16,185,129,0.04)'}} className="rounded-2xl overflow-hidden">
      <div style={{background:'rgba(16,185,129,0.04)',borderBottom:'1px solid rgba(16,185,129,0.15)'}} className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {profile.avatar_url?<img src={profile.avatar_url} alt={profile.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-700"/>:<div style={{boxShadow:'0 0 12px rgba(16,185,129,0.15)'}} className={"w-9 h-9 rounded-xl bg-gradient-to-br "+gc(profile.name)+" flex items-center justify-center text-white font-bold text-sm"}>{profile.name[0].toUpperCase()}</div>}
          <div>
            <div className="flex items-center gap-2"><p className="text-sm font-bold text-white">{profile.name}</p><div style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)'}} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/><span className="text-emerald-400 text-xs font-bold">SANDBOX</span></div></div>
            {profile.role&&<p className="text-xs text-zinc-500 line-clamp-1">{profile.role}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div style={{background:'rgba(39,39,42,0.8)',border:'1px solid rgba(63,63,70,0.5)'}} className="flex rounded-lg overflow-hidden">
            <button onClick={()=>setMode('chat')} style={{background:mode==='chat'?'rgba(16,185,129,0.15)':'transparent',color:mode==='chat'?'#34d399':'#52525b'}} className="text-xs px-3 py-1.5 font-semibold transition-all">Chat libre</button>
            <button onClick={()=>setMode('test')} style={{background:mode==='test'?'rgba(139,92,246,0.15)':'transparent',color:mode==='test'?'#a78bfa':'#52525b'}} className="text-xs px-3 py-1.5 font-semibold transition-all">Pruebas</button>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-600 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
      </div>
      {mode==='test'&&(
        <div style={{background:'rgba(139,92,246,0.04)',borderBottom:'1px solid rgba(63,63,70,0.4)'}} className="px-4 py-3">
          <p className="text-xs text-zinc-500 mb-2 font-semibold">Preguntas de prueba rapidas</p>
          <div className="flex flex-wrap gap-2">{TEST_PROMPTS.map((q,i)=><button key={i} onClick={()=>send(q)} style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.5)'}} className="text-xs text-zinc-400 px-2.5 py-1.5 rounded-lg hover:border-violet-500/40 hover:text-violet-300 transition-colors">{q}</button>)}</div>
        </div>
      )}
      <div className="h-72 overflow-y-auto p-4 space-y-3">
        {messages.map((msg,i)=><div key={i} className={"flex "+(msg.role==='user'?'justify-end':'justify-start')}><div style={msg.role==='assistant'?{background:'rgba(39,39,42,0.8)',border:'1px solid rgba(63,63,70,0.5)',maxWidth:'80%'}:{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',maxWidth:'80%'}} className={"px-3 py-2.5 rounded-xl text-sm leading-relaxed "+(msg.role==='user'?'text-white':'text-zinc-100')}>{msg.content}</div></div>)}
        {loading&&<div className="flex justify-start"><div style={{background:'rgba(39,39,42,0.8)',border:'1px solid rgba(63,63,70,0.5)'}} className="px-3 py-2.5 rounded-xl"><div className="flex gap-1 items-center">{[0,150,300].map(d=><div key={d} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:d+'ms'}}/>)}</div></div></div>}
      </div>
      <div style={{borderTop:'1px solid rgba(63,63,70,0.4)'}} className="p-3 flex gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} placeholder={'Escribe a '+profile.name+'...'} disabled={loading} style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.5)',color:'white'}} className="flex-1 px-3 py-2 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"/>
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{background:'linear-gradient(135deg,#059669,#047857)'}} className="px-4 py-2 disabled:opacity-40 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></button>
      </div>
    </div>
  )
}

function ProfileChat({profile,onClose}:{profile:KeeperProfile;onClose:()=>void}){
  const [messages,setMessages]=useState<Array<{role:'user'|'assistant';content:string}>>([{role:'assistant',content:'Hola! Soy '+profile.name+'. '+(profile.role?'Mi rol es: '+profile.role+'. ':'')+' En que te ayudo?'}])
  const [input,setInput]=useState('')
  const [loading,setLoading]=useState(false)
  const send=async()=>{
    if(!input.trim()||loading)return;const userMsg=input.trim();setInput('');setMessages(prev=>[...prev,{role:'user',content:userMsg}]);setLoading(true)
    try{const sp=[profile.name&&'Nombre: '+profile.name,profile.role&&'Rol: '+profile.role,profile.tone&&'Tono: '+profile.tone,profile.goals&&'Objetivo: '+profile.goals,(profile.rules?.length)&&'Reglas: '+profile.rules.join(', '),profile.limits&&'Limites: '+profile.limits,profile.base_memory&&'Memoria: '+profile.base_memory,profile.extra&&'Contexto: '+profile.extra].filter(Boolean).join('\n');const res=await fetch('/api/chat-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg,systemPrompt:sp,history:messages.slice(-6)})});const data=await res.json();setMessages(prev=>[...prev,{role:'assistant',content:data.reply||data.error||'Error'}])}catch(_e){setMessages(prev=>[...prev,{role:'assistant',content:'Error de conexion'}])}
    setLoading(false)
  }
  return(
    <div style={{background:'rgba(24,24,27,0.9)',border:'1px solid rgba(63,63,70,0.5)'}} className="rounded-2xl overflow-hidden">
      <div style={{background:'rgba(39,39,42,0.4)',borderBottom:'1px solid rgba(63,63,70,0.4)'}} className="flex items-center gap-3 px-4 py-3">
        {profile.avatar_url?<img src={profile.avatar_url} alt={profile.name} className="w-8 h-8 rounded-xl object-cover border border-zinc-700"/>:<div style={{boxShadow:'0 0 12px rgba(139,92,246,0.15)'}} className={"w-8 h-8 rounded-xl bg-gradient-to-br "+gc(profile.name)+" flex items-center justify-center text-white font-bold text-xs"}>{profile.name[0].toUpperCase()}</div>}
        <div><p className="text-sm font-semibold text-white">{profile.name}</p>{profile.role&&<p className="text-xs text-zinc-500 line-clamp-1">{profile.role}</p>}</div>
        <div className="ml-auto flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/><span className="text-xs text-zinc-600">activo</span><button onClick={onClose} className="p-1 text-zinc-600 hover:text-white transition-colors ml-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
      </div>
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((msg,i)=><div key={i} className={"flex "+(msg.role==='user'?'justify-end':'justify-start')}><div style={msg.role==='assistant'?{background:'rgba(39,39,42,0.8)',border:'1px solid rgba(63,63,70,0.5)'}:{background:'linear-gradient(135deg,#7c3aed,#6d28d9)'}} className={"max-w-xs px-3 py-2 rounded-xl text-sm "+(msg.role==='user'?'text-white':'text-zinc-200')}>{msg.content}</div></div>)}
        {loading&&<div className="flex justify-start"><div style={{background:'rgba(39,39,42,0.8)',border:'1px solid rgba(63,63,70,0.5)'}} className="px-3 py-2 rounded-xl"><div className="flex gap-1">{[0,150,300].map(d=><div key={d} className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{animationDelay:d+'ms'}}/>)}</div></div></div>}
      </div>
      <div style={{borderTop:'1px solid rgba(63,63,70,0.4)'}} className="p-3 flex gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} placeholder={'Escribele a '+profile.name+'...'} disabled={loading} style={{background:'rgba(39,39,42,0.6)',border:'1px solid rgba(63,63,70,0.5)',color:'white'}} className="flex-1 px-3 py-2 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"/>
        <button onClick={send} disabled={!input.trim()||loading} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)'}} className="px-4 py-2 disabled:opacity-40 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></button>
      </div>
    </div>
  )
}