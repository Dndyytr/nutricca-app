import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronRight,
  Cookie,
  Moon,
  Search,
  Sun,
  Utensils,
} from "lucide-react";
import { DatePickerRange } from "../../../components/DatePickerRange";
import { Button } from "../../../components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useLocale } from "../../../i18n/locale-context";
import { getNutritionLogHistory } from "../../../services/api";

const MEAL_CONFIG = {
  breakfast: { icon: Sun, className: "text-amber-500" },
  lunch: { icon: Utensils, className: "text-green-600" },
  dinner: { icon: Moon, className: "text-violet-600" },
  snack: { icon: Cookie, className: "text-orange-500" },
};
const toDateParam = (date) => (date ? format(date, "yyyy-MM-dd") : undefined);

export const NutritionLogHistory = () => {
  const { locale, t } = useLocale();
  const [dateRange, setDateRange] = useState();
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ sort: "newest" });
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 0, showingText: "" });
  const [state, setState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    const loadLogs = async () => {
      setState("loading");
      try {
        const response = await getNutritionLogHistory({ ...filters, page });
        if (cancelled) return;
        setLogs(response.data?.nutritionLogs || []);
        setMeta(response.data?.meta || { totalPages: 0, showingText: "" });
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    };
    loadLogs();
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const resetPage = (update) => {
    setFilters((current) => ({ ...current, ...update }));
    setPage(1);
  };
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    { day: "2-digit", month: "short", year: "numeric" },
  );
  const weekdayFormatter = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    { weekday: "long" },
  );
  const numberFormatter = new Intl.NumberFormat(
    locale === "id" ? "id-ID" : "en-US",
  );
  const totalPages = meta.totalPages || 0;

  return (
    <div className="flex flex-col gap-5 font-sans">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        <div className="grid items-end gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="grid gap-2 t-size3 font-semibold text-slate-900">
            {t("history.dateRange")}
            <DatePickerRange
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                resetPage({
                  startDate: toDateParam(value?.from),
                  endDate: toDateParam(value?.to),
                });
              }}
            />
          </label>
          <label className="grid gap-2 t-size3 font-semibold text-slate-900">
            {t("history.sortBy")}
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value);
                resetPage({ sort: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {t("history.newestFirst")}
                </SelectItem>
                <SelectItem value="oldest">
                  {t("history.oldestFirst")}
                </SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="relative block">
            <span className="sr-only">{t("history.search")}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("history.search")}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 bp360:pl-9.25 bp400:pl-9.5 md:pl-9.75 lg:pl-10 xl:pl-10.25 2xl:pl-10.5 pr-2.5 py-1.5 bp360:pr-3 bp360:py-2 t-size3 font-medium text-slate-700 outline-none transition focus:border-green-500 focus:ring-3 focus:ring-green-100"
            />
          </label>
          <Button
            onClick={() => resetPage({ search: search.trim() || undefined })}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {t("history.apply")}
          </Button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-225">
            <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center gap-4 px-5 pb-3 t-size3 font-semibold text-slate-900">
              {["date", "meals", "nutritionSummary", "calories", "action"].map(
                (key) => (
                  <span key={key}>{t(`history.columns.${key}`)}</span>
                ),
              )}
            </div>
            <div className="space-y-4">
              {state === "loading" && (
                <p className="px-7 py-12 text-center t-size3 font-medium text-slate-400">
                  {t("history.loading")}
                </p>
              )}
              {state === "error" && (
                <p className="px-7 py-12 text-center t-size3 font-medium text-red-500">
                  {t("history.loadFailed")}
                </p>
              )}
              {state === "ready" && logs.length === 0 && (
                <p className="px-7 py-12 text-center t-size3 font-medium text-slate-400">
                  {t("history.empty")}
                </p>
              )}
              {logs.map((log) => {
                const groupedMeals = (log.meals || [])
                  .flat()
                  .reduce((groups, meal) => {
                    const type = meal.meal_type?.toLowerCase();
                    if (MEAL_CONFIG[type])
                      groups[type] = [...(groups[type] || []), meal.food_name];
                    return groups;
                  }, {});
                return (
                  <article
                    key={log.log_date}
                    className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75 text-green-600" />
                      <div>
                        <p className="t-size2 font-semibold text-slate-900">
                          {dateFormatter.format(new Date(log.log_date))}
                        </p>
                        <p className="t-size1 font-medium text-slate-400">
                          {weekdayFormatter.format(new Date(log.log_date))}
                        </p>
                      </div>
                    </div>
                    <div className="flex min-w-0 divide-x divide-green-300">
                      {Object.entries(groupedMeals).map(([type, names]) => {
                        const Icon = MEAL_CONFIG[type].icon;
                        return (
                          <div
                            key={type}
                            className="min-w-0 flex-1 px-3 first:pl-0"
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                className={`size-5 ${MEAL_CONFIG[type].className}`}
                              />
                              <span className="t-size2 font-semibold text-slate-900">
                                {t(`history.mealTypes.${type}`)}
                              </span>
                            </div>
                            <p className="mt-1 whitespace-normal wrap-break-word t-size1 font-medium text-slate-500">
                              {names.join(" + ")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded bg-green-100 px-2 py-1 t-size1 font-semibold text-green-700">
                        P {numberFormatter.format(log.total_protein_g)}g
                      </span>
                      <span className="rounded bg-amber-100 px-2 py-1 t-size1 font-semibold text-amber-700">
                        F {numberFormatter.format(log.total_fat_g)}g
                      </span>
                      <span className="rounded bg-violet-100 px-2 py-1 t-size1 font-semibold text-violet-700">
                        C {numberFormatter.format(log.total_carbs_g)}g
                      </span>
                    </div>
                    <span className="t-size3 font-semibold text-slate-900">
                      {numberFormatter.format(log.total_calories)} kcal
                    </span>
                    <Button
                      variant="outline"
                      // disabled
                      className="justify-center border-green-600 text-green-600 disabled:opacity-60"
                    >
                      {t("history.viewDetail")}
                      <ChevronRight className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                    </Button>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {state === "ready" && totalPages > 0 && (
          <div className="mt-5 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="t-size2 font-medium text-slate-700">
              {meta.showingText}
            </p>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#pagination"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.max(1, current - 1));
                    }}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((item) => (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#pagination"
                      isActive={item === page}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(item);
                      }}
                      className={
                        item === page
                          ? "border-green-600 bg-green-600 text-white hover:bg-green-700 hover:text-white"
                          : "border border-slate-200"
                      }
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#pagination"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.min(totalPages, current + 1));
                    }}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  );
};
