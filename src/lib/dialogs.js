import Swal from 'sweetalert2';

/**
 * Centralized Dialog & Confirmation System for Khudii
 *
 * Status styling:
 * 1. Success > Emerald (#10b981)
 * 2. Warning > Amber   (#f59e0b)
 * 3. Error   > Red     (#ed0026)
 * 4. Info    > Navy    (#02236E)
 */

export const STATUS_CONFIG = Object.freeze({
  success: {
    icon: 'success',
    color: '#10b981', // Emerald
    btnColor: '#059669', // Emerald-600
    confirmBtnClass: 'kh-btn-emerald',
    defaultConfirmText: 'OK',
    defaultTitle: 'Success!',
  },
  warning: {
    icon: 'warning',
    color: '#f59e0b', // Amber
    btnColor: '#d97706', // Amber-600
    confirmBtnClass: 'kh-btn-amber',
    defaultConfirmText: 'Continue',
    defaultTitle: 'Warning',
  },
  error: {
    icon: 'error',
    color: '#ed0026', // Khudii Crimson Red
    btnColor: '#ed0026',
    confirmBtnClass: 'kh-btn-red',
    defaultConfirmText: 'Delete',
    defaultTitle: 'Error',
  },
  info: {
    icon: 'info',
    color: '#02236E', // Khudii Navy
    btnColor: '#02236E',
    confirmBtnClass: 'kh-btn-navy',
    defaultConfirmText: 'OK',
    defaultTitle: 'Notice',
  },
});

function getStatusTheme(status = 'info') {
  const key = String(status || '').toLowerCase();
  if (['success', 'emerald', 'green', 'ok'].includes(key)) return STATUS_CONFIG.success;
  if (['warning', 'amber', 'warn', 'alert'].includes(key)) return STATUS_CONFIG.warning;
  if (['error', 'danger', 'delete', 'red'].includes(key)) return STATUS_CONFIG.error;
  return STATUS_CONFIG.info;
}

/**
 * Premium Confirmation Dialog
 * Returns Promise<boolean> (true if confirmed, false if cancelled)
 */
export async function confirmDialog({
  title = 'Are you sure?',
  text = 'Please confirm this action.',
  html,
  status = 'warning',
  confirmText,
  cancelText = 'Cancel',
  reverseButtons = true,
  input,
  inputLabel,
  inputPlaceholder,
  inputValue,
  inputAttributes,
  inputValidator,
  preConfirm,
  showDenyButton,
  denyButtonText,
  focusCancel,
} = {}) {
  const theme = getStatusTheme(status);

  const swalOptions = {
    title,
    ...(html ? { html } : { text }),
    icon: theme.icon,
    iconColor: theme.color,
    showCancelButton: true,
    confirmButtonText: confirmText || theme.defaultConfirmText,
    cancelButtonText: cancelText,
    reverseButtons,
    buttonsStyling: false,
    customClass: {
      popup: 'kh-swal-card',
      title: 'kh-swal-title',
      htmlContainer: 'kh-swal-text',
      actions: 'kh-swal-actions',
      confirmButton: `kh-swal-btn ${theme.confirmBtnClass}`,
      cancelButton: 'kh-swal-btn kh-btn-cancel',
    },
    background: '#ffffff',
    backdrop: 'rgba(15, 23, 42, 0.65)',
  };

  if (input !== undefined) swalOptions.input = input;
  if (inputLabel !== undefined) swalOptions.inputLabel = inputLabel;
  if (inputPlaceholder !== undefined) swalOptions.inputPlaceholder = inputPlaceholder;
  if (inputValue !== undefined) swalOptions.inputValue = inputValue;
  if (inputAttributes !== undefined) swalOptions.inputAttributes = inputAttributes;
  if (typeof inputValidator === 'function') swalOptions.inputValidator = inputValidator;
  if (typeof preConfirm === 'function') swalOptions.preConfirm = preConfirm;
  if (showDenyButton) {
    swalOptions.showDenyButton = true;
    if (denyButtonText) swalOptions.denyButtonText = denyButtonText;
  }
  if (focusCancel !== undefined) swalOptions.focusCancel = focusCancel;

  const res = await Swal.fire(swalOptions);

  return Boolean(res.isConfirmed);
}

