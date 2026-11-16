import { confirmDialog, alertNotice, toastNotice, confirmDelete, confirmDiscard, confirmSave, showSuccess, showError, showWarning } from './dialogs';

export async function adminConfirm(message, title = 'Confirm action', tone) {
  const text = String(message || '');
  const inferred = /delete|remove|erase|permanent|trash|discard/i.test(`${title} ${text}`)
    ? 'error'
    : /publish|save|create|restore|update/i.test(`${title} ${text}`)
      ? 'success'
      : 'warning';
  const status = ['success', 'warning', 'error'].includes(tone) ? tone : inferred;
  return confirmDialog({
    title,
    text,
    status,
    confirmText: status === 'error' ? 'Delete' : 'Confirm',
    cancelText: 'Cancel',
  });
}

export const adminNotify = (message, icon = 'info') => {
  const status = ['success', 'warning', 'error'].includes(icon) ? icon : 'info';
  return alertNotice({
    title: String(message || ''),
    status,
  });
};

export {
  confirmDialog,
  alertNotice,
  toastNotice,
  confirmDelete,
  confirmDiscard,
  confirmSave,
  showSuccess,
  showError,
  showWarning,
};
