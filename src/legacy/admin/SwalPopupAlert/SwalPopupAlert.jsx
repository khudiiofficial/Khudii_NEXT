import { alertNotice, confirmDialog, showSuccess, showError, showWarning } from '@/lib/dialogs';

export const showSuccessAlert = (message = 'Operation completed successfully!') => {
  return showSuccess('Success!', message);
};

export const showErrorAlert = (message = 'Something went wrong!') => {
  return showError('Error!', message);
};

export { showError } from '@/lib/dialogs';
export { showWarning } from '@/lib/dialogs';

export const confirmAction = async ({
  title = 'Are you sure?',
  text = 'Please confirm this action.',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  icon = 'warning',
} = {}) => {
  return confirmDialog({
    title,
    text,
    status: icon,
    confirmText: confirmButtonText,
    cancelText: cancelButtonText,
  });
};