/**
 * Premium Status Notification / Alert Modal
 * (Success > Emerald OK, Warning > Amber, Error > Red)
 */
export async function alertNotice({
  title,
  text,
  html,
  status = 'success',
  confirmText,
  timer,
  showConfirmButton = true,
} = {}) {
  const theme = getStatusTheme(status);

  return Swal.fire({
    title: title || theme.defaultTitle,
    ...(html ? { html } : { text }),
    icon: theme.icon,
    iconColor: theme.color,
    showConfirmButton,
    confirmButtonText: confirmText || (theme.icon === 'success' ? 'OK' : 'Close'),
    timer,
    timerProgressBar: Boolean(timer),
    buttonsStyling: false,
    customClass: {
      popup: 'kh-swal-card',
      title: 'kh-swal-title',
      htmlContainer: 'kh-swal-text',
      actions: 'kh-swal-actions',
      confirmButton: `kh-swal-btn ${theme.confirmBtnClass}`,
    },
    background: '#ffffff',
    backdrop: 'rgba(15, 23, 42, 0.65)',
  });
}

/**
 * Lightweight Toast Notification
 */
export function toastNotice({
  title,
  status = 'success',
  timer = 2500,
} = {}) {
  const theme = getStatusTheme(status);

  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: theme.icon,
    iconColor: theme.color,
    title,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    customClass: {
      popup: 'kh-swal-toast',
      title: 'kh-swal-toast-title',
    },
  });
}

// -------------------------------------------------------------
// Canonical Action Helpers
// -------------------------------------------------------------

export function confirmDelete(itemLabel = 'this item', details = 'This operation cannot be reversed.') {
  return confirmDialog({
    title: `Delete "${itemLabel}"?`,
    text: details,
    status: 'error',
    confirmText: 'Yes, delete',
    cancelText: 'Cancel',
  });
}

export function confirmDiscard(details = 'Any unsaved changes will be permanently discarded.') {
  return confirmDialog({
    title: 'Discard unsaved changes?',
    text: details,
    status: 'warning',
    confirmText: 'Discard changes',
    cancelText: 'Keep editing',
  });
}

export function confirmSave(title = 'Save changes?', details = 'Your updates will immediately take effect.') {
  return confirmDialog({
    title,
    text: details,
    status: 'success',
    confirmText: 'Save changes',
    cancelText: 'Cancel',
  });
}

export function showSuccess(title = 'Success!', text = '', options = {}) {
  return alertNotice({ title, text, status: 'success', ...options });
}

export function showError(title = 'Error', text = 'Something went wrong.', options = {}) {
  return alertNotice({ title, text, status: 'error', ...options });
}

export function showWarning(title = 'Warning', text = '', options = {}) {
  return alertNotice({ title, text, status: 'warning', ...options });
}

export function showInfo(title = 'Notice', text = '', options = {}) {
  return alertNotice({ title, text, status: 'info', ...options });
}

export function confirmPublish(title = 'Publish changes?', details = 'This item will become visible to public visitors.') {
  return confirmDialog({
    title,
    text: details,
    status: 'success',
    confirmText: 'Publish',
    cancelText: 'Cancel',
  });
}

export function confirmInfo(title = 'Confirm action?', details = 'Proceed with this action?', confirmText = 'Continue') {
  return confirmDialog({
    title,
    text: details,
    status: 'info',
    confirmText,
    cancelText: 'Cancel',
  });
}

export const showValidationMessage = (msg) => Swal.showValidationMessage(msg);
export { Swal };

export default {
  confirmDialog,
  alertNotice,
  toastNotice,
  confirmDelete,
  confirmDiscard,
  confirmSave,
  showSuccess,
  showError,
  showWarning,
  showValidationMessage,
  Swal,
};
