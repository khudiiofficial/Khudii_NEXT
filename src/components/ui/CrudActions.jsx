'use client';

import React from 'react';
import { Pencil, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { confirmDelete as defaultConfirmDelete } from '@/lib/dialogs';

/**
 * Universal CRUD Action Button Component
 * Replicates the exact design language from Image 2:
 * 1. Edit (Pencil)
 * 2. Duplicate (Copy)
 * 3. Visibility / Show-Hide (Eye / EyeOff)
 * 4. Delete / Remove (Trash2 with red border & red accent)
 */

export function CrudActionButton({
  icon: Icon,
  onClick,
  disabled = false,
  title,
  ariaLabel,
  variant = 'default',
  className = '',
  size = 'md',
  badge,
}) {
  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-10 w-10 text-base',
  }[size] || 'h-9 w-9 text-sm';

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 15;

  const variantClass = {
    default:
      'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-[#02236E] shadow-2xs',
    edit:
      'border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-[#02236E] hover:border-blue-200 shadow-2xs',
    duplicate:
      'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-[#02236E] shadow-2xs',
    visible:
      'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs',
    hidden:
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-2xs',
    delete:
      'border-red-200 bg-white text-[#ed0026] hover:bg-red-50 hover:border-red-300 shadow-2xs',
  }[variant] || 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      className={`relative inline-flex items-center justify-center rounded-2xl border transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`}
    >
      <Icon size={iconSize} />
      {badge}
    </button>
  );
}

export function EditButton({
  onClick,
  disabled = false,
  label = 'item',
  size = 'md',
  className = '',
}) {
  return (
    <CrudActionButton
      icon={Pencil}
      onClick={onClick}
      disabled={disabled}
      title={`Edit ${label}`}
      ariaLabel={`Edit ${label}`}
      variant="edit"
      size={size}
      className={className}
    />
  );
}

export function DuplicateButton({
  onClick,
  disabled = false,
  label = 'item',
  size = 'md',
  className = '',
}) {
  return (
    <CrudActionButton
      icon={Copy}
      onClick={onClick}
      disabled={disabled}
      title={`Duplicate ${label}`}
      ariaLabel={`Duplicate ${label}`}
      variant="duplicate"
      size={size}
      className={className}
    />
  );
}

export function VisibilityButton({
  isVisible = true,
  onClick,
  disabled = false,
  label = 'item',
  size = 'md',
  className = '',
}) {
  return (
    <CrudActionButton
      icon={isVisible ? Eye : EyeOff}
      onClick={onClick}
      disabled={disabled}
      title={isVisible ? `Hide ${label}` : `Show ${label}`}
      ariaLabel={isVisible ? `Hide ${label}` : `Show ${label}`}
      variant={isVisible ? 'visible' : 'hidden'}
      size={size}
      className={className}
    />
  );
}

export function DeleteButton({
  onClick,
  disabled = false,
  label = 'item',
  size = 'md',
  confirm = false,
  confirmDetails,
  className = '',
}) {
  const handleClick = async (e) => {
    e.stopPropagation();
    if (confirm) {
      const ok = await defaultConfirmDelete(label, confirmDetails);
      if (!ok) return;
    }
    if (onClick) onClick(e);
  };

  return (
    <CrudActionButton
      icon={Trash2}
      onClick={handleClick}
      disabled={disabled}
      title={`Delete ${label}`}
      ariaLabel={`Delete ${label}`}
      variant="delete"
      size={size}
      className={className}
    />
  );
}

/**
 * All-in-one CRUD Action Group
 */
export function CrudActions({
  row,
  label,
  onEdit,
  onDuplicate,
  onToggle,
  onDelete,
  isVisible = true,
  disabled = false,
  size = 'md',
  confirmDelete = false,
  confirmDeleteDetails,
  className = 'flex items-center gap-1.5',
}) {
  const itemLabel = label || row?.label || row?.title || row?.name || 'item';
  const visible = row?.is_visible !== undefined ? Boolean(row.is_visible) : isVisible;

  return (
    <div className={className}>
      {onEdit && (
        <EditButton
          onClick={() => onEdit(row)}
          disabled={disabled}
          label={itemLabel}
          size={size}
        />
      )}
      {onDuplicate && (
        <DuplicateButton
          onClick={() => onDuplicate(row)}
          disabled={disabled}
          label={itemLabel}
          size={size}
        />
      )}
      {onToggle && (
        <VisibilityButton
          isVisible={visible}
          onClick={() => onToggle(row)}
          disabled={disabled}
          label={itemLabel}
          size={size}
        />
      )}
      {onDelete && (
        <DeleteButton
          onClick={() => onDelete(row)}
          disabled={disabled}
          label={itemLabel}
          size={size}
          confirm={confirmDelete}
          confirmDetails={confirmDeleteDetails}
        />
      )}
    </div>
  );
}

export default CrudActions;

