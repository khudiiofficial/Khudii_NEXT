'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Key, Eye, EyeOff, X, Check,
  AlertCircle, Loader2, Shield, CheckCircle2, User, RefreshCw
} from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';

const ALL_PERMISSION_AREAS = [
  'Dashboard',
  'Pages',
  'Organizations',
  'Blogs',
  'Success Stories',
  'Media',
  'SEO Center',
  'Redirects & 404',
  'Forms Enquiries',
  'Activity Logs',
  'Settings',
];

const RESTRICTED_TO_SUPER_ADMIN = new Set(['Settings', 'Activity Logs']);

const ROLE_OPTIONS = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    summary: 'Full system access, user management, settings, activity logs, and all admin sections. Super Admin access is always complete.',
    sections: ALL_PERMISSION_AREAS,
  },
  {
    value: 'admin',
    label: 'Admin',
    summary: 'Operational management across content, organizations, blogs, and inquiries.',
    sections: [
      'Dashboard', 'Pages', 'Organizations', 'Blogs', 'Success Stories',
      'Media', 'SEO Center', 'Redirects & 404', 'Forms Enquiries',
    ],
  },
  {
    value: 'seo_manager',
    label: 'SEO Manager',
    summary: 'SEO, redirects, pages, blogs, and media content operations only.',
    sections: ['Dashboard', 'Pages', 'Blogs', 'Media', 'SEO Center', 'Redirects & 404'],
  },
  {
    value: 'enquiry_manager',
    label: 'Enquiry Manager',
    summary: 'Access to the enquiries dashboard and customer leads only.',
    sections: ['Dashboard', 'Forms Enquiries'],
  },
];

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'DKS',
    email: 'info@dks.com.pk',
    role: 'super_admin',
    status: 1,
    active: true,
    badge_bg: '#008bf9',
    badge_text_color: '#000000',
    permissions: ALL_PERMISSION_AREAS,
    created_at: '2026-07-30T10:00:00Z',
  }
];

