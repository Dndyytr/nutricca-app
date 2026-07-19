import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/toast";
import { ConfirmContext } from "./confirm-context";
import { useLocale } from "../../i18n/locale-context";
import { TriangleAlert } from "lucide-react";

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
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <div className="relative inline-flex w-max">
                {/* Ripple Effect Background */}
                <span className="absolute inset-0 z-1 animate-ping-slow rounded-full bg-red-500 opacity-20"></span>

                <span className="relative z-2 flex items-center justify-center rounded-full bg-red-100 p-4 text-red-600 transition-transform duration-300 hover:scale-110 hover:rotate-3 active:scale-110 active:rotate-3">
                  <TriangleAlert className="size-6.5 bp360:size-7 bp400:size-7.5 md:size-8 lg:size-8.5 xl:size-9 2xl:size-9.5" />
                </span>
              </div>
            </AlertDialogMedia>
            <AlertDialogTitle>{request?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {request?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">
              {request?.cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive">
              {request?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        {/* <AlertDialogContent>
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
        </AlertDialogContent> */}
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};
