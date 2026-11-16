'use client';

import React from 'react';
import {
  Save,
  RotateCcw,
  Check,
  Send,
  Plus,
  Trash2,
  LogIn,
  LogOut,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react';

/**
 * Universal Button Configuration Dictionary
 * Single Source of Truth for all action buttons across Khudii
 */
export const BUTTON_ACTIONS = Object.freeze({
  save: {
    label: 'Save changes',
    loadingLabel: 'Saving…',
    icon: Save,
    className:
      'bg-[#02236E] text-white hover:bg-[#033096] shadow-sm hover:shadow active:scale-95 border-transparent',
  },
  update: {
    label: 'Update',
    loadingLabel: 'Updating…',
    icon: Save,
    className:
      'bg-[#02236E] text-white hover:bg-[#033096] shadow-sm hover:shadow active:scale-95 border-transparent',
  },
  discard: {
    label: 'Discard',
    loadingLabel: 'Discarding…',
    icon: null,
    className:
      'border border-amber-300 bg-amber-50/60 text-amber-800 hover:bg-amber-100 hover:border-amber-400 active:scale-95',
  },
  cancel: {
    label: 'Cancel',
    loadingLabel: 'Canceling…',
    icon: X,
    className:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#02236E] active:scale-95',
  },
  ok: {
    label: 'OK',
    loadingLabel: 'Processing…',
    icon: Check,
    className:
      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-95 border-transparent',
  },
  submit: {
    label: 'Submit',
    loadingLabel: 'Submitting…',
    icon: Send,
    className:
      'bg-[#02236E] text-white hover:bg-[#033096] shadow-sm hover:shadow active:scale-95 border-transparent',
  },
  create: {
    label: 'Create',
    loadingLabel: 'Creating…',
    icon: Plus,
    className:
      'bg-[#02236E] text-white hover:bg-[#033096] shadow-sm hover:shadow active:scale-95 border-transparent',
  },
  add: {
    label: 'Add',
    loadingLabel: 'Adding…',
    icon: Plus,
    className:
      'bg-[#02236E] text-white hover:bg-[#033096] shadow-sm hover:shadow active:scale-95 border-transparent',
  },
  delete: {
    label: 'Delete',
    loadingLabel: 'Deleting…',
    icon: Trash2,
    className:
      'bg-[#ed0026] text-white hover:bg-[#c40019] shadow-sm hover:shadow-red-500/20 active:scale-95 border-transparent',
  },
  remove: {
    label: 'Remove',
    loadingLabel: 'Removing…',
    icon: Trash2,
    className:
      'bg-[#ed0026] text-white hover:bg-[#c40019] shadow-sm hover:shadow-red-500/20 active:scale-95 border-transparent',
  },
  signin: {
    label: 'Sign in',
    loadingLabel: 'Signing in…',
    icon: LogIn,
    className:
      'bg-[#02236E] text-white hover:bg-[#033096] shadow-sm hover:shadow active:scale-95 border-transparent',
  },
  signout: {
    label: 'Sign out',
    loadingLabel: 'Signing out…',
    icon: LogOut,
    className:
      'border border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:scale-95',
  },
  reload: {
    label: 'Reload',
    loadingLabel: 'Reloading…',
    icon: RefreshCw,
    className:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#02236E] active:scale-95',
  },
  refresh: {
    label: 'Refresh',
    loadingLabel: 'Refreshing…',
    icon: RefreshCw,
    className:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#02236E] active:scale-95',
  },
});

export const BUTTON_SIZES = Object.freeze({
  sm: 'px-3 py-1.5 text-xs font-bold rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm font-bold rounded-xl gap-2',
  lg: 'px-6 py-3 text-base font-bold rounded-2xl gap-2.5',
});

/**
 * Universal Master Action Button
 */
export function AppButton({
  action = 'submit',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  busy = false,
  saving = false,
  size = 'md',
  icon: CustomIcon,
  children,
  className = '',
  title,
  ariaLabel,
  fullWidth = false,
  ...rest
}) {
  const isBusy = Boolean(loading || busy || saving);
  const config = BUTTON_ACTIONS[action] || BUTTON_ACTIONS.submit;
  const sizeClasses = BUTTON_SIZES[size] || BUTTON_SIZES.md;

  const IconComponent = CustomIcon !== undefined ? CustomIcon : config.icon;
  const buttonText = children || (isBusy ? config.loadingLabel : config.label);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isBusy}
      title={title || (typeof buttonText === 'string' ? buttonText : config.label)}
      aria-label={ariaLabel || (typeof buttonText === 'string' ? buttonText : config.label)}
      className={`inline-flex items-center justify-center font-bold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none ${sizeClasses} ${config.className} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isBusy ? (
        <Loader2 size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} className="animate-spin shrink-0" />
      ) : IconComponent ? (
        <IconComponent size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
      ) : null}
      <span>{buttonText}</span>
    </button>
  );
}

// -------------------------------------------------------------
// Semantic Shortcut Components
// -------------------------------------------------------------

export function SaveButton(props) {
  return <AppButton action="save" type="submit" {...props} />;
}

export function DiscardButton(props) {
  return <AppButton action="discard" {...props} />;
}

export function CancelButton(props) {
  return <AppButton action="cancel" {...props} />;
}

export function OkButton(props) {
  return <AppButton action="ok" {...props} />;
}

export function SubmitButton(props) {
  return <AppButton action="submit" type="submit" {...props} />;
}

export function UpdateButton(props) {
  return <AppButton action="update" type="submit" {...props} />;
}

export function CreateButton(props) {
  return <AppButton action="create" {...props} />;
}

export function AddButton(props) {
  return <AppButton action="add" {...props} />;
}

export function DeleteActionButton(props) {
  return <AppButton action="delete" {...props} />;
}

export function DeleteAppButton(props) {
  return <AppButton action="delete" {...props} />;
}

export function RemoveButton(props) {
  return <AppButton action="remove" {...props} />;
}

export function SignOutButton(props) {
  return <AppButton action="signout" {...props} />;
}

export function SignInButton(props) {
  return <AppButton action="signin" type="submit" {...props} />;
}

export function ReloadButton(props) {
  return <AppButton action="reload" {...props} />;
}

export function RefreshButton(props) {
  return <AppButton action="refresh" {...props} />;
}

/**
 * Standard Save / Discard Bar (Matches Image 3)
 */
export function SaveDiscardBar({
  onSave,
  onDiscard,
  saving = false,
  label = 'Unsaved changes. Save before switching pages.',
  saveText = 'Save changes',
  discardText = 'Discard',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm animate-in fade-in duration-200 ${className}`}
    >
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        {label}
      </span>
      <div className="flex items-center gap-2">
        <SaveButton onClick={onSave} loading={saving}>
          {saveText}
        </SaveButton>
        <DiscardButton onClick={onDiscard} disabled={saving}>
          {discardText}
        </DiscardButton>
      </div>
    </div>
  );
}

export default AppButton;