export default function UserManagementTab() {
  const [usersList, setUsersList] = useState(DEFAULT_USERS);
  const [loading, setLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create');
  const [userSaveMsg, setUserSaveMsg] = useState(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [userFormData, setUserFormData] = useState({
    id: 0,
    name: '',
    email: '',
    password: '',
    role: 'admin',
    active: true,
    badge_bg: '#008bf9',
    badge_text_color: '#000000',
    permissions: ROLE_OPTIONS[1].sections,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api-app/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.users) && data.users.length > 0) {
        setUsersList(data.users);
      }
    } catch {
      // Fallback to local state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const selectedRoleMeta = useMemo(() => {
    return ROLE_OPTIONS.find((r) => r.value === userFormData.role) || ROLE_OPTIONS[0];
  }, [userFormData.role]);

  const selectedRoleAreas = useMemo(() => {
    return new Set(Array.isArray(userFormData.permissions) ? userFormData.permissions : []);
  }, [userFormData.permissions]);

  const handleOpenAddUser = () => {
    setUserModalMode('create');
    setUserFormData({
      id: 0,
      name: '',
      email: '',
      password: '',
      role: 'admin',
      active: true,
      badge_bg: '#008bf9',
      badge_text_color: '#000000',
      permissions: [...ROLE_OPTIONS[1].sections],
    });
    setShowModalPassword(false);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setUserModalMode('edit');
    const roleMeta = ROLE_OPTIONS.find((r) => r.value === u.role);
    const perms = Array.isArray(u.permissions) && u.permissions.length > 0
      ? u.permissions
      : (roleMeta ? roleMeta.sections : ALL_PERMISSION_AREAS);

    setUserFormData({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'admin',
      active: u.active !== false && u.status !== 0,
      badge_bg: u.badge_bg || '#008bf9',
      badge_text_color: u.badge_text_color || '#000000',
      permissions: perms,
    });
    setShowModalPassword(false);
    setUserModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserFormData((prev) => ({ ...prev, password: result }));
    setShowModalPassword(true);
  };

  const togglePermissionArea = (section) => {
    if (userFormData.role === 'super_admin' || RESTRICTED_TO_SUPER_ADMIN.has(section)) return;
    setUserFormData((prev) => {
      const current = Array.isArray(prev.permissions) ? [...prev.permissions] : [];
      const next = current.includes(section)
        ? current.filter((s) => s !== section)
        : [...current, section];
      return { ...prev, permissions: next };
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userFormData.name?.trim() || !userFormData.email?.trim()) {
      alertNotice({ title: 'Validation Error', text: 'Name and Email are required fields.', status: 'warning' });
      return;
    }

    setSubmitting(true);
    const payload = {
      ...userFormData,
      name: userFormData.name.trim(),
      email: userFormData.email.trim(),
      permissions: userFormData.role === 'super_admin'
        ? [...ALL_PERMISSION_AREAS]
        : (Array.isArray(userFormData.permissions) ? userFormData.permissions : [])
            .filter((area) => !RESTRICTED_TO_SUPER_ADMIN.has(area)),
    };

    try {
      if (userModalMode === 'create') {
        const res = await fetch('/api-app/admin/users', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data?.success && data.user) {
          setUsersList((prev) => [...prev, data.user]);
        } else {
          // Local fallback
          const newId = usersList.length > 0 ? Math.max(...usersList.map((u) => u.id)) + 1 : 1;
          const fallbackUser = {
            id: newId,
            ...payload,
            status: payload.active ? 1 : 0,
            created_at: new Date().toISOString(),
          };
          setUsersList((prev) => [...prev, fallbackUser]);
        }
        setUserSaveMsg('User created successfully');
        alertNotice({ title: 'User Created', text: 'New administrator user created successfully!', status: 'success' });
      } else {
        const res = await fetch(`/api-app/admin/users/${userFormData.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data?.success && data.user) {
          setUsersList((prev) => prev.map((u) => (u.id === userFormData.id ? data.user : u)));
        } else {
          setUsersList((prev) =>
            prev.map((u) =>
              u.id === userFormData.id
                ? { ...u, ...payload, status: payload.active ? 1 : 0 }
                : u
            )
          );
        }
        setUserSaveMsg('User updated successfully');
        alertNotice({ title: 'User Updated', text: 'User account details updated successfully!', status: 'success' });
      }
      setUserModalOpen(false);
      setTimeout(() => setUserSaveMsg(null), 4000);
    } catch {
      alertNotice({ title: 'Error', text: 'Failed to save user.', status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    const confirmed = await confirmDialog({
      title: `Delete user "${name}"?`,
      text: 'This account will be permanently deactivated and removed from administrator access.',
      status: 'warning',
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api-app/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data && !data.success) {
        alertNotice({ title: 'Deletion Blocked', text: data.error || 'Cannot delete this user.', status: 'error' });
        return;
      }
      setUsersList((prev) => prev.filter((u) => u.id !== id));
      setUserSaveMsg('User deleted');
      alertNotice({ title: 'User Deleted', text: `User "${name}" has been removed.`, status: 'success' });
      setTimeout(() => setUserSaveMsg(null), 4000);
    } catch {
      // Local remove
      setUsersList((prev) => prev.filter((u) => u.id !== id));
      alertNotice({ title: 'User Deleted', text: `User "${name}" has been removed.`, status: 'success' });
    }
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pw = userFormData.password || '';
    if (!pw) return null;
    let strength = 0;
    if (pw.length >= 8) strength += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) strength += 1;
    if (/\d/.test(pw)) strength += 1;
    if (/[^a-zA-Z\d]/.test(pw)) strength += 1;

    let label = 'Weak';
    let percent = 25;
    let color = 'bg-red-500';
    let textColor = 'text-red-500';

    if (strength === 2) {
      label = 'Average';
      percent = 50;
      color = 'bg-orange-500';
      textColor = 'text-orange-500';
    } else if (strength === 3) {
      label = 'Normal';
      percent = 75;
      color = 'bg-yellow-500';
      textColor = 'text-yellow-600';
    } else if (strength >= 4) {
      label = 'Strong';
      percent = 100;
      color = 'bg-emerald-600';
      textColor = 'text-emerald-700';
    }

    return { label, percent, color, textColor };
  }, [userFormData.password]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0">User Management</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">Manage administrators and access roles</p>
        </div>
        <div className="flex items-center gap-3">
          {userSaveMsg && <span className="text-xs font-bold text-emerald-700">{userSaveMsg}</span>}
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="bg-[#02236E] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#001850] transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto" role="region" aria-label="Admin users table" tabIndex={0}>
        <table className="w-full min-w-[670px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <th className="p-4 pl-6">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-900">
            {usersList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-normal">
                  No users found. Click &quot;Add User&quot; to create your first account.
                </td>
              </tr>
            ) : (
              usersList.map((u) => {
                const isActive = u.active !== false && u.status !== 0;
                const formattedRole = u.role === 'super_admin'
                  ? 'Super Admin'
                  : u.role === 'admin'
                    ? 'Admin'
                    : u.role === 'enquiry_manager'
                      ? 'Enquiry Manager'
                      : 'SEO Manager';
                const permsCount = Array.isArray(u.permissions) ? u.permissions.length : 0;
                const joinedFormatted = u.created_at
                  ? new Date(u.created_at).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '7/30/2026';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{u.name}</span>
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-extrabold inline-block"
                              style={{
                                backgroundColor: u.badge_bg || '#0F766E',
                                color: u.badge_text_color || '#FFFFFF',
                              }}
                            >
                              Badge
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-semibold text-slate-900">
                        {formattedRole}
                      </span>
                      {u.role !== 'super_admin' && permsCount > 0 && (
                        <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
                          {permsCount} permitted areas
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-block">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold inline-block">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {joinedFormatted}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                {userModalMode === 'create' ? 'Add New User' : 'Edit User'}
              </h3>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="text-white p-2 border-none rounded-full bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.name ?? ''}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                  placeholder="e.g. Abdullah Khan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userFormData.email ?? ''}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                  placeholder="user@khudii.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {userModalMode === 'edit' ? 'Password (Leave blank to keep unchanged)' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs font-bold text-[#02236E] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" /> Auto-generate
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={userFormData.password ?? ''}
                    onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 border-none bg-transparent cursor-pointer"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {passwordStrength && (
                  <div className="mt-2.5">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-extrabold tracking-wider mt-1">
                      <span className={passwordStrength.textColor}>{passwordStrength.label}</span>
                      <span className="text-slate-400 font-semibold lowercase">{passwordStrength.percent}% secure</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Assignment</label>
                  <select
                    value={userFormData.role ?? 'admin'}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      const roleMeta = ROLE_OPTIONS.find((r) => r.value === newRole);
                      const defaultSections = roleMeta ? [...roleMeta.sections] : [...ALL_PERMISSION_AREAS];
                      setUserFormData((prev) => ({
                        ...prev,
                        role: newRole,
                        permissions: defaultSections,
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={userFormData.active ? 'active' : 'disabled'}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, active: e.target.value === 'active' }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                  >
                    <option value="active">Active (Allowed)</option>
                    <option value="disabled">Disabled (Blocked)</option>
                  </select>
                </div>
              </div>

              {/* Permission Summary Check-Grid */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Permission Summary
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    {selectedRoleMeta.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2">
                  {selectedRoleMeta.summary}{' '}
                  {userFormData.role === 'super_admin'
                    ? 'Super Admin access is always complete.'
                    : 'Only selected green areas will appear for this user. Dashboard is optional.'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_PERMISSION_AREAS.map((section) => {
                    const isAllowed =
                      userFormData.role === 'super_admin' ||
                      (!RESTRICTED_TO_SUPER_ADMIN.has(section) && selectedRoleAreas.has(section));
                    return (
                      <button
                        type="button"
                        key={section}
                        onClick={() => togglePermissionArea(section)}
                        aria-pressed={isAllowed}
                        disabled={userFormData.role === 'super_admin' || RESTRICTED_TO_SUPER_ADMIN.has(section)}
                        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-semibold transition-all cursor-pointer select-none min-h-9 ${
                          isAllowed
                            ? 'border-[#02236E] bg-[#02236E] text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-md text-[10px] font-black transition-colors ${
                            isAllowed ? 'bg-white/20 text-white' : 'border border-slate-300 text-slate-400'
                          }`}
                        >
                          {isAllowed ? '✓' : '✕'}
                        </span>
                        {section}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Badge Custom Colors */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">User Badge Custom Colors</label>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <span>Preview:</span>
                    <span
                      className="px-2.5 py-0.5 rounded-md text-xs font-bold transition-colors"
                      style={{
                        backgroundColor: userFormData.badge_bg || '#008bf9',
                        color: userFormData.badge_text_color || '#000000',
                      }}
                    >
                      {userFormData.name || 'User'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Badge Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={userFormData.badge_bg ?? '#008bf9'}
                        onChange={(e) =>
                          setUserFormData((prev) => ({ ...prev, badge_bg: e.target.value }))
                        }
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={userFormData.badge_bg ?? '#008bf9'}
                        onChange={(e) =>
                          setUserFormData((prev) => ({ ...prev, badge_bg: e.target.value }))
                        }
                        className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Badge Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={userFormData.badge_text_color ?? '#000000'}
                        onChange={(e) =>
                          setUserFormData((prev) => ({ ...prev, badge_text_color: e.target.value }))
                        }
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={userFormData.badge_text_color ?? '#000000'}
                        onChange={(e) =>
                          setUserFormData((prev) => ({ ...prev, badge_text_color: e.target.value }))
                        }
                        className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-[#02236E] text-white text-xs font-bold hover:bg-[#001850] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : userModalMode === 'create' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
