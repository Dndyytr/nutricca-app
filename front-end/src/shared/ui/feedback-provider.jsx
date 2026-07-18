import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/toast";
import { ConfirmContext } from "./confirm-context";
import { useLocale } from "../../i18n/locale-context";

export const FeedbackProvider = ({ children }) => {
  const [request, setRequest] = useState(null);
  const { t } = useLocale();

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setRequest({
          title: t("common.confirmTitle"),
          description: "",
          confirmLabel: t("common.confirm"),
          cancelLabel: t("common.cancel"),
          destructive: false,
          ...options,
          resolve,
        });
      }),
    [t],
  );

  const settle = (result) => {
    request?.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Toaster />
      <AlertDialog
        open={Boolean(request)}
        onOpenChange={(open) => !open && settle(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{request?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {request?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{request?.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              className={
                request?.destructive
                  ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/20"
                  : ""
              }
              onClick={() => settle(true)}
            >
              {request?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};
