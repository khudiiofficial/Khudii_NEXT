'use client';
import { useState, useEffect } from 'react';
import {
  Shield, Check, AlertCircle, RefreshCw, Save, Loader2,
  Image as ImageIcon, CheckCircle2, Lock, Eye, EyeOff
} from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';
import ImageUploadWidget from './ImageUploadWidget';

export default function LoginAuthTab({
  loginAuthData = {},
  setLoginAuthData,
  onSave,
  saving = false,
  dirty = false,
  pagesList = [],
}) {
  const [saveMsg, setSaveMsg] = useState(null);
  const [mediaStorageMode, setMediaStorageMode] = useState(loginAuthData.mediaStorageMode || 'ftp');
  const [mediaStorageLoading, setMediaStorageLoading] = useState(false);
  const [switchingMedia, setSwitchingMedia] = useState(false);
  const [publicFolderTesting, setPublicFolderTesting] = useState(false);
  const [ftpConnectionTesting, setFtpConnectionTesting] = useState(false);
  const [testStatusMsg, setTestStatusMsg] = useState('');
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // Security / Password update states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  // Synchronize initial mediaStorageMode default to 'ftp'
  useEffect(() => {
    if (!loginAuthData.mediaStorageMode) {
      setLoginAuthData((prev) => ({ ...prev, mediaStorageMode: 'ftp' }));
    }
  }, [loginAuthData.mediaStorageMode, setLoginAuthData]);

  // Load storage mode from backend
  useEffect(() => {
    let active = true;
    fetch('/api-app/admin/media/storage-mode', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.mode) {
          setMediaStorageMode(data.mode);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSelectMediaStorage = async (mode) => {
    if (mediaStorageMode === mode) return;
    const confirmed = await confirmDialog({
      title: `Switch media storage to ${mode === 'ftp' ? 'FTP Folder' : 'Public Folder'}?`,
      text: 'New uploads will be stored in this location. Existing files will remain accessible.',
      status: 'warning',
    });
    if (!confirmed) return;

    setSwitchingMedia(true);
    try {
      const res = await fetch('/api-app/admin/media/storage-mode', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data?.success) {
        setMediaStorageMode(mode);
        setLoginAuthData((prev) => ({ ...prev, mediaStorageMode: mode }));
        alertNotice({
          title: 'Storage Mode Switched',
          text: `Media storage switched to ${mode === 'ftp' ? 'FTP Folder' : 'Public Folder'}.`,
          status: 'success',
        });
      } else {
        alertNotice({ title: 'Error', text: data?.error || 'Failed to switch storage mode', status: 'error' });
      }
    } catch {
      setMediaStorageMode(mode);
      setLoginAuthData((prev) => ({ ...prev, mediaStorageMode: mode }));
      alertNotice({
        title: 'Storage Mode Switched',
        text: `Media storage switched to ${mode === 'ftp' ? 'FTP Folder' : 'Public Folder'}.`,
        status: 'success',
      });
    } finally {
      setSwitchingMedia(false);
    }
  };

  const handleTestPublicFolder = async () => {
    setPublicFolderTesting(true);
    setTestStatusMsg('');
    try {
      const res = await fetch('/api-app/admin/media/test-public', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data?.success) {
        setTestStatusMsg(`✓ ${data.message || 'Public Folder is operational.'}`);
        alertNotice({ title: 'Public Storage OK', text: data.message, status: 'success' });
      } else {
        setTestStatusMsg(`⚠️ ${data.error || 'Public storage test failed.'}`);
        alertNotice({ title: 'Public Storage Check', text: data.error, status: 'warning' });
      }
    } catch (e) {
      setTestStatusMsg(`⚠️ Public test failed: ${e.message}`);
    } finally {
      setPublicFolderTesting(false);
    }
  };

  const handleTestFtpConnection = async () => {
    setFtpConnectionTesting(true);
    setTestStatusMsg('');
    try {
      const res = await fetch('/api-app/admin/media/test-ftp', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data?.success) {
        setTestStatusMsg(`✓ ${data.message || 'FTP Connection verified.'}`);
        alertNotice({ title: 'FTP Connection OK', text: data.message, status: 'success' });
      } else {
        setTestStatusMsg(`⚠️ ${data.error || 'FTP check failed.'}`);
        alertNotice({ title: 'FTP Check', text: data.error, status: 'warning' });
      }
    } catch (e) {
      setTestStatusMsg(`⚠️ FTP test failed: ${e.message}`);
    } finally {
      setFtpConnectionTesting(false);
    }
  };

  const handleSaveLoginSettings = async () => {
    if (onSave) {
      await onSave();
      setSaveMsg('Login settings saved');
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPwMsg('Current and new passwords are required.');
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg('New password must have at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg('New passwords do not match.');
      return;
    }

    const ok = await confirmDialog({
      title: 'Update Administrator Password?',
      text: 'Your password will change immediately and other active sessions will be invalidated.',
      status: 'warning',
      confirmText: 'Update Password',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setPwSaving(true);
    setPwMsg('');
    try {
      const res = await fetch('/api-app/auth/change-password', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      setPwMsg('Password changed successfully.');
      alertNotice({ title: 'Password Updated', text: 'Your administrator password has been updated.', status: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err) {
      setPwMsg(err.message);
      alertNotice({ title: 'Password Update Failed', text: err.message, status: 'error' });
    } finally {
      setPwSaving(false);
    }
  };

  const pageOptions = pagesList.length > 0
    ? pagesList
    : [
        { slug: '/', title: 'Home Page' },
        { slug: '/volunteer', title: 'Volunteer' },
        { slug: '/blogs', title: 'Blogs' },
        { slug: '/donate-now', title: 'Donate Now' },
        { slug: '/organizations', title: 'Organizations' },
        { slug: '/success-stories', title: 'Success Stories' },
      ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Login Authentication UI Settings</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Configure the cinematic 3D login screen&apos;s background, logo, and footer text.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveMsg}
            </span>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveLoginSettings}
            className="bg-[#02236E] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#001850] transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Login Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col gap-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Background Image */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold text-slate-700">Login Page Background Image</label>
            <ImageUploadWidget
              label="Choose from Media Library or Upload Login Background"
              value={loginAuthData.backgroundImage ?? ''}
              onChange={(url) =>
                setLoginAuthData((prev) => ({ ...prev, backgroundImage: url }))
              }
            />

            <div className="mt-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                BACKGROUND IMAGE URL
              </label>
              <input
                type="text"
                value={loginAuthData.backgroundImage ?? ''}
                onChange={(e) =>
                  setLoginAuthData((prev) => ({ ...prev, backgroundImage: e.target.value }))
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#02236E]"
                placeholder="https://... or /uploads/login-bg.jpg"
              />
            </div>

            <div className="mt-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                ALTERNATIVE TEXT
              </label>
              <input
                type="text"
                value={loginAuthData.backgroundAlt ?? ''}
                onChange={(e) =>
                  setLoginAuthData((prev) => ({ ...prev, backgroundAlt: e.target.value }))
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#02236E]"
                placeholder="Login screen background image"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Upload a high-quality background for the login page (1920x1080 recommended).
              </span>
            </div>
          </div>

          {/* Right Column: Footer Text */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold text-slate-700">Login Footer Text</label>
            <input
              type="text"
              value={loginAuthData.footerText ?? '© 2026 Khudii. All Rights Reserved. Powered by DKS.'}
              onChange={(e) =>
                setLoginAuthData((prev) => ({ ...prev, footerText: e.target.value }))
              }
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#02236E]"
              placeholder="© 2026 Khudii. All Rights Reserved. Powered by DKS."
            />
          </div>
        </div>

        {/* Media Storage Location - Default selected: FTP */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#02236E]">Media Storage Location</h3>
          <p className="text-xs text-slate-600">
            Choose where new uploads are saved on Hostinger. Existing media URLs remain unchanged; files stored in the other location can still be viewed. Switching does not move or erase files.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'public', label: 'Public Folder', desc: 'Local public/uploads directory' },
              { id: 'ftp', label: 'FTP Folder', desc: 'Khudii FTP media directory (media.khudii.com)' },
            ].map(({ id, label, desc }) => {
              const isSelected = mediaStorageMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={mediaStorageLoading || switchingMedia}
                  onClick={() => handleSelectMediaStorage(id)}
                  className={`text-left rounded-xl border-2 p-4 transition-all cursor-pointer disabled:opacity-60 ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-100 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{label}</span>
                    {isSelected && (
                      <span className="rounded-full bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-slate-500" aria-live="polite">
              {switchingMedia
                ? 'Validating storage access and updating...'
                : testStatusMsg || 'Click another location to review and confirm the switch.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleTestPublicFolder}
                disabled={publicFolderTesting || switchingMedia}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:opacity-60 cursor-pointer"
              >
                {publicFolderTesting ? 'Testing Public Folder...' : 'Test Public Folder'}
              </button>
              <button
                type="button"
                onClick={handleTestFtpConnection}
                disabled={ftpConnectionTesting || switchingMedia}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:opacity-60 cursor-pointer"
              >
                {ftpConnectionTesting ? 'Checking FTP...' : 'Test FTP Connection'}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            The FTP account and connection settings come from server environment variables. This switch does not update credentials. Restart Next.js after changing those variables.
          </p>
        </div>

        {/* System Maintenance Section */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>⚠️</span> System Maintenance
          </h3>
          <div className="flex justify-between items-center p-4 rounded-2xl bg-amber-500/10 border border-amber-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Maintenance Mode</div>
              <div className="text-[11px] text-slate-500">
                When active, the frontend will display a maintenance page. You will still be able to access the admin panel.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(loginAuthData.maintenanceMode)}
              onClick={() =>
                setLoginAuthData((prev) => ({
                  ...prev,
                  maintenanceMode: !prev.maintenanceMode,
                }))
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                loginAuthData.maintenanceMode ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  loginAuthData.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {loginAuthData.maintenanceMode && (
            <button
              type="button"
              onClick={() => setMaintenanceModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl border border-amber-400 bg-white text-amber-900 text-xs font-bold cursor-pointer"
            >
              Choose Frontend Pages (
              {loginAuthData.maintenanceScope === 'selected'
                ? `${(loginAuthData.maintenancePaths || []).length} selected`
                : 'All pages'}
              )
            </button>
          )}
        </div>

        {/* Administrator Password Management Collapsible */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-700 hover:text-slate-900 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#02236E]" /> Administrator Password Management
            </span>
            <span className="text-xs text-slate-400">{showPasswordSection ? '▲ Hide' : '▼ Update Password'}</span>
          </button>

          {showPasswordSection && (
            <div className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurr ? 'text' : 'password'}
                      value={currentPassword ?? ''}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2 pr-8 rounded-lg border border-slate-300 bg-white text-xs"
                      placeholder="Current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurr(!showCurr)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurr ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword ?? ''}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 pr-8 rounded-lg border border-slate-300 bg-white text-xs"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword ?? ''}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              {pwMsg && (
                <p className={`text-xs font-semibold ${pwMsg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {pwMsg}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={pwSaving}
                  onClick={handleUpdatePassword}
                  className="rounded-lg bg-[#02236E] px-4 py-2 text-xs font-bold text-white hover:bg-[#001850] disabled:opacity-50"
                >
                  {pwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Pages Selection Modal */}
      {maintenanceModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose maintenance pages"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Select Pages for Maintenance Mode</h3>
            <p className="text-xs text-slate-600">
              Only the selected frontend routes will display the maintenance page. Admin and login remain accessible. Changes apply when you click Save Login Settings.
            </p>
            <label className="flex gap-2 items-center cursor-pointer text-sm font-semibold bg-slate-50 rounded-xl p-3">
              <input
                type="radio"
                name="scope"
                checked={loginAuthData.maintenanceScope !== 'selected'}
                onChange={() =>
                  setLoginAuthData((prev) => ({ ...prev, maintenanceScope: 'all' }))
                }
              />
              All Frontend Pages
            </label>
            <label className="flex gap-2 items-center cursor-pointer text-sm font-semibold bg-slate-50 rounded-xl p-3">
              <input
                type="radio"
                name="scope"
                checked={loginAuthData.maintenanceScope === 'selected'}
                onChange={() =>
                  setLoginAuthData((prev) => ({ ...prev, maintenanceScope: 'selected' }))
                }
              />
              Only Selected Pages
            </label>

            {loginAuthData.maintenanceScope === 'selected' && (
              <div className="flex flex-wrap gap-2 max-h-72 overflow-auto p-2 border rounded-xl">
                {pageOptions.map((page) => {
                  const selected = (loginAuthData.maintenancePaths || []).includes(page.slug);
                  return (
                    <button
                      key={page.slug}
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(loginAuthData.maintenancePaths)
                          ? [...loginAuthData.maintenancePaths]
                          : [];
                        const next = current.includes(page.slug)
                          ? current.filter((s) => s !== page.slug)
                          : [...current, page.slug];
                        setLoginAuthData((prev) => ({ ...prev, maintenancePaths: next }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#02236E] text-white border-[#02236E]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {page.title || page.slug}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setMaintenanceModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#02236E] text-white text-xs font-bold hover:bg-[#001850] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
