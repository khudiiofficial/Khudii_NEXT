'use client';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmDialog, alertNotice } from '@/lib/dialogs';
import { ReloadButton } from '@/components/ui/AppButton';
import KhudiiFormsManagement from '@/components/KhudiiFormsManagement';
import SettingsSiteChrome from '@/components/SettingsSiteChrome';
import KhudiiDatabaseSettings from '@/components/KhudiiDatabaseSettings';
import KhudiiSeoIndexingSettings from '@/components/KhudiiSeoIndexingSettings';
import CmsV2RoleManager from '@/components/CmsV2RoleManager';
import UserManagementTab from '@/components/admin/UserManagementTab';
import LoginAuthTab from '@/components/admin/LoginAuthTab';
import {
  Settings, Globe, Mail, Shield, User, Palette, Search, Eye, EyeOff, Database,
  ChevronRight, Check, AlertCircle, RefreshCw, Save, Loader2,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   SETTINGS PAGE — Khudii Admin Panel
   Tabs & sub-tabs matching king-travel-can-nxt
   CRUD: Owner profile, SMTP, SEO, appearance
 ───────────────────────────────────────────── */

// ──── Tab definitions ────────────────────────
const TABS = [
  { id: 'site', label: 'Header & Footer', icon: Palette },
  { id: 'seo', label: 'SEO Intelligence', icon: Search },
  { id: 'identity', label: 'Site Identity', icon: Globe },
  { id: 'share', label: 'Share Tools', icon: ChevronRight },
  { id: 'users', label: 'Users', icon: User },
  { id: 'auth', label: 'Login Auth', icon: Shield },
  { id: 'popup', label: 'Disclaimer Popup', icon: AlertCircle },
  { id: 'css', label: 'Global CSS', icon: Palette },
  { id: 'forms', label: 'Forms', icon: Settings },
  { id: 'email', label: 'Email / SMTP', icon: Mail },
  { id: 'db', label: 'DB', icon: Database },
];
const OLD_TABS = { general: 'identity', appearance: 'site', 'header-footer': 'site', account: 'users', security: 'auth', header: 'site', footer: 'site' };

// ──── Shared UI primitives ────────────────────
function Field({ label, id, required, children, hint }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Input({ id, type = 'text', ...props }) {
  return (
    <input
      id={id}
      type={type}
      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#02236E] shadow-sm focus:border-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#02236E]/20 disabled:bg-slate-50 disabled:text-slate-400"
      {...props}
    />
  );
}

function Textarea({ id, rows = 4, ...props }) {
  return (
    <textarea
      id={id}
      rows={rows}
      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#02236E] shadow-sm resize-y focus:border-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#02236E]/20"
      {...props}
    />
  );
}

function Select({ id, options, ...props }) {
  return (
    <select
      id={id}
      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#02236E] shadow-sm focus:border-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#02236E]/20"
      {...props}
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function Toggle({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
      <div className="relative">
        <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`h-6 w-11 rounded-full transition-colors ${checked ? 'bg-[#02236E]' : 'bg-slate-200'}`} />
        <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
    </label>
  );
}

function SaveBar({ saving, saved, error, onSave, dirty }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${error ? 'border-red-200 bg-red-50' : saved ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 text-sm">
        {error && <><AlertCircle size={16} className="text-red-500" /><span className="text-red-700">{error}</span></>}
        {saved && !error && <><Check size={16} className="text-emerald-600" /><span className="text-emerald-700 font-semibold">Settings saved.</span></>}
        {!saved && !error && dirty && <span className="text-slate-500">You have unsaved changes.</span>}
        {!saved && !error && !dirty && <span className="text-slate-400">No changes.</span>}
      </div>
      <button
        onClick={onSave}
        disabled={saving || !dirty}
        className="flex items-center gap-2 rounded-xl bg-[#02236E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#02236E]/90 disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save changes
      </button>
    </div>
  );
}

// ──── Sub-tab navigation ─────────────────────
function getSub(fallback) {
  if (typeof window === 'undefined') return fallback;
  return new URLSearchParams(window.location.search).get('sub') || fallback;
}
const confirmAction = (title, text = '') => confirmDialog({ title, text, status: 'warning' });
const settingsNotice = (title, icon = 'success', text = '') =>
  alertNotice({
    title,
    text,
    status: icon === 'error' ? 'error' : icon === 'warning' ? 'warning' : 'success',
  });
function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => { const guard = new Event('khudii:settings-change', { cancelable: true }); if (!window.dispatchEvent(guard)) return; onChange(t.id); if (typeof window !== 'undefined') { const u = new URL(window.location.href); u.searchParams.set('sub', t.id); window.history.replaceState(window.history.state, '', u.pathname + u.search); } }}
          className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${active === t.id ? 'bg-[#02236E]/10 text-[#02236E]' : 'text-slate-500 hover:text-[#02236E] hover:bg-slate-50'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ──── Section container ──────────────────────
function Section({ title, description, children }) {
  return (
    <section className="space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-[#02236E]">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

// ──── General tab ────────────────────────────
function GeneralTab({ profile, setProfile }) {
  const [sub, setSub] = useState(() => getSub('organisation'));
  const update = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  return (
    <>
      <SubTabs
        tabs={[
          { id: 'organisation', label: 'Organisation Info' },
          { id: 'contact', label: 'Contact Details' },
          { id: 'social', label: 'Social Media' },
        ]}
        active={sub} onChange={setSub}
      />
      {sub === 'organisation' && (
        <Section title="Organisation Information" description="Core information displayed across the Khudii platform.">
          <Field label="Organisation Name" id="g-name" required>
            <Input id="g-name" value={profile.name || ''} onChange={update('name')} placeholder="Khudii" />
          </Field>
          <Field label="Tagline" id="g-tagline">
            <Input id="g-tagline" value={profile.tagline || ''} onChange={update('tagline')} placeholder="Connecting hearts, creating change" />
          </Field>
          <Field label="Primary Email" id="g-email" required>
            <Input id="g-email" type="email" value={profile.email || ''} onChange={update('email')} />
          </Field>
          <Field label="Sender Display Email" id="g-sender" required hint="Address shown in outgoing emails">
            <Input id="g-sender" type="email" value={profile.sender_email || ''} onChange={update('sender_email')} />
          </Field>
          <Field label="Country" id="g-country">
            <Input id="g-country" value={profile.country || ''} onChange={update('country')} placeholder="Pakistan" />
          </Field>
          <Field label="Timezone" id="g-tz">
            <Select id="g-tz" value={profile.timezone || 'UTC'} onChange={update('timezone')} options={[['UTC', 'UTC'], ['America/Toronto', 'America/Toronto'], ['Europe/London', 'Europe/London'], ['Asia/Karachi', 'Asia/Karachi'], ['Asia/Kolkata', 'Asia/Kolkata']]} />
          </Field>
        </Section>
      )}
      {sub === 'contact' && (
        <Section title="Contact Details" description="Public-facing contact information.">
          <Field label="Phone Number" id="g-phone">
            <Input id="g-phone" type="tel" value={profile.phone || ''} onChange={update('phone')} />
          </Field>
          <Field label="WhatsApp" id="g-whatsapp">
            <Input id="g-whatsapp" type="tel" value={profile.whatsapp || ''} onChange={update('whatsapp')} />
          </Field>
          <Field label="Support Email" id="g-support">
            <Input id="g-support" type="email" value={profile.support_email || ''} onChange={update('support_email')} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Physical Address" id="g-addr">
              <Textarea id="g-addr" rows={2} value={profile.address || ''} onChange={update('address')} />
            </Field>
          </div>
        </Section>
      )}
      {sub === 'social' && (
        <Section title="Social Media Links" description="Links shown in the footer and contact sections.">
          {[['Facebook', 'facebook_url'], ['Instagram', 'instagram_url'], ['Twitter / X', 'twitter_url'], ['LinkedIn', 'linkedin_url'], ['YouTube', 'youtube_url'], ['TikTok', 'tiktok_url'], ['WhatsApp link', 'whatsapp_url']].map(([lbl, key]) => (
            <Field key={key} label={lbl} id={`social-${key}`}>
              <Input id={`social-${key}`} type="url" value={profile[key] || ''} onChange={update(key)} placeholder="https://" />
            </Field>
          ))}
        </Section>
      )}
    </>
  );
}

// ──── Email / SMTP tab ───────────────────────
function EmailTab({ smtp, setSmtp }) {
  const [sub, setSub] = useState(() => getSub('smtp'));
  const [showPass, setShowPass] = useState(false);
  const upd = (key) => (e) => setSmtp((s) => ({ ...s, [key]: e.target.value }));
  return (
    <>
      <SubTabs
        tabs={[
          { id: 'smtp', label: 'SMTP Server' },
          { id: 'notifications', label: 'Notification Settings' },
          { id: 'templates', label: 'Email Templates' },
        ]}
        active={sub} onChange={setSub}
      />
      {sub === 'smtp' && (
        <Section title="SMTP Server Configuration" description="Outgoing mail server settings for transactional emails.">
          <Field label="SMTP Host" id="smtp-host" required>
            <Input id="smtp-host" value={smtp.smtp_host || ''} onChange={upd('smtp_host')} placeholder="smtp.hostinger.com" />
          </Field>
          <Field label="SMTP Port" id="smtp-port" required hint="465 for SSL, 587 for TLS">
            <Input id="smtp-port" type="number" value={smtp.smtp_port || ''} onChange={upd('smtp_port')} />
          </Field>
          <Field label="Encryption" id="smtp-secure">
            <Select id="smtp-secure" value={smtp.smtp_secure || '1'} onChange={upd('smtp_secure')} options={[['1', 'SSL (Port 465)'], ['0', 'TLS (Port 587)'], ['none', 'None']]} />
          </Field>
          <Field label="SMTP Username" id="smtp-user" required>
            <Input id="smtp-user" value={smtp.smtp_username || ''} onChange={upd('smtp_username')} />
          </Field>
          <Field label="SMTP Password" id="smtp-pass" required>
            <div className="relative">
              <Input id="smtp-pass" type={showPass ? 'text' : 'password'} value={smtp.smtp_password || ''} onChange={upd('smtp_password')} />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="From Address" id="smtp-from" hint="Displayed in the From: field">
            <Input id="smtp-from" type="email" value={smtp.smtp_from || ''} onChange={upd('smtp_from')} />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Toggle
              id="smtp-enabled"
              checked={smtp.smtp_enabled !== false}
              onChange={(e) => setSmtp((s) => ({ ...s, smtp_enabled: e.target.checked }))}
              label="SMTP mail sending enabled"
            />
          </div>
        </Section>
      )}
      {sub === 'notifications' && (
        <Section title="Notification Preferences" description="Choose which events trigger admin email notifications.">
          {[
            ['Notify on new contact message', 'notify_contact'],
            ['Notify on new inquiry', 'notify_inquiry'],
            ['Notify on new donation', 'notify_donation'],
            ['Notify on volunteer sign-up', 'notify_volunteer'],
            ['Notify on new org registration', 'notify_org'],
            ['Notify on new blog submission', 'notify_blog'],
            ['Notify on job application', 'notify_job'],
            ['Notify on contributed story', 'notify_story'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <Toggle id={key} checked={smtp[key] !== false} onChange={(e) => setSmtp((s) => ({ ...s, [key]: e.target.checked }))} />
            </div>
          ))}
        </Section>
      )}
      {sub === 'templates' && (
        <div className="space-y-5"><p className="text-sm text-slate-500">Use plain-text email template text. Supported placeholders: {'{name}'}, {'{email}'}, {'{subject}'}, {'{message}'}. Unspecified fields keep the default Khudii email format.</p>
          {['contact', 'inquiry', 'donation', 'volunteer', 'org', 'blog', 'job', 'story'].map(key => <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"><h3 className="font-bold capitalize">{key} notification</h3><Field id={`template-${key}-subject`} label="Subject template"><Input id={`template-${key}-subject`} value={smtp.templates?.[key]?.subject || ''} onChange={e => setSmtp(s => ({ ...s, templates: { ...s.templates, [key]: { ...s.templates?.[key], subject: e.target.value } } }))} /></Field><Field id={`template-${key}-body`} label="Additional email message"><Textarea id={`template-${key}-body`} rows={3} value={smtp.templates?.[key]?.body || ''} onChange={e => setSmtp(s => ({ ...s, templates: { ...s.templates, [key]: { ...s.templates?.[key], body: e.target.value } } }))} /></Field></div>)}
        </div>
      )}
    </>
  );
}

// ──── Appearance tab ─────────────────────────
function AppearanceTab({ appearance, setAppearance, onSiteDirty }) {
  const [sub, setSub] = useState(() => getSub('header'));
  const upd = (key) => (e) => setAppearance((a) => ({ ...a, [key]: e.target.value }));
  return (
    <>
      <SubTabs
        tabs={[
          { id: 'header', label: 'Header' },
          { id: 'footer', label: 'Footer' },
          { id: 'branding', label: 'Branding' },
          { id: 'colors', label: 'Colors' },
          { id: 'layout', label: 'Layout' },
          { id: 'navigation', label: 'Navigation' },
        ]}
        active={sub} onChange={setSub}
      />
      {(sub === 'header' || sub === 'footer') && <SettingsSiteChrome mode={sub} onDirty={onSiteDirty} />}
      {sub === 'branding' && (
        <Section title="Branding & Identity" description="Logo, favicon, and brand marks used throughout Khudii.">
          <Field label="Logo URL" id="logo-url" hint="Absolute URL or /uploads path">
            <Input id="logo-url" type="url" value={appearance.logo_url || ''} onChange={upd('logo_url')} placeholder="/khudiilogo.png" />
          </Field>
          <Field label="Favicon URL" id="favicon-url">
            <Input id="favicon-url" type="url" value={appearance.favicon_url || ''} onChange={upd('favicon_url')} placeholder="/siteicon.png" />
          </Field>
          <Field label="Organisation Name Display" id="display-name">
            <Input id="display-name" value={appearance.display_name || ''} onChange={upd('display_name')} placeholder="Khudii" />
          </Field>
        </Section>
      )}
      {sub === 'colors' && (
        <Section title="Brand Colours" description="Accent colours used in buttons, links, and highlights.">
          {[
            ['Primary Colour', 'primary_color', '#2563eb'],
            ['Accent Colour', 'accent_color', '#2563eb'],
            ['Danger Colour', 'danger_color', '#dc2626'],
          ].map(([label, key, def]) => (
            <Field key={key} label={label} id={key}>
              <div className="flex items-center gap-2">
                <input type="color" id={key} value={appearance[key] || def} onChange={upd(key)} className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 p-1" />
                <Input id={`${key}-hex`} value={appearance[key] || def} onChange={upd(key)} placeholder={def} />
              </div>
            </Field>
          ))}
        </Section>
      )}
      {sub === 'navigation' && <SettingsSiteChrome mode="header" onDirty={onSiteDirty} />}
      {sub === 'layout' && (
        <Section title="Public page layout and visibility" description="Section visibility and order are saved to the page CMS and applied to the public frontend. Open a page to edit instead of changing disconnected flags.">
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3">
            {[["Home page", "/"], ["Volunteer", "/volunteer"], ["Blogs", "/blogs"], ["Donate now", "/donate-now"]].map(([label, slug]) => <Link key={slug} href={`/admin-app/dashboard/pages/edit?slug=${encodeURIComponent(slug)}`} className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-[#02236E]">Manage {label} sections</Link>)}
          </div>
        </Section>
      )}
    </>
  );
}

// ──── SEO tab ────────────────────────────────
function SeoTab({ seo, setSeo }) {
  const [sub, setSub] = useState(() => getSub('global'));
  const upd = (key) => (e) => setSeo((s) => ({ ...s, [key]: e.target.value }));
  return (
    <>
      <SubTabs
        tabs={[
          { id: 'global', label: 'Global Defaults' },
          { id: 'social', label: 'Open Graph' },
          { id: 'technical', label: 'Technical SEO' },
          { id: 'intelligence', label: 'SEO Intelligence' },
          { id: 'search-console', label: 'Search Console' },
        ]}
        active={sub} onChange={setSub}
      />
      {sub === 'global' && (
        <Section title="Global SEO Defaults" description="Default metadata applied to all public pages.">
          <div className="sm:col-span-2">
            <Field label="Default Meta Title" id="seo-title" required>
              <Input id="seo-title" value={seo.meta_title || ''} onChange={upd('meta_title')} placeholder="Khudii | Connecting Hearts, Creating Change" />
              <p className={`mt-1 text-xs ${(seo.meta_title || '').length > 60 ? 'text-red-500' : 'text-slate-400'}`}>{(seo.meta_title || '').length}/60 chars</p>
            </Field>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Default Meta Description" id="seo-desc">
              <Textarea id="seo-desc" rows={3} value={seo.meta_description || ''} onChange={upd('meta_description')} placeholder="Khudii connects volunteers and organizations..." />
              <p className={`mt-1 text-xs ${(seo.meta_description || '').length > 160 ? 'text-red-500' : 'text-slate-400'}`}>{(seo.meta_description || '').length}/160 chars</p>
            </Field>
          </div>
          <Field label="Meta Keywords" id="seo-keywords" hint="Comma-separated">
            <Input id="seo-keywords" value={seo.meta_keywords || ''} onChange={upd('meta_keywords')} placeholder="ngo, volunteering, donations, khudii" />
          </Field>
          <Field label="Canonical Domain" id="seo-domain">
            <Input id="seo-domain" type="url" value={seo.canonical_domain || ''} onChange={upd('canonical_domain')} placeholder="https://khudii.com" />
          </Field>
        </Section>
      )}
      {sub === 'social' && (
        <Section title="Open Graph / Social Sharing" description="Controls how pages appear when shared on Facebook, X, etc.">
          <Field label="OG Title" id="og-title">
            <Input id="og-title" value={seo.og_title || ''} onChange={upd('og_title')} />
          </Field>
          <Field label="OG Description" id="og-desc">
            <Input id="og-desc" value={seo.og_description || ''} onChange={upd('og_description')} />
          </Field>
          <Field label="OG Image URL" id="og-image" hint="1200×630 px recommended">
            <Input id="og-image" type="url" value={seo.og_image || ''} onChange={upd('og_image')} />
          </Field>
          <Field label="Twitter Card Type" id="twitter-card">
            <Select id="twitter-card" value={seo.twitter_card || 'summary_large_image'} onChange={upd('twitter_card')} options={[['summary', 'Summary'], ['summary_large_image', 'Summary + Large Image']]} />
          </Field>
          <Field label="Twitter Handle" id="twitter-handle">
            <Input id="twitter-handle" value={seo.twitter_handle || ''} onChange={upd('twitter_handle')} placeholder="@khudii" />
          </Field>
        </Section>
      )}
      {sub === 'intelligence' && <div className="space-y-5"><Section title="Search engine intelligence" description="Site URL, indexing policy, sitemap and verification details. These settings are persisted and consumed by the public metadata routes."><Field label="Canonical public domain" id="seo-canonical"><Input id="seo-canonical" value={seo.canonical_domain || ''} onChange={upd('canonical_domain')} placeholder="https://www.khudii.com" /></Field><Field label="Google Analytics 4 measurement ID" id="seo-ga4"><Input id="seo-ga4" value={seo.ga_id || ''} onChange={upd('ga_id')} placeholder="G-XXXXXXXXXX" /></Field><Field label="Google Search Console verification code" id="seo-gsc"><Input id="seo-gsc" value={seo.google_site_verification || ''} onChange={upd('google_site_verification')} placeholder="Verification token only" /></Field><Field label="Bing Webmaster verification code" id="seo-bing"><Input id="seo-bing" value={seo.bing_site_verification || ''} onChange={upd('bing_site_verification')} placeholder="Verification token only" /></Field><div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"><div><strong className="text-sm">Allow search engine indexing</strong><p className="mt-1 text-xs text-slate-500">Disabling this tells crawlers to stop indexing public pages.</p></div><Toggle id="seo-intel-index" checked={seo.allow_indexing !== false} onChange={async e => { if (!e.target.checked && !await confirmAction('Disable search indexing?', 'Public pages may disappear from search results.')) return; setSeo(x => ({ ...x, allow_indexing: e.target.checked })); }} /></div></Section><div className="flex flex-wrap gap-2"><Link href="/admin-app/dashboard/seo-center" className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-[#02236E]">Open SEO Center</Link><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">View sitemap.xml</a><a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">View robots.txt</a></div></div>}
      {sub === 'search-console' && <Section title="Google Search Console & Analytics" description="Verification tokens are included in public metadata after saving. Google metrics are not available until the external service is connected."><Field label="Search Console verification" id="gsc"><Input id="gsc" value={seo.google_site_verification || ''} onChange={upd('google_site_verification')} placeholder="Paste verification code" /></Field><Field label="GA4 Measurement ID" id="ga4"><Input id="ga4" value={seo.ga_id || ''} onChange={upd('ga_id')} placeholder="G-XXXXXXXXXX" /></Field><div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2"><a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 p-3 text-sm font-bold text-[#02236E]">Open Search Console</a><a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 p-3 text-sm font-bold text-[#02236E]">Open Google Analytics</a></div></Section>}
      {sub === 'technical' && (
        <Section title="Technical SEO" description="Crawlers, sitemaps, structured data.">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Allow search engine indexing</span>
            <Toggle id="seo-robots" checked={seo.allow_indexing !== false} onChange={(e) => setSeo((s) => ({ ...s, allow_indexing: e.target.checked }))} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Auto-generate sitemap.xml</span>
            <Toggle id="seo-sitemap" checked={seo.auto_sitemap !== false} onChange={(e) => setSeo((s) => ({ ...s, auto_sitemap: e.target.checked }))} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Inject JSON-LD schema</span>
            <Toggle id="seo-jsonld" checked={seo.json_ld !== false} onChange={(e) => setSeo((s) => ({ ...s, json_ld: e.target.checked }))} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Google Analytics ID" id="ga-id">
              <Input id="ga-id" value={seo.ga_id || ''} onChange={upd('ga_id')} placeholder="G-XXXXXXXXXX" />
            </Field>
          </div>
        </Section>
      )}
    </>
  );
}

// ──── Account tab ────────────────────────────
function AccountTab({ profile, setProfile }) {
  const [sub, setSub] = useState(() => getSub('profile'));
  const upd = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  return (
    <>
      <SubTabs
        tabs={[
          { id: 'profile', label: 'Profile' },
          { id: 'preferences', label: 'Preferences' },
          { id: 'roles', label: 'Users & Roles' },
        ]}
        active={sub} onChange={setSub}
      />
      {sub === 'profile' && (
        <Section title="Admin Profile" description="Your personal administrator account details.">
          <Field label="Display Name" id="acc-name" required>
            <Input id="acc-name" value={profile.admin_name || ''} onChange={upd('admin_name')} />
          </Field>
          <Field label="Admin Email" id="acc-email" required>
            <Input id="acc-email" type="email" value={profile.email || ''} onChange={upd('email')} />
          </Field>
          <Field label="Role" id="acc-role">
            <Input id="acc-role" value="Managed in Users & Roles" disabled readOnly />
          </Field>
        </Section>
      )}
      {sub === 'roles' && <CmsV2RoleManager />}
      {sub === 'preferences' && (
        <Section title="Admin Preferences">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Dark mode (admin panel)</span>
            <Toggle id="dark-mode" checked={profile.dark_mode || false} onChange={(e) => setProfile((p) => ({ ...p, dark_mode: e.target.checked }))} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Auto-refresh dashboard</span>
            <Toggle id="auto-refresh" checked={profile.auto_refresh !== false} onChange={(e) => setProfile((p) => ({ ...p, auto_refresh: e.target.checked }))} />
          </div>
        </Section>
      )}
    </>
  );
}

// ──── Security tab ───────────────────────────
function SecurityTab({ security, setSecurity }) {
  const [sub, setSub] = useState(() => getSub('password'));
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const upd = (key) => (e) => setSecurity((s) => ({ ...s, [key]: e.target.value }));

  const changePassword = async () => {
    if (!security.current_password || !security.new_password) { setMsg('All fields required.'); return; }
    if (security.new_password.length < 12) { setMsg('Password must have at least 12 characters.'); return; }
    if (!await confirmAction('Change administrator password?')) return;
    if (security.new_password !== security.confirm_password) { setMsg('Passwords do not match.'); return; }
    setSaving(true); setMsg('');
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/change-password`,
        { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' }, body: JSON.stringify({ currentPassword: security.current_password, newPassword: security.new_password }) },
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || 'Failed');
      setMsg('Password changed successfully.'); settingsNotice('Password changed');
      setSecurity({ current_password: '', new_password: '', confirm_password: '' });
    } catch (e) { setMsg(e.message); settingsNotice('Password update failed', 'error', e.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      <SubTabs
        tabs={[
          { id: 'password', label: 'Change Password' },
          { id: 'sessions', label: 'Sessions' },
        ]}
        active={sub} onChange={setSub}
      />
      {sub === 'password' && (
        <div className="space-y-5">
          <Section title="Change Password" description="Use a strong password of at least 12 characters.">
            <Field label="Current Password" id="curr-pass">
              <div className="relative">
                <Input id="curr-pass" type={showCurr ? 'text' : 'password'} value={security.current_password || ''} onChange={upd('current_password')} autoComplete="current-password" />
                <button type="button" onClick={() => setShowCurr((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                  {showCurr ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label="New Password" id="new-pass">
              <div className="relative">
                <Input id="new-pass" type={showNew ? 'text' : 'password'} value={security.new_password || ''} onChange={upd('new_password')} autoComplete="new-password" />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm New Password" id="confirm-pass">
              <Input id="confirm-pass" type="password" value={security.confirm_password || ''} onChange={upd('confirm_password')} autoComplete="new-password" />
            </Field>
          </Section>
          {msg && (
            <p className={`text-sm font-semibold ${msg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>{msg}</p>
          )}
          <button
            onClick={changePassword}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#02236E] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
            Update Password
          </button>
        </div>
      )}
      {sub === 'sessions' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"><h3 className="font-bold">Current administrator session</h3><p className="text-sm text-slate-500">You can end your current session. Other sessions are not tracked by this installation.</p><button onClick={async () => { if (!await confirmAction('Sign out of this session?')) return; try { const r = await fetch('/api-app/auth/logout', { method: 'POST', credentials: 'include', headers: { 'x-khudii-surface': 'admin' } }); if (!r.ok) throw Error('Logout failed'); await settingsNotice('Signed out'); window.location.assign('/letskhudii'); } catch (e) { settingsNotice(e.message, 'error'); } }} className="rounded-xl bg-[#02236E] px-4 py-2.5 text-sm font-bold text-white">End current session</button></div>
      )}
    </>
  );
}

function ShareTab({ profile, setProfile }) {
  const keys = [['WhatsApp', 'whatsapp'], ['Facebook', 'facebook_url'], ['Instagram', 'instagram_url'], ['YouTube', 'youtube_url'], ['LinkedIn', 'linkedin_url']];
  return <Section title="Share tools & social channels" description="Public social URLs and contact channels. Changes are saved in site identity settings.">{keys.map(([label, key]) => <Field key={key} id={'share-' + key} label={label}><Input id={'share-' + key} value={profile[key] || ''} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} placeholder="https://" /></Field>)}<div className="sm:col-span-2 lg:col-span-3"><p className="text-sm text-slate-500">Share buttons can use these links; the built-in public Social Share component remains available.</p></div></Section>;
}
function PopupTab({ popup, setPopup }) {
  return <Section title="Disclaimer Popup" description="Show an optional announcement once per browser session on the public site."><div className="sm:col-span-2 lg:col-span-3"><Toggle id="popup-enabled" label="Enable disclaimer on public pages" checked={!!popup.enabled} onChange={e => setPopup(x => ({ ...x, enabled: e.target.checked }))} /></div><Field label="Popup title" id="popup-title"><Input id="popup-title" maxLength={150} value={popup.title || ''} onChange={e => setPopup(x => ({ ...x, title: e.target.value }))} /></Field><div className="sm:col-span-2 lg:col-span-3"><Field label="Popup message" id="popup-message"><Textarea id="popup-message" value={popup.message || ''} onChange={e => setPopup(x => ({ ...x, message: e.target.value }))} rows={5} /></Field></div><Field label="Button text" id="popup-btn"><Input id="popup-btn" maxLength={80} value={popup.button_text || ''} onChange={e => setPopup(x => ({ ...x, button_text: e.target.value }))} placeholder="Continue" /></Field></Section>;
}
function CssTab({ css, setCss }) {
  return <Section title="Global CSS" description="Optional custom site CSS. External imports, URL references and executable CSS expressions are blocked on save."><div className="sm:col-span-2 lg:col-span-3"><Field label="Custom CSS (public site)" id="custom-css"><Textarea id="custom-css" value={css.stylesheet || ''} onChange={e => setCss(x => ({ ...x, stylesheet: e.target.value }))} rows={12} /></Field><p className="mt-2 text-xs text-slate-500">Changes may affect public page presentation. Preview on staging before enabling on production.</p></div></Section>;
}
// ──── Main Settings Page ─────────────────────
function SettingsPageInner() {
  const params = useSearchParams();
  const incomingTab = OLD_TABS[params.get('tab')] || params.get('tab') || 'header';
  const incomingSub = params.get('sub') || '';
  const [tab, setTab] = useState(() => typeof window === 'undefined' ? 'header' : OLD_TABS[new URLSearchParams(window.location.search).get('tab')] || new URLSearchParams(window.location.search).get('tab') || 'header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [siteDirty, setSiteDirty] = useState(false);

  const [profile, setProfileRaw] = useState({});
  const [smtp, setSmtpRaw] = useState({});
  const [appearance, setAppearanceRaw] = useState({});
  const [seo, setSeoRaw] = useState({});
  const [forms, setFormsRaw] = useState({});
  const [popup, setPopupRaw] = useState({});
  const [css, setCssRaw] = useState({});
  const [loginAuth, setLoginAuthRaw] = useState({
    backgroundImage: '',
    backgroundAlt: '',
    footerText: '© 2026 Khudii. All Rights Reserved. Powered by DKS.',
    mediaStorageMode: 'ftp',
    maintenanceMode: false,
    maintenanceScope: 'all',
    maintenancePaths: [],
  });
  const setForms = (updater) => { setFormsRaw(updater); setDirty(true); setSaved(false); };
  const setPopup = updater => { setPopupRaw(updater); setDirty(true); setSaved(false); };
  const setCss = updater => { setCssRaw(updater); setDirty(true); setSaved(false); };
  const [security, setSecurity] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const makeUpdater = (setter) => (updater) => {
    setter(updater);
    setDirty(true);
    setSaved(false);
    setSaveError('');
  };

  const setProfile = makeUpdater(setProfileRaw);
  const setSmtp = makeUpdater(setSmtpRaw);
  const setAppearance = makeUpdater(setAppearanceRaw);
  const setSeo = makeUpdater(setSeoRaw);
  const setLoginAuth = makeUpdater(setLoginAuthRaw);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/settings`,
        { credentials: 'include', headers: { 'x-khudii-surface': 'admin' }, cache: 'no-store' },
      );
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.message || `Settings request failed (${r.status})`);
      setProfileRaw(json.profile || {});
      setSmtpRaw(json.smtp || {});
      setAppearanceRaw(json.appearance || {});
      setSeoRaw(json.seo || {});
      setFormsRaw(json.forms || {});
      setPopupRaw(json.popup || {});
      setCssRaw(json.css || {});
      setLoginAuthRaw(json.login_auth || {
        backgroundImage: '',
        backgroundAlt: '',
        footerText: '© 2026 Khudii. All Rights Reserved. Powered by DKS.',
        mediaStorageMode: 'ftp',
        maintenanceMode: false,
        maintenanceScope: 'all',
        maintenancePaths: [],
      });
      setDirty(false);
    } catch (e) { setLoadError(e.message || 'Could not load settings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Next.js preserves this page when a sidebar query changes, so synchronize its tabs.
  useEffect(() => { if (TABS.some(t => t.id === incomingTab) && !dirty) setTab(incomingTab); }, [incomingTab, dirty]);
  useEffect(() => { const guard = e => { if (dirty || siteDirty) { e.preventDefault(); settingsNotice('Unsaved changes', 'error', 'Save or reload before changing settings sections.'); } }; window.addEventListener('khudii:settings-change', guard); return () => window.removeEventListener('khudii:settings-change', guard); }, [dirty, siteDirty]);

  const save = async () => {
    if (!await confirmAction('Save settings?', 'Apply your changes to the Khudii configuration?')) return;
    setSaving(true); setSaved(false); setSaveError('');
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/settings`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
          body: JSON.stringify({ profile, smtp, appearance, seo, forms, popup, css, login_auth: loginAuth }),
        },
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || 'Save failed');
      setSaved(true); setDirty(false); settingsNotice('Settings saved');
    } catch (e) { setSaveError(e.message); settingsNotice('Settings could not be saved', 'error', e.message); }
    finally { setSaving(false); }
  };

  useEffect(() => { const handler = e => { e.preventDefault(); if (dirty && !saving) save(); }; window.addEventListener('khudii:save-request', handler); return () => window.removeEventListener('khudii:save-request', handler); }, [dirty, saving, save]);
  useEffect(() => { window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { source: 'settings', dirty } })); return () => window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { source: 'settings', dirty: false } })); }, [dirty]);
  useEffect(() => { const warn = e => { if (dirty || siteDirty) { e.preventDefault(); e.returnValue = 'Save settings before leaving.'; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty, siteDirty]);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={30} className="animate-spin text-[#02236E]" />
      </div>
    );
  }
  if (loadError) {
    return (
      <div role="alert" className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-red-200 bg-red-50 p-7 text-red-800">
        <h2 className="text-lg font-bold">Unable to load Khudii settings</h2>
        <p className="text-sm">{loadError}</p>
        <p className="text-sm">Editing is disabled until the current settings have loaded successfully to avoid overwriting existing records.</p>
        <button type="button" onClick={load} className="rounded-xl bg-[#02236E] px-5 py-2.5 text-sm font-bold text-white">Retry loading settings</button>
      </div>
    );
  }

  return (
    <div className="kh-video-settings space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="rounded-2xl bg-[#02236E]/8 p-3 text-[#02236E]"><Settings size={26} /></span>
          <div>
            <h1 className="text-3xl font-extrabold text-[#02236E]">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all Khudii platform configuration in one place.</p>
          </div>
        </div>
        <ReloadButton onClick={async () => { if (dirty && !await confirmAction('Discard unsaved changes?')) return; load(); }} size="sm">
          Reload
        </ReloadButton>
      </div>

      {/* Main tabs */}
      <div className="kh-settings-tabs flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { if (dirty || siteDirty) { setSaveError('Save or reload your changes before changing tabs.'); settingsNotice('Unsaved changes', 'error', 'Save settings first.'); return; } setTab(id); const u = new URL(window.location.href); u.searchParams.set('tab', id); u.searchParams.delete('sub'); window.history.replaceState(window.history.state, '', u.pathname + u.search); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${tab === id ? 'bg-white text-[#02236E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[320px]">
        {tab === 'identity' && <GeneralTab key={`${tab}:${incomingSub}`} profile={profile} setProfile={setProfile} />}
        {tab === 'email' && <EmailTab key={`${tab}:${incomingSub}`} smtp={smtp} setSmtp={setSmtp} />}
        {(tab === 'header' || tab === 'footer' || tab === 'site') && <SettingsSiteChrome key={`${tab}:${incomingSub}`} mode={tab === 'site' ? incomingSub : tab} onDirty={setSiteDirty} />}
        {tab === 'seo' && <KhudiiSeoIndexingSettings seo={seo} setSeo={setSeo} onSave={save} saving={saving} dirty={dirty} />}
        {tab === 'users' && <UserManagementTab />}
        {tab === 'auth' && <LoginAuthTab loginAuthData={loginAuth} setLoginAuthData={setLoginAuth} onSave={save} saving={saving} dirty={dirty} />}
        {tab === 'share' && <ShareTab profile={profile} setProfile={setProfile} />}
        {tab === 'popup' && <PopupTab popup={popup} setPopup={setPopup} />}
        {tab === 'css' && <CssTab css={css} setCss={setCss} />}
        {tab === 'forms' && <KhudiiFormsManagement forms={forms} setForms={setForms} onSave={save} saving={saving} dirty={dirty} />}
        {tab === 'db' && <KhudiiDatabaseSettings />}
      </div>

      {/* Save bar (not shown for Security—its own submit) */}
      {tab !== 'auth' && tab !== 'db' && tab !== 'seo' && !(['header', 'footer'].includes(tab)) && (
        <SaveBar saving={saving} saved={saved} error={saveError} onSave={save} dirty={dirty} />
      )}
    </div>
  );
}

export default function SettingsPage() { return <Suspense fallback={<div className="p-10 text-[#02236E]">Loading settings...</div>}><SettingsPageInner /></Suspense>; }
