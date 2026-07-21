import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useLocale } from "../i18n/locale-context";

export const MultiSelect = React.forwardRef(function MultiSelect(
  {
    options = [],
    value,
    defaultValue = [],
    onValueChange,
    placeholder,
    maxCount = 2,
    modalPopover = false,
    className,
    ...buttonProps
  },
  ref,
) {
  const { t } = useLocale();
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const selectedValues = value === undefined ? internalValue : value;
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const updateValue = (nextValue) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const toggleOption = (optionValue) =>
    updateValue(
      selectedValues.includes(optionValue)
        ? selectedValues.filter((item) => item !== optionValue)
        : [...selectedValues, optionValue],
    );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modalPopover}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          {...buttonProps}
          className={cn(
            "flex w-max max-w-100 items-center cursor-pointer justify-between gap-3 rounded-lg border duration-300 ease-in-out border-(--color-primary) bg-white px-2.5 py-1.5 bp360:px-3 bp360:py-2 text-left t-size3 font-medium text-slate-700 transition-all hover:bg-green-50 focus:outline-none focus:ring-3 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selectedOptions.length ? (
              <>
                {selectedOptions.slice(0, maxCount).map((option) => (
                  <Badge
                    key={option.value}
                    className="gap-1 bg-green-100 text-green-700 hover:bg-green-100"
                  >
                    {option.label}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`${t("common.remove")} ${option.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleOption(option.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleOption(option.value);
                        }
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  </Badge>
                ))}
                {selectedOptions.length > maxCount && (
                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                    +{selectedOptions.length - maxCount}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-slate-400">
                {placeholder || t("common.select")}
              </span>
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 text-green-600" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
      >
        <Command>
          <CommandInput placeholder={t("common.search")} />
          <CommandList>
            <CommandEmpty>{t("common.noResults")}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const selected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <span
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded border border-green-600",
                        selected
                          ? "bg-green-600 text-white"
                          : "text-transparent",
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={() => updateValue([])}
                className="w-full border-t border-slate-100 px-3 py-2 text-left t-size2 font-medium text-red-600 hover:bg-red-50"
              >
                {t("common.clear")}
              </button>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

MultiSelect.displayName = "MultiSelect";
