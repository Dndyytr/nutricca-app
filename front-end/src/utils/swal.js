import Swal from 'sweetalert2';

const BASE = {
  customClass: {
    popup: '!rounded-2xl !font-sans !shadow-2xl',
    title: '!text-slate-900 !text-lg !font-bold',
    htmlContainer: '!text-slate-500 !text-sm',
    confirmButton: '!rounded-xl !px-6 !py-2.5 !text-sm !font-bold !bg-green-600 hover:!bg-green-700 !shadow-none',
    cancelButton: '!rounded-xl !px-6 !py-2.5 !text-sm !font-bold !bg-slate-100 !text-slate-600 hover:!bg-slate-200 !shadow-none',
    denyButton: '!rounded-xl !px-6 !py-2.5 !text-sm !font-bold !bg-red-50 !text-red-600 hover:!bg-red-100 !shadow-none',
  },
  buttonsStyling: false,
};

/** Show fullscreen loading — call .close() to dismiss */
export const showLoading = (title = 'Saving...', text = 'Please wait a moment.') =>
  Swal.fire({
    ...BASE,
    title,
    html: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

/** Success toast (auto-close 2s) */
export const showSuccess = (title = 'Saved!', text = '') =>
  Swal.fire({
    ...BASE,
    icon: 'success',
    title,
    html: text || undefined,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: false,
  });

/** Error alert */
export const showError = (title = 'Something went wrong', text = '') =>
  Swal.fire({
    ...BASE,
    icon: 'error',
    title,
    html: text || undefined,
    confirmButtonText: 'OK',
  });

/** Confirm dialog — returns true if confirmed */
export const showConfirm = async (title, text, confirmText = 'Yes', cancelText = 'Cancel') => {
  const result = await Swal.fire({
    ...BASE,
    icon: 'warning',
    title,
    html: text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
  return result.isConfirmed;
};

/** Close any open Swal */
export const closeSwal = () => Swal.close();
