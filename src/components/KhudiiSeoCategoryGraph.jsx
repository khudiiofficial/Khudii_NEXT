'use client';
import {useMemo} from 'react';
import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts';
import {evaluateSeo} from '@/components/KhudiiSeoWorkspace';
const series=[
 {id:'traditional',label:'Traditional SEO',color:'#1d4ed8'},
 {id:'alt',label:'Alt Texts',color:'#0d9488'},
 {id:'geo',label:'GEO (Generative AI)',color:'#d97706'},
 {id:'aeo',label:'AEO (Voice & Answer)',color:'#7c3aed'},
 {id:'schema',label:'JSON-LD Schema',color:'#db2777'},
 {id:'technical',label:'Technical SEO',color:'#64748b'},
 {id:'validation',label:'Validation & Score',color:'#15803d'},
];
export default function KhudiiSeoCategoryGraph({entities=[]}){
 const graph=useMemo(()=>['pages','organizations','blogs','stories','podcasts','categories'].map(type=>{const items=entities.filter(e=>e.type===type);const row={label:type==='stories'?'Success Stories':type.charAt(0).toUpperCase()+type.slice(1)};
  series.forEach(s=>{row[s.id]=items.length?Math.round(items.reduce((total,item)=>total+(s.id==='validation'?Number(item.score||0):Number(evaluateSeo(item).find(c=>c.id===s.id)?.score||0)),0)/items.length):null});return row}),[entities]);
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">SEO intelligence across Khudii content</h2><p className="mb-5 mt-1 text-xs text-slate-500">Each line represents the share of configured checks for a category, grouped by content type. Missing advanced fields count as incomplete. This does not represent search rankings.</p><div className="h-[350px] min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={graph} margin={{top:10,right:20,left:-20,bottom:15}}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="label" tick={{fontSize:11}}/><YAxis domain={[0,100]} unit="%" tick={{fontSize:11}}/><Tooltip formatter={value=>value===null?'No records':`${value}%`}/><Legend verticalAlign="bottom" wrapperStyle={{fontSize:11}}/>{series.map(s=><Line key={s.id} type="monotone" dataKey={s.id} name={s.label} stroke={s.color} strokeWidth={2} dot={{r:4}} connectNulls={false} isAnimationActive={false}/>)}</LineChart></ResponsiveContainer></div></section>
}
