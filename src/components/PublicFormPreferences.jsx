'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const formKey = (pathname) => {
  if(pathname === '/contact')return 'contact';
  if(pathname === '/donate-now')return 'donate';
  if(pathname === '/volunteer')return 'volunteer';
  if(pathname === '/jobs')return 'jobs';
  if(pathname === '/contribute-your-story')return 'story';
  if(pathname === '/organization/registration')return 'organization';
  if(/^\/organization\/[^/]+/.test(pathname))return 'inquiry';
  return null;
};

/** Applies only explicit CMS overrides, leaving every original form unchanged otherwise. */
export default function PublicFormPreferences(){
  const pathname=usePathname();
  useEffect(()=>{
    const kind=formKey(pathname);
    if(!kind)return;
    let active=true,observer;
    const controller=new AbortController();
    const apply=(fields)=>{
      const root=document.querySelector('main#main-content');
      if(!root)return;
      const elements=Array.from(root.querySelectorAll('form input, form select, form textarea'));
      Object.entries(fields).forEach(([name,cfg])=>{
        if(!cfg||typeof cfg!=='object')return;
        const el=elements.find(x=>x.name===name||x.id===name);
        if(!el)return;
        // The field can have a nearby explicit label or an associated label for=id.
        const label=el.labels?.[0]|| (el.id?Array.from(root.querySelectorAll('label')).find(x=>x.htmlFor===el.id):null);
        if(cfg.label && label){const caption=label.querySelector('[data-cms-caption]')||label;
          if(!caption.dataset.cmsOriginalLabel)caption.dataset.cmsOriginalLabel=caption.textContent||'';
          if(!caption.querySelector('input,select,textarea'))caption.textContent=String(cfg.label).slice(0,180);
        }
        if(cfg.placeholder && el.getAttribute('placeholder')!==cfg.placeholder)el.setAttribute('placeholder',String(cfg.placeholder).slice(0,250));
        if(typeof cfg.required==='boolean' && el.required!==cfg.required)el.required=cfg.required;
        if(cfg.visible===false){el.style.display='none';if(label)label.style.display='none';el.setAttribute('aria-hidden','true');el.disabled=true;}
        else if(cfg.visible===true){if(el.style.display==='none')el.style.removeProperty('display');if(label?.style.display==='none')label.style.removeProperty('display');el.removeAttribute('aria-hidden');el.disabled=false;}
      });
    };
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/cms/public-settings`,{signal:controller.signal}).then(r=>r.ok?r.json():null).then(cfg=>{
      if(!active)return;
      const fields=cfg?.forms?.[kind]?.fields;
      if(!fields||typeof fields!=='object')return;
      apply(fields);
      const root=document.querySelector('main#main-content');
      if(root){observer=new MutationObserver(()=>apply(fields));observer.observe(root,{childList:true,subtree:true});}
    }).catch(()=>{});
    return()=>{active=false;controller.abort();observer?.disconnect();};
  },[pathname]);
  return null;
}
