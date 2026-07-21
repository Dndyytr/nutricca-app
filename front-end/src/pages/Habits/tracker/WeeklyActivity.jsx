import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { MultiSelect } from "../../../components/MultiSelect";
import { Select } from "../../../components/ui/FormComponents";
import { useLocale } from "../../../i18n/locale-context";
import {
  getMasterCardiosByLevel,
  getMasterExercisesByLevel,
  getCurrentWeeklyActivity,
  getWeeklyActivityProgress,
  postWeeklyActivityProgress,
  putCurrentWeeklyCardios,
  putCurrentWeeklyExercises,
  putWeeklyActivityProgress,
} from "../../../services/api";
import { DAYS } from "./constants";

const ActivityImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className="flex size-18 shrink-0 items-center justify-center rounded-lg bg-slate-100 t-size4 font-bold text-slate-400">
        -
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="size-18 shrink-0 rounded-lg object-contain"
    />
  );
};

const ProgressSegments = ({ done, target }) => (
  <div className="flex gap-1.5">
    {Array.from({ length: Math.max(1, target) }, (_, index) => (
      <span
        key={index}
        className={`h-2 min-w-8 flex-1 rounded-full ${index < done ? "bg-green-500" : "border border-slate-300 bg-white"}`}
      />
    ))}
  </div>
);

