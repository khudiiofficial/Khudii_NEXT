'use client';
import {useMemo, useState} from 'react';
import {ImagePlus, Plus, Trash2, Code2, Layers} from 'lucide-react';
const field='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100';
const itemKinds=['cards','faq','gallery','logos','people','stats','steps','timeline','video-grid','downloads','social-links'];
export default function KhudiiSectionFields({value,sectionType,onChange}) {
  const [advanced,setAdvanced]=useState(false);
  const source=useMemo(()=>{if(typeof value==='string'){try{return JSON.parse(value)}catch{return null}}return value&&typeof value==='object'?value:{}},[value]);
  const data=source?.data&&typeof source.data==='object'?source.data:source||{};
  const update=(key,next)=>onChange({...source,data:{...data,[key]:next}});
  const updateItem=(index,key,next)=>{const items=[...(Array.isArray(data.items)?data.items:[])];items[index]={...items[index],[key]:next};update('items',items)};
  const renderField=(label,name,rows)=><label className="space-y-1.5"><span className="text-xs font-semibold text-slate-700">{label}</span>{rows?<textarea value={data[name]||''} rows={rows} onChange={e=>update(name,e.target.value)} className={field}/>:<input value={data[name]||''} onChange={e=>update(name,e.target.value)} className={field}/>}</label>;
  return <div className="space-y-4 md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
    <div><h3 className="flex items-center gap-2 text-sm font-extrabold text-[#02236E]"><Layers size={17} className="text-[#02236E]"/>Visual section content editor</h3><p className="mt-1 text-xs text-slate-500">These fields update the content displayed by this section. Use Advanced JSON only for fields the visual editor does not cover.</p></div>
    {!source?<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">The current section contains invalid JSON. Repair it under Advanced JSON before editing fields.</div>:
    <div className="grid gap-4 sm:grid-cols-2">
      {renderField('Heading','heading')}{renderField('Eyebrow / subtitle','subheading')}
      <div className="sm:col-span-2">{renderField('Description / paragraph','body',4)}</div>
      {sectionType!=='divider'&&<>{renderField('Image URL from Media Library','image')}{renderField('Image alt text','imageAlt')}{renderField('Button label','buttonText')}{renderField('Button URL','buttonUrl')}</>}
      {itemKinds.includes(sectionType)&&<div className="space-y-3 sm:col-span-2"><div className="flex items-center justify-between"><h4 className="text-sm font-bold">{sectionType==='faq'?'Questions and answers':'Repeatable section items'}</h4><button type="button" onClick={()=>update('items',[...(Array.isArray(data.items)?data.items:[]),{title:'',description:'',image:'',url:'',imageAlt:''}])} className="inline-flex items-center gap-1 rounded-lg bg-[#02236E] px-3 py-2 text-xs font-semibold text-white"><Plus size={14}/>Add item</button></div>
        {(Array.isArray(data.items)?data.items:[]).map((item,index)=><div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2"><label className="text-xs font-semibold">{sectionType==='faq'?'Question':'Title'}<input value={item.title||''} onChange={e=>updateItem(index,'title',e.target.value)} className={field}/></label><label className="text-xs font-semibold">{sectionType==='faq'?'Answer':'Description'}<textarea rows={2} value={item.description||''} onChange={e=>updateItem(index,'description',e.target.value)} className={field}/></label>{sectionType!=='faq'&&<><label className="text-xs font-semibold">Image URL<input value={item.image||''} onChange={e=>updateItem(index,'image',e.target.value)} className={field}/></label><label className="text-xs font-semibold">Link URL<input value={item.url||''} onChange={e=>updateItem(index,'url',e.target.value)} className={field}/></label></>}<button type="button" onClick={()=>update('items',data.items.filter((_,i)=>i!==index))} className="inline-flex items-center gap-1 text-xs font-semibold text-red-700"><Trash2 size={14}/>Remove item</button></div>)}
      </div>}
    </div>}
    <details open={advanced} onToggle={e=>setAdvanced(e.currentTarget.open)} className="rounded-xl border border-slate-200 bg-white p-3"><summary className="flex cursor-pointer items-center gap-2 text-xs font-bold"><Code2 size={15}/>Advanced JSON</summary><p className="mt-2 text-xs text-slate-500">Only use this for advanced data fields. Invalid JSON cannot be saved.</p><textarea spellCheck={false} rows={7} value={typeof value==='string'?value:JSON.stringify(value||{},null,2)} onChange={e=>onChange(e.target.value)} className={`${field} mt-2 font-mono text-xs`}/></details>
  </div>;
}
