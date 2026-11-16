/**
 * Backward compatibility wrapper for legacy public alerts.
 * Centralized in src/lib/dialogs.js as single source of truth.
 */
import { showError as showDialogError, showSuccess as showDialogSuccess } from "@/lib/dialogs";

export const showError = (message = "Something went Wrong!") => {
  return showDialogError("Error", message);
};

export const showSuccessAlert = (message = "Operation completed successfully") => {
  return showDialogSuccess("Success!", message);
};

export default {
  showError,
  showSuccessAlert,
};
