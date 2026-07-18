/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogCancel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 t-size3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/10 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export const AlertDialogAction = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-green-600 px-4 t-size3 font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export const AlertDialogOverlay = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export const AlertDialogContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  ),
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />
);

export const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);

export const AlertDialogTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn("t-size5 font-bold text-slate-900", className)}
      {...props}
    />
  ),
);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

export const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("t-size3 leading-6 text-slate-500 font-medium", className)}
      {...props}
    />
  ),
);
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;
