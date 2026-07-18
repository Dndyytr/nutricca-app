import { toast } from "../../components/ui/toast";

let loadingToastId;

export const showLoading = (
  title = "Saving...",
  description = "Please wait a moment.",
) => {
  if (loadingToastId) toast.dismiss(loadingToastId);
  loadingToastId = toast.loading(title, { description, duration: Infinity });
};

export const closeFeedback = () => {
  if (loadingToastId) toast.dismiss(loadingToastId);
  loadingToastId = undefined;
};

export const showSuccess = (title = "Saved!", description = "") =>
  toast.success(title, { description });

export const showError = (title = "Something went wrong", description = "") =>
  toast.error(title, { description });
