import { KHUDII_FORMS, KHUDII_FORM_KEYS } from '../lib/khudii-form-catalog.js';
const emailPattern=/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
export const parseRecipients = input => String(input||'').split(/[;,]/).map(x=>x.trim().toLowerCase()).filter(Boolean);
export function validateFormSettings(input){
  if (!input || typeof input!=='object' || Array.isArray(input)) throw Error('Forms settings must be an object');
  const doc = {};
  for(const form of KHUDII_FORMS){
    const raw = input[form.key] || {};
    if(typeof raw!=='object' || Array.isArray(raw)) throw Error(`Invalid ${form.key} form settings`);
    const fields = {};
    for(const field of form.fields){
      const value = raw.fields?.[field];
      if(value===undefined)continue;
      if(!value || typeof value!=='object' || Array.isArray(value))throw Error(`Invalid ${form.key}.${field}`);
      const label=String(value.label||'').trim(), placeholder=String(value.placeholder||'').trim();
      if(label.length>180 || placeholder.length>250)throw Error(`Field text too long in ${form.key}.${field}`);
      fields[field]={label,placeholder,visible:value.visible!==false,required:value.required===true};
    }
    doc[form.key]={fields,admin_note:String(raw.admin_note||'').slice(0,2000),enabled:raw.enabled!==false,title:String(raw.title||form.name).trim().slice(0,180)};
  }
  const cfg=input.emailConfigs||{};
  if(typeof cfg!=='object'||Array.isArray(cfg))throw Error('Invalid email configuration');
  const rules=cfg.formRoutingRules||[];
  if(!Array.isArray(rules)||rules.length>35)throw Error('Maximum 35 email routing rules allowed');
  const seen=new Set(), ruleIds=new Set();
  const formRoutingRules=rules.map((rule,index)=>{
    if(!rule||typeof rule!=='object')throw Error('Invalid routing rule');
    const id=String(rule.id||`rule_${index+1}`);
    if(!/^[a-zA-Z0-9_-]{1,64}$/.test(id)||ruleIds.has(id))throw Error('Invalid or duplicate routing rule ID');
    ruleIds.add(id);
    if(!Array.isArray(rule.forms)||rule.forms.length===0)throw Error(`Select at least one form in ${id}`);
    const forms=[...new Set(rule.forms)];
    for(const key of forms){
      if(!KHUDII_FORM_KEYS.includes(key))throw Error(`Unknown form ${key}`);
      if(seen.has(key))throw Error(`Form ${key} belongs to multiple email routing rules`);
      seen.add(key);
    }
    const groups={};const recipients=new Set();
    for(const channel of ['sendTo','cc','bcc']){
      const values=parseRecipients(rule[channel]);
      if(values.length>15 || values.some(v=>v.length>254||!emailPattern.test(v)))throw Error(`Invalid ${channel} address in ${id}`);
      groups[channel]=values.filter(v=>{if(recipients.has(v))return false;recipients.add(v);return true;}).join(', ');
    }
    if(!groups.sendTo)throw Error(`Primary recipient required for ${id}`);
    return {id,forms, ...groups};
  });
  const emailTemplate=input.emailTemplate||{};
  if(typeof emailTemplate!=='object'||Array.isArray(emailTemplate))throw Error('Invalid email template');
  const perForm={};
  for(const form of KHUDII_FORM_KEYS){
    const item=emailTemplate.perForm?.[form]||{};
    if(typeof item!=='object'||Array.isArray(item))throw Error(`Invalid template for ${form}`);
    const subject=String(item.subject||''),intro=String(item.intro||'');
    if(subject.length>255||intro.length>4000)throw Error(`Template too long for ${form}`);
    perForm[form]={subject,intro};
  }
  doc.emailConfigs={formRoutingRules};
  doc.emailTemplate={heading:String(emailTemplate.heading||'New Khudii submission').slice(0,180),footer:String(emailTemplate.footer||'Khudii Welfare Organization').slice(0,500),accent:'#2563eb',perForm};
  return doc;
}
