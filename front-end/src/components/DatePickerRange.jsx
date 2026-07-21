import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useLocale } from "../i18n/locale-context";

export function DatePickerRange({ value, onChange, className = "" }) {
  const { t } = useLocale();
  const [internalDate, setInternalDate] = useState();
  const date = value ?? internalDate;

  const handleSelect = (nextDate) => {
    setInternalDate(nextDate);
    onChange?.(nextDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="select"
          id="date-picker-range"
          className={`w-full justify-start ${className}`}
        >
          <CalendarIcon className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
          {date?.from ? (
            date.to ? (
              <>
                <span>{format(date.from, "LLL dd, y")} - </span>
                <CalendarIcon className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                <span>{format(date.to, "LLL dd, y")}</span>
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <>
              <span>{t("common.startDate")} - </span>
              <CalendarIcon className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
              <span>{t("common.endDate")} </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