export const WeeklyActivity = () => {
  const { t } = useLocale();
  const [exerciseLevel, setExerciseLevel] = useState("beginner");
  const [cardioLevel, setCardioLevel] = useState("beginner");
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [cardioOptions, setCardioOptions] = useState([]);
  const [exerciseIds, setExerciseIds] = useState([]);
  const [cardioIds, setCardioIds] = useState([]);
  const [activityId, setActivityId] = useState(null);
  const [progress, setProgress] = useState([]);
  const [exerciseStatus, setExerciseStatus] = useState("idle");
  const [cardioStatus, setCardioStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const loadProgress = async (id) => {
    const response = await getWeeklyActivityProgress(id);
    setProgress(response.data?.progress || []);
  };

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const response = await getCurrentWeeklyActivity();
        const activity = response.data?.activity;
        if (!activity) return;
        setActivityId(activity.id);
        setExerciseLevel(
          activity.exercise_level || activity.level || "beginner",
        );
        setCardioLevel(activity.cardio_level || activity.level || "beginner");
        setExerciseIds(
          (activity.exercises || []).map((item) => String(item.id)),
        );
        setCardioIds((activity.cardios || []).map((item) => String(item.id)));
        await loadProgress(activity.id);
      } catch {
        setMessage(t("habits.weeklyActivity.loadFailed"));
      }
    };

    loadActivity();
  }, [t]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const exercises = await getMasterExercisesByLevel(exerciseLevel);
        setExerciseOptions(exercises.data?.exercises || []);
      } catch {
        setMessage(t("habits.weeklyActivity.loadFailed"));
      }
    };

    loadOptions();
  }, [exerciseLevel, t]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const cardios = await getMasterCardiosByLevel(cardioLevel);
        setCardioOptions(cardios.data?.cardios || []);
      } catch {
        setMessage(t("habits.weeklyActivity.loadFailed"));
      }
    };

    loadOptions();
  }, [cardioLevel, t]);

  const selectedExercises = useMemo(
    () =>
      exerciseOptions.filter((item) => exerciseIds.includes(String(item.id))),
    [exerciseIds, exerciseOptions],
  );
  const selectedCardios = useMemo(
    () => cardioOptions.filter((item) => cardioIds.includes(String(item.id))),
    [cardioIds, cardioOptions],
  );

  const optionFor = (items) =>
    items.map((item) => ({ value: String(item.id), label: item.name }));

  const itemProgress = (type, itemId) =>
    progress.filter(
      (item) => item.type === type && String(item.item_id) === String(itemId),
    );

  const saveExercises = async () => {
    if (!exerciseIds.length) {
      setExerciseStatus("error");
      setMessage(t("habits.weeklyActivity.selectExerciseRequired"));
      return;
    }

    setExerciseStatus("saving");
    setMessage("");
    try {
      const response = await putCurrentWeeklyExercises({
        level: exerciseLevel,
        selected_exercise_ids: exerciseIds.map(Number),
      });
      const activity = response.data?.activity;
      setActivityId(activity.id);
      await loadProgress(activity.id);
      setExerciseStatus("success");
      setMessage(t("habits.weeklyActivity.exerciseSaved"));
    } catch (error) {
      setExerciseStatus("error");
      setMessage(
        error.response?.data?.message || t("habits.weeklyActivity.saveFailed"),
      );
    }
  };

  const saveCardios = async () => {
    if (!cardioIds.length) {
      setCardioStatus("error");
      setMessage(t("habits.weeklyActivity.selectCardioRequired"));
      return;
    }

    setCardioStatus("saving");
    setMessage("");
    try {
      const response = await putCurrentWeeklyCardios({
        level: cardioLevel,
        selected_cardio_ids: cardioIds.map(Number),
      });
      const activity = response.data?.activity;
      setActivityId(activity.id);
      await loadProgress(activity.id);
      setCardioStatus("success");
      setMessage(t("habits.weeklyActivity.cardioSaved"));
    } catch (error) {
      setCardioStatus("error");
      setMessage(
        error.response?.data?.message || t("habits.weeklyActivity.saveFailed"),
      );
    }
  };

  const saveProgress = async (type, item, dayOfWeek, payload) => {
    if (!activityId) return;
    const existing = itemProgress(type, item.id).find(
      (entry) => entry.day_of_week === dayOfWeek,
    );
    const response = existing
      ? await putWeeklyActivityProgress(activityId, existing.id, payload)
      : await postWeeklyActivityProgress(activityId, payload);
    if (response.data?.progress) await loadProgress(activityId);
  };

  const toggleExercise = async (item, dayOfWeek) => {
    const existing = itemProgress("exercise", item.id).find(
      (entry) => entry.day_of_week === dayOfWeek,
    );
    try {
      await saveProgress("exercise", item, dayOfWeek, {
        exercise_id: Number(item.id),
        day_of_week: dayOfWeek,
        completed: !existing?.completed,
        reps_done: Number(item.target_reps) || 1,
      });
    } catch (error) {
      setExerciseStatus("error");
      setMessage(
        error.response?.data?.message ||
          t("habits.weeklyActivity.progressFailed"),
      );
    }
  };

  const saveCardioDistance = async (item, dayOfWeek, value) => {
    const distance = Number(value);
    if (!distance) return;
    try {
      await saveProgress("cardio", item, dayOfWeek, {
        cardio_id: Number(item.id),
        day_of_week: dayOfWeek,
        completed: true,
        distance_done: distance,
      });
    } catch (error) {
      setCardioStatus("error");
      setMessage(
        error.response?.data?.message ||
          t("habits.weeklyActivity.progressFailed"),
      );
    }
  };

  const toggleCardio = async (item, dayOfWeek) => {
    const existing = itemProgress("cardio", item.id).find(
      (entry) => entry.day_of_week === dayOfWeek,
    );
    const distance =
      Number(existing?.distance_done) ||
      Number(item.target_distance) / (Number(item.duration_days) || 5);

    try {
      await saveProgress("cardio", item, dayOfWeek, {
        cardio_id: Number(item.id),
        day_of_week: dayOfWeek,
        completed: !existing?.completed,
        distance_done: distance,
      });
    } catch (error) {
      setCardioStatus("error");
      setMessage(
        error.response?.data?.message ||
          t("habits.weeklyActivity.progressFailed"),
      );
    }
  };

  const calories = progress.reduce(
    (total, item) => {
      if (!item.completed) return total;
      const key = item.type === "exercise" ? "exercise" : "cardio";
      total[key] += Number(item.calories_burned) || 0;
      total.total += Number(item.calories_burned) || 0;
      return total;
    },
    { exercise: 0, cardio: 0, total: 0 },
  );
  const calorieBarMax = Math.max(calories.exercise, calories.cardio, 1);

  const renderExerciseCard = (item) => {
    const done = itemProgress("exercise", item.id).filter(
      (entry) => entry.completed,
    ).length;
    const target = Number(item.duration_days) || 5;
    return (
      <div
        key={item.id}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[max-content_minmax(210px,0.8fr)_minmax(200px,0.75fr)]"
      >
        <div className="flex items-center gap-4 max-w shrink-0">
          <ActivityImage src={item.icon_url} alt={item.name} />
          <div>
            <h3 className="t-size4 font-bold text-slate-900">{item.name}</h3>
            <p className="t-size2 font-medium text-slate-400">
              {t("habits.weeklyActivity.target")}
            </p>
            <p className="t-size2 font-medium text-slate-500">
              {t("habits.weeklyActivity.exerciseTarget", {
                reps: item.target_reps || "-",
                days: target,
              })}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-7 lg:grid-cols-4 xl:grid-cols-7 gap-1.5 self-center">
          {DAYS.map((day, index) => {
            const completed = itemProgress("exercise", item.id).some(
              (entry) => entry.day_of_week === index && entry.completed,
            );
            return (
              <button
                key={day}
                type="button"
                disabled={!activityId}
                onClick={() => toggleExercise(item, index)}
                className={`flex h-5 items-center justify-center rounded border px-0.5 text-center t-size1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${completed ? "border-green-600 bg-green-600 text-white" : "border-slate-800 bg-white text-slate-700 hover:border-green-500"}`}
              >
                {t(`habits.weeklyExercise.days.${day}`)}
              </button>
            );
          })}
        </div>
        <div className="space-y-2 self-center">
          <p className="t-size3 font-medium text-slate-400">
            {t("habits.weeklyActivity.progress")}
          </p>
          <p className="t-size4 font-medium text-slate-900">
            {t("habits.weeklyActivity.daysDone", { done, target })}
          </p>
          <ProgressSegments done={done} target={target} />
        </div>
      </div>
    );
  };

  const renderCardioCard = (item) => {
    const target = Number(item.duration_days) || 5;
    const done = itemProgress("cardio", item.id).filter(
      (entry) => entry.completed,
    ).length;
    return (
      <div
        key={item.id}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[max-content_minmax(210px,0.8fr)_minmax(200px,0.75fr)]"
      >
        <div className="flex items-center gap-4 w-max shrink-0">
          <ActivityImage src={item.icon_url} alt={item.name} />
          <div>
            <h3 className="t-size4 font-bold text-slate-900">{item.name}</h3>
            <p className="t-size2 font-medium text-slate-400">
              {t("habits.weeklyActivity.weeklyTarget")}
            </p>
            <p className="t-size2 font-medium text-slate-500">
              {item.target_distance || "-"} km
            </p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 self-center lg:grid-cols-4 xl:grid-cols-7">
          {DAYS.map((day, index) => {
            const entry = itemProgress("cardio", item.id).find(
              (progressItem) => progressItem.day_of_week === index,
            );
            return (
              <label key={day} className="min-w-0 space-y-1">
                <button
                  type="button"
                  disabled={!activityId}
                  onClick={() => toggleCardio(item, index)}
                  className={`flex h-5 w-full items-center justify-center rounded border px-0.5 text-center t-size1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${entry?.completed ? "border-green-600 bg-green-600 text-white" : "border-slate-800 bg-white text-slate-700 hover:border-green-500"}`}
                >
                  {t(`habits.weeklyExercise.days.${day}`)}
                </button>
                <input
                  key={`${item.id}-${index}-${entry?.id || "new"}`}
                  type="number"
                  min="0"
                  step="0.1"
                  disabled={!activityId}
                  defaultValue={entry?.distance_done || ""}
                  onBlur={(event) =>
                    saveCardioDistance(item, index, event.target.value)
                  }
                  className="h-5 w-full rounded border border-slate-800 bg-white px-0.5 text-center t-size1 font-medium text-slate-700 outline-none focus:border-green-500 disabled:bg-slate-100"
                />
              </label>
            );
          })}
        </div>
        <div className="space-y-2 self-center">
          <p className="t-size3 font-medium text-slate-400">
            {t("habits.weeklyActivity.progress")}
          </p>
          <p className="t-size4 font-medium text-slate-900">
            {t("habits.weeklyActivity.daysDone", { done, target })}
          </p>
          <ProgressSegments done={done} target={target} />
        </div>
      </div>
    );
  };

  const exerciseLevelName = t(
    `habits.weeklyExercise.levels.${exerciseLevel}.name`,
  );
  const cardioLevelName = t(`habits.weeklyExercise.levels.${cardioLevel}.name`);
  const hasError = exerciseStatus === "error" || cardioStatus === "error";

  return (
    <div className="space-y-6">
      {message && (
        <p
          className={`rounded-lg px-3 py-2 t-size2 font-medium ${hasError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
        >
          {message}
        </p>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="t-size5 font-bold text-slate-900">
              {t("habits.weeklyActivity.exercise")}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="t-size2 font-medium text-slate-500">
                {t("habits.weeklyExercise.level")}
              </span>
              <Select
                value={exerciseLevel}
                onChange={(event) => {
                  setExerciseLevel(event.target.value);
                  setExerciseIds([]);
                }}
                className="w-34 bg-white px-2 py-1"
              >
                {["beginner", "intermediate", "advanced"].map((item) => (
                  <option key={item} value={item}>
                    {t(`habits.weeklyExercise.levels.${item}.name`)}
                  </option>
                ))}
              </Select>
              <span className="rounded-full bg-amber-50 px-2 py-1 t-size1 font-semibold text-amber-700">
                {exerciseLevelName}
              </span>
            </div>
          </div>
          <div className="w-19 bp360:w-20 bp400:w-21 md:w-22 lg:w-23 xl:w-24 2xl:w-25 shrink-0">
            <img
              src="/img/HabitTracker/exercise_icon.png"
              alt="Weekly Exercise"
              className="w-full"
            />
          </div>
        </div>
        <div className="mb-5 flex justify-between items-center gap-2 flex-wrap rounded-xl bg-slate-50 p-4">
          <div className="flex flex-col gap-0.5">
            <p className="t-size3 font-bold text-slate-900">
              {t("habits.weeklyActivity.chooseActivity")}
            </p>
            <p className="t-size2 font-medium text-slate-400">
              {t("habits.weeklyActivity.exerciseHint")}
            </p>
          </div>
          <MultiSelect
            options={optionFor(exerciseOptions)}
            value={exerciseIds}
            onValueChange={setExerciseIds}
            placeholder={t("habits.weeklyActivity.selectExercise")}
          />
        </div>
        <div className="space-y-3">
          {selectedExercises.map(renderExerciseCard)}
        </div>
        <button
          type="button"
          onClick={saveExercises}
          disabled={exerciseStatus === "saving"}
          className="mt-3 ml-auto flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 t-size2 font-semibold text-white hover:bg-green-700 disabled:bg-green-300"
        >
          {exerciseStatus === "saving" && (
            <LoaderCircle className="size-3 animate-spin" />
          )}
          {exerciseStatus === "saving"
            ? t("habits.weeklyActivity.saving")
            : t("habits.weeklyActivity.saveExercise")}
        </button>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="t-size5 font-bold text-slate-900">
              {t("habits.weeklyActivity.cardio")}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="t-size2 font-medium text-slate-500">
                {t("habits.weeklyExercise.level")}
              </span>
              <Select
                value={cardioLevel}
                onChange={(event) => {
                  setCardioLevel(event.target.value);
                  setCardioIds([]);
                }}
                className="w-34 bg-white px-2 py-1"
              >
                {["beginner", "intermediate", "advanced"].map((item) => (
                  <option key={item} value={item}>
                    {t(`habits.weeklyExercise.levels.${item}.name`)}
                  </option>
                ))}
              </Select>
              <span className="rounded-full bg-amber-50 px-2 py-1 t-size1 font-semibold text-amber-700">
                {cardioLevelName}
              </span>
            </div>
          </div>
          <div className="w-19 bp360:w-20 bp400:w-21 md:w-22 lg:w-23 xl:w-24 2xl:w-25 shrink-0">
            <img
              src="/img/HabitTracker/cardio_icon.png"
              alt="Weekly Exercise"
              className="w-full"
            />
          </div>
        </div>
        <div className="mb-5 flex justify-between items-center gap-2 flex-wrap rounded-xl bg-slate-50 p-4">
          <div className="flex flex-col gap-0.5">
            <p className="t-size3 font-bold text-slate-900">
              {t("habits.weeklyActivity.chooseActivity")}
            </p>
            <p className="t-size2 font-medium text-slate-400">
              {t("habits.weeklyActivity.cardioHint")}
            </p>
          </div>
          <MultiSelect
            options={optionFor(cardioOptions)}
            value={cardioIds}
            onValueChange={setCardioIds}
            placeholder={t("habits.weeklyActivity.selectCardio")}
          />
        </div>
        <div className="space-y-3">{selectedCardios.map(renderCardioCard)}</div>
        <button
          type="button"
          onClick={saveCardios}
          disabled={cardioStatus === "saving"}
          className="mt-3 flex ml-auto items-center gap-2 rounded-lg bg-green-600 px-4 py-2 t-size2 font-semibold text-white hover:bg-green-700 disabled:bg-green-300"
        >
          {cardioStatus === "saving" && (
            <LoaderCircle className="size-3 animate-spin" />
          )}
          {cardioStatus === "saving"
            ? t("habits.weeklyActivity.saving")
            : t("habits.weeklyActivity.saveCardio")}
        </button>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-3 t-size3 font-bold text-slate-800">
          {t("habits.weeklyActivity.calorieBalance")}
        </h2>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {[
            ["exercise", calories.exercise],
            ["cardio", calories.cardio],
            ["total", calories.total],
          ].map(([key, value]) => (
            <div key={key} className={key === "total" ? "sm:text-right" : ""}>
              <p
                className={`t-size8 font-bold ${key === "total" ? "text-green-600" : "text-slate-800"}`}
              >
                {Math.round(value)}
              </p>
              <p className="t-size2 font-medium text-slate-400">
                {t(`habits.weeklyActivity.calories.${key}`)}
              </p>
              {key !== "total" && (
                <div className="mt-2 h-1 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(value / calorieBarMax) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
