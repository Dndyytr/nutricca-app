/* eslint-disable react-refresh/only-export-components */
import { X } from "lucide-react";
import { useEffect, useState } from "react";

let nextId = 0;
let toasts = [];
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(toasts));

const dismiss = (id) => {
  const toast = toasts.find((item) => item.id === id);
  if (!toast || toast.closing) return;
  if (toast.timer) clearTimeout(toast.timer);
  toasts = toasts.map((item) =>
    item.id === id ? { ...item, closing: true } : item,
  );
  notify();
  setTimeout(() => {
    toasts = toasts.filter((item) => item.id !== id);
    notify();
  }, 180);
};

const add = (type, title, { description = "", duration = 4000 } = {}) => {
  const id = ++nextId;
  const toast = { id, type, title, description };

  if (duration !== Infinity)
    toast.timer = setTimeout(() => dismiss(id), duration);
  toasts = [...toasts, toast];
  notify();
  return id;
};

export const toast = {
  success: (title, options) => add("success", title, options),
  error: (title, options) => add("error", title, options),
  loading: (title, options) => add("loading", title, options),
  dismiss,
};

const TYPE_STYLE = {
  success: {
    icon: "✓",
    iconClass: "bg-green-100 text-green-600 border-green-600",
    iconColor: "border-green-600",
    close: "bg-green-100 text-green-600 hover:bg-green-200 active:bg-green-200",
  },
  error: {
    icon: "!",
    iconClass: "bg-red-100 text-red-600 border-red-600",
    iconColor: "border-red-600",
    close: "bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-200",
  },
  loading: {
    icon: "",
    iconClass: "border-green-600 border-t-transparent animate-spin",
    iconColor: "border-slate-200",
    close: "bg-slate-200 text-slate-600 hover:bg-slate-300 active:bg-slate-300",
  },
};

export const Toaster = () => {
  const [items, setItems] = useState(toasts);

  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  return (
    <>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(-12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes toast-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-8px) scale(.98); } }`}</style>
      <div
        aria-live="polite"
        className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {items.map((item) => {
          const style = TYPE_STYLE[item.type];
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border ${style.iconColor} bg-white p-4 shadow-xl shadow-slate-900/10 ${item.closing ? "animate-[toast-out_180ms_ease-in_forwards]" : "animate-[toast-in_220ms_ease-out]"}`}
            >
              <span
                className={`flex size-5 bp360:size-5.25 bp400:size-5.5 md:size-5.75 lg:size-6 xl:size-6.25 2xl:size-6.5 shrink-0 items-center justify-center border-2 rounded-full t-size2 font-bold ${style.iconClass}`}
              >
                {style.icon}
              </span>
              <div className="min-w-0 flex-1 pr-4">
                <p className="t-size3 font-bold text-slate-900">{item.title}</p>
                {item.description && (
                  <p className="mt-1 t-size2 font-medium text-slate-500">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className={`-mr-1 -mt-1 cursor-pointer rounded-full p-1 ${style.close} size-max`}
              >
                <X className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};
