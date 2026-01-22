import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

import { View, Text, Platform } from "react-native";

import {
    getConstrainedDateParts,
    getDaysInMonthForParts,
    getSafeInitialDateValue,
    type DateInput,
} from "../../utils/getSafeInitialDateValue";
import { useScreenReaderEnabled } from "../../utils/useScreenReaderEnabled";
import DurationScroll from "../DurationScroll";
import type { DurationScrollRef } from "../DurationScroll";

import { generateStyles } from "./styles";
import type { DateTimeSpinnerProps, DateTimeSpinnerRef } from "./types";

const DateTimeSpinner = forwardRef<DateTimeSpinnerRef, DateTimeSpinnerProps>(
    (props, ref) => {
        const {
            accessibilityLabel,
            accessibilityLabels,
            allowFontScaling = false,
            columnOrder = ["day", "month", "year"],
            dateTimeOrder = ["date", "hour", "minute"],
            dateTimeSpacing = 12,
            decelerationRate = 0.88,
            disableInfiniteScroll = false,
            formatDateLabel,
            formatDateToParts,
            initialValue,
            LinearGradient,
            MaskedView,
            maxDate: maxDateProp,
            minDate: minDateProp,
            mode = "date",
            onDateChange,
            padDayWithZero = true,
            padHourWithZero = true,
            padMinuteWithZero = true,
            padMonthWithZero = true,
            padWithNItems = 2,
            pickerContainerProps,
            pickerFeedback,
            pickerGradientOverlayProps,
            repeatNumbersNTimes = 3,
            styles: customStyles,
            timeSeparator = ":",
        } = props;

        const isScreenReaderEnabled = useScreenReaderEnabled();

        const now = useMemo(() => new Date(), []);
        const isDateTimeMode = mode === "datetime";
        const DAY_IN_MS = 24 * 60 * 60 * 1000;

        const addDays = useCallback((date: Date, days: number) => {
            const next = new Date(date);
            next.setDate(next.getDate() + days);
            return next;
        }, []);

        const clampHourValue = useCallback(
            (value: number) => Math.min(Math.max(Math.round(value), 0), 23),
            []
        );

        const clampMinuteValue = useCallback(
            (value: number) => Math.min(Math.max(Math.round(value), 0), 59),
            []
        );

        const normalizeDate = (date: Date) =>
            new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const resolvedMinDateTime = useMemo(() => {
            const fallback = new Date(now.getFullYear() - 50, 0, 1, 0, 0, 0, 0);
            return minDateProp ? new Date(minDateProp) : fallback;
        }, [minDateProp, now]);

        const resolvedMaxDateTime = useMemo(() => {
            const fallback = new Date(
                now.getFullYear() + 50,
                11,
                31,
                23,
                59,
                59,
                999
            );
            return maxDateProp ? new Date(maxDateProp) : fallback;
        }, [maxDateProp, now]);

        const [minDateTime, maxDateTime] = useMemo(() => {
            if (resolvedMinDateTime.getTime() > resolvedMaxDateTime.getTime()) {
                return [resolvedMaxDateTime, resolvedMinDateTime];
            }
            return [resolvedMinDateTime, resolvedMaxDateTime];
        }, [resolvedMaxDateTime, resolvedMinDateTime]);

        const minDate = useMemo(
            () => normalizeDate(minDateTime),
            [minDateTime]
        );
        const maxDate = useMemo(
            () => normalizeDate(maxDateTime),
            [maxDateTime]
        );

        const bounds = useMemo(
            () => ({
                minimumYear: minDate.getFullYear(),
                maximumYear: maxDate.getFullYear(),
            }),
            [maxDate, minDate]
        );

        const clampDateToRange = useCallback(
            (date: Date) =>
                new Date(
                    Math.min(
                        Math.max(date.getTime(), minDate.getTime()),
                        maxDate.getTime()
                    )
                ),
            [maxDate, minDate]
        );

        const getTimeBoundsForDate = useCallback(
            (date: Date) => {
                const normalized = normalizeDate(date);
                const minDay = minDate.getTime();
                const maxDay = maxDate.getTime();

                let minHour = 0;
                let minMinute = 0;
                let maxHour = 23;
                let maxMinute = 59;

                if (normalized.getTime() === minDay) {
                    minHour = minDateTime.getHours();
                    minMinute = minDateTime.getMinutes();
                }

                if (normalized.getTime() === maxDay) {
                    maxHour = maxDateTime.getHours();
                    maxMinute = maxDateTime.getMinutes();
                }

                if (minHour > maxHour) {
                    minHour = maxHour;
                    minMinute = 0;
                }

                if (minHour === maxHour && minMinute > maxMinute) {
                    minMinute = maxMinute;
                }

                return {
                    maxHour,
                    maxMinute,
                    minHour,
                    minMinute,
                };
            },
            [maxDate, maxDateTime, minDate, minDateTime]
        );

        const clampTimeToBounds = useCallback(
            (date: Date, hour: number, minute: number) => {
                const { maxHour, maxMinute, minHour, minMinute } =
                    getTimeBoundsForDate(date);

                let safeHour = clampHourValue(hour);
                let safeMinute = clampMinuteValue(minute);

                if (safeHour < minHour) {
                    safeHour = minHour;
                    safeMinute = Math.max(safeMinute, minMinute);
                } else if (safeHour > maxHour) {
                    safeHour = maxHour;
                    safeMinute = Math.min(safeMinute, maxMinute);
                }

                if (safeHour === minHour && safeMinute < minMinute) {
                    safeMinute = minMinute;
                }

                if (safeHour === maxHour && safeMinute > maxMinute) {
                    safeMinute = maxMinute;
                }

                return {
                    hour: safeHour,
                    minute: safeMinute,
                };
            },
            [clampHourValue, clampMinuteValue, getTimeBoundsForDate]
        );

        const safeInitialValue = useMemo(() => {
            const parts = getSafeInitialDateValue(
                initialValue as DateInput,
                bounds,
                now
            );
            const clampedDate = clampDateToRange(
                new Date(parts.year, parts.month - 1, parts.day)
            );
            return {
                day: clampedDate.getDate(),
                month: clampedDate.getMonth() + 1,
                year: clampedDate.getFullYear(),
            };
        }, [bounds, clampDateToRange, initialValue, now]);

        const initialDateForRange = useMemo(
            () =>
                clampDateToRange(
                    new Date(
                        safeInitialValue.year,
                        safeInitialValue.month - 1,
                        safeInitialValue.day
                    )
                ),
            [clampDateToRange, safeInitialValue]
        );

        const safeInitialTime = useMemo(() => {
            const fallback = now;
            const raw =
                initialValue instanceof Date
                    ? {
                          hour: initialValue.getHours(),
                          minute: initialValue.getMinutes(),
                      }
                    : initialValue ?? {};

            const baseDate = isDateTimeMode
                ? initialDateForRange
                : new Date(
                      safeInitialValue.year,
                      safeInitialValue.month - 1,
                      safeInitialValue.day
                  );

            const clampedTime = clampTimeToBounds(
                baseDate,
                typeof raw.hour === "number" && !isNaN(raw.hour)
                    ? raw.hour
                    : fallback.getHours(),
                typeof raw.minute === "number" && !isNaN(raw.minute)
                    ? raw.minute
                    : fallback.getMinutes()
            );

            return clampedTime;
        }, [
            clampTimeToBounds,
            initialDateForRange,
            initialValue,
            isDateTimeMode,
            now,
            safeInitialValue.day,
            safeInitialValue.month,
            safeInitialValue.year,
        ]);

        const totalDays = useMemo(
            () =>
                Math.max(
                    Math.round(
                        (normalizeDate(maxDate).getTime() -
                            normalizeDate(minDate).getTime()) /
                            DAY_IN_MS
                    ) + 1,
                    1
                ),
            [DAY_IN_MS, maxDate, minDate]
        );

        const clampDateIndex = useCallback(
            (index: number) => Math.min(Math.max(index, 0), totalDays - 1),
            [totalDays]
        );

        const initialDateIndex = useMemo(
            () =>
                clampDateIndex(
                    Math.round(
                        (initialDateForRange.getTime() - minDate.getTime()) /
                            DAY_IN_MS
                    )
                ),
            [DAY_IN_MS, clampDateIndex, initialDateForRange, minDate]
        );

        const styles = useMemo(
            () => generateStyles(customStyles),
            [customStyles]
        );

        const onDateChangeRef =
            useRef<DateTimeSpinnerProps["onDateChange"]>(onDateChange);

        useEffect(() => {
            onDateChangeRef.current = onDateChange;
        }, [onDateChange]);

        const [selectedDay, setSelectedDay] = useState(safeInitialValue.day);
        const [selectedMonth, setSelectedMonth] = useState(
            safeInitialValue.month
        );
        const [selectedYear, setSelectedYear] = useState(safeInitialValue.year);
        const [selectedHour, setSelectedHour] = useState(safeInitialTime.hour);
        const [selectedMinute, setSelectedMinute] = useState(
            safeInitialTime.minute
        );
        const [selectedDateIndex, setSelectedDateIndex] =
            useState(initialDateIndex);

        const latestValue = useRef({
            day: safeInitialValue.day,
            hour: safeInitialTime.hour,
            minute: safeInitialTime.minute,
            month: safeInitialValue.month,
            year: safeInitialValue.year,
            date: new Date(
                safeInitialValue.year,
                safeInitialValue.month - 1,
                safeInitialValue.day,
                safeInitialTime.hour,
                safeInitialTime.minute
            ),
        });

        const updateLatestValue = useCallback(
            (next: typeof latestValue.current) => {
                const prev = latestValue.current;
                const isSame =
                    prev.day === next.day &&
                    prev.month === next.month &&
                    prev.year === next.year &&
                    prev.hour === next.hour &&
                    prev.minute === next.minute &&
                    prev.date.getTime() === next.date.getTime();

                if (isSame) return;

                latestValue.current = next;
                onDateChangeRef.current?.(next);
            },
            []
        );

        const safePadWithNItems = useMemo(() => {
            if (padWithNItems < 0 || isNaN(padWithNItems)) {
                return 0;
            }

            const maxPadWithNItems = 10;

            if (padWithNItems > maxPadWithNItems) {
                return maxPadWithNItems;
            }

            return Math.round(padWithNItems);
        }, [padWithNItems]);

        const getDateFromIndex = useCallback(
            (index: number) => addDays(minDate, clampDateIndex(index)),
            [addDays, clampDateIndex, minDate]
        );

        const dateScrollRef = useRef<DurationScrollRef>(null);
        const dayScrollRef = useRef<DurationScrollRef>(null);
        const hourScrollRef = useRef<DurationScrollRef>(null);
        const monthScrollRef = useRef<DurationScrollRef>(null);
        const minuteScrollRef = useRef<DurationScrollRef>(null);
        const yearScrollRef = useRef<DurationScrollRef>(null);

        useEffect(() => {
            if (!isDateTimeMode) return;
            setSelectedDateIndex((prev) => clampDateIndex(prev));
        }, [clampDateIndex, isDateTimeMode]);

        useEffect(() => {
            if (!isDateTimeMode) return;

            const clamped = clampTimeToBounds(
                getDateFromIndex(selectedDateIndex),
                selectedHour,
                selectedMinute
            );

            if (clamped.hour !== selectedHour) {
                setSelectedHour(clamped.hour);
                hourScrollRef.current?.setValue(clamped.hour, {
                    animated: false,
                });
            }

            if (clamped.minute !== selectedMinute) {
                setSelectedMinute(clamped.minute);
                minuteScrollRef.current?.setValue(clamped.minute, {
                    animated: false,
                });
            }
        }, [
            clampTimeToBounds,
            getDateFromIndex,
            isDateTimeMode,
            selectedDateIndex,
            selectedHour,
            selectedMinute,
        ]);

        const formatDateColumnValue = useCallback(
            (index: number) => {
                const date = getDateFromIndex(index);
                if (formatDateLabel) {
                    return formatDateLabel(date);
                }

                const year = date.getFullYear();
                const month = `${date.getMonth() + 1}`.padStart(2, "0");
                const day = `${date.getDate()}`.padStart(2, "0");
                return `${year}-${month}-${day}`;
            },
            [formatDateLabel, getDateFromIndex]
        );

        const currentDateForTimeBounds = useMemo(
            () =>
                isDateTimeMode
                    ? getDateFromIndex(selectedDateIndex)
                    : new Date(selectedYear, selectedMonth - 1, selectedDay),
            [
                getDateFromIndex,
                isDateTimeMode,
                selectedDateIndex,
                selectedDay,
                selectedMonth,
                selectedYear,
            ]
        );

        const timeBounds = useMemo(
            () => getTimeBoundsForDate(currentDateForTimeBounds),
            [currentDateForTimeBounds, getTimeBoundsForDate]
        );

        const hourLimit = useMemo(
            () => ({ min: timeBounds.minHour, max: timeBounds.maxHour }),
            [timeBounds.maxHour, timeBounds.minHour]
        );

        const minuteLimit = useMemo(() => {
            let min = 0;
            let max = 59;

            if (selectedHour === timeBounds.minHour) {
                min = timeBounds.minMinute;
            }

            if (selectedHour === timeBounds.maxHour) {
                max = timeBounds.maxMinute;
            }

            if (timeBounds.minHour === timeBounds.maxHour) {
                min = Math.max(min, timeBounds.minMinute);
                max = Math.min(max, timeBounds.maxMinute);
            }

            if (min > max) {
                min = max;
            }

            return { min, max };
        }, [
            selectedHour,
            timeBounds.maxHour,
            timeBounds.maxMinute,
            timeBounds.minHour,
            timeBounds.minMinute,
        ]);

        const formatHour = useMemo(() => {
            const fallback = (value: number) =>
                padHourWithZero
                    ? value.toString().padStart(2, "0")
                    : value.toString();

            return fallback;
        }, [padHourWithZero]);

        const formatMinute = useMemo(() => {
            const fallback = (value: number) =>
                padMinuteWithZero
                    ? value.toString().padStart(2, "0")
                    : value.toString();

            return fallback;
        }, [padMinuteWithZero]);

        const handleHourChange = useCallback(
            (value: number) => {
                if (!isDateTimeMode) {
                    setSelectedHour(clampHourValue(value));
                    return;
                }

                const clamped = clampTimeToBounds(
                    currentDateForTimeBounds,
                    value,
                    selectedMinute
                );

                setSelectedHour(clamped.hour);

                if (clamped.minute !== selectedMinute) {
                    setSelectedMinute(clamped.minute);
                    minuteScrollRef.current?.setValue(clamped.minute, {
                        animated: false,
                    });
                }
            },
            [
                clampHourValue,
                clampTimeToBounds,
                currentDateForTimeBounds,
                isDateTimeMode,
                selectedMinute,
            ]
        );

        const handleMinuteChange = useCallback(
            (value: number) => {
                if (!isDateTimeMode) {
                    setSelectedMinute(clampMinuteValue(value));
                    return;
                }

                const clamped = clampTimeToBounds(
                    currentDateForTimeBounds,
                    selectedHour,
                    value
                );

                if (clamped.hour !== selectedHour) {
                    setSelectedHour(clamped.hour);
                    hourScrollRef.current?.setValue(clamped.hour, {
                        animated: false,
                    });
                }

                setSelectedMinute(clamped.minute);
            },
            [
                clampMinuteValue,
                clampTimeToBounds,
                currentDateForTimeBounds,
                isDateTimeMode,
                selectedHour,
            ]
        );

        const formatDay = useMemo(() => {
            const fallback = (value: number) =>
                padDayWithZero
                    ? value.toString().padStart(2, "0")
                    : value.toString();

            if (!formatDateToParts) {
                return fallback;
            }

            return (value: number) => {
                const safeDay = Math.min(
                    value,
                    getDaysInMonthForParts(selectedYear, selectedMonth)
                );
                const parts = formatDateToParts(
                    new Date(selectedYear, selectedMonth - 1, safeDay)
                );
                return parts.day ?? fallback(value);
            };
        }, [formatDateToParts, padDayWithZero, selectedMonth, selectedYear]);

        const formatMonth = useMemo(() => {
            const fallback = (value: number) =>
                padMonthWithZero
                    ? value.toString().padStart(2, "0")
                    : value.toString();

            if (!formatDateToParts) {
                return fallback;
            }

            return (value: number) => {
                const safeDay = Math.min(
                    selectedDay,
                    getDaysInMonthForParts(selectedYear, value)
                );
                const parts = formatDateToParts(
                    new Date(selectedYear, value - 1, safeDay)
                );
                return parts.month ?? fallback(value);
            };
        }, [formatDateToParts, padMonthWithZero, selectedDay, selectedYear]);

        const formatYear = useMemo(() => {
            const fallback = (value: number) => value.toString();

            if (!formatDateToParts) {
                return fallback;
            }

            return (value: number) => {
                const safeDay = Math.min(
                    selectedDay,
                    getDaysInMonthForParts(value, selectedMonth)
                );
                const parts = formatDateToParts(
                    new Date(value, selectedMonth - 1, safeDay)
                );
                return parts.year ?? fallback(value);
            };
        }, [formatDateToParts, selectedDay, selectedMonth]);

        const getAccessibilityValueText = useCallback(() => {
            if (isDateTimeMode) {
                const date = getDateFromIndex(selectedDateIndex);
                const dateStr = formatDateLabel
                    ? formatDateLabel(date)
                    : `${date.getFullYear()}-${String(
                          date.getMonth() + 1
                      ).padStart(2, "0")}-${String(date.getDate()).padStart(
                          2,
                          "0"
                      )}`;

                const hourStr = padHourWithZero
                    ? String(selectedHour).padStart(2, "0")
                    : String(selectedHour);
                const minuteStr = padMinuteWithZero
                    ? String(selectedMinute).padStart(2, "0")
                    : String(selectedMinute);

                return `${dateStr} ${hourStr}:${minuteStr}`;
            } else {
                // Regular date mode
                const dayStr = formatDay(selectedDay);
                const monthStr = formatMonth(selectedMonth);
                const yearStr = formatYear(selectedYear);

                // Build date string based on column order
                const parts: { [key: string]: string } = {
                    day: dayStr,
                    month: monthStr,
                    year: yearStr,
                };

                return columnOrder.map((col) => parts[col]).join(" ");
            }
        }, [
            isDateTimeMode,
            getDateFromIndex,
            selectedDateIndex,
            formatDateLabel,
            selectedHour,
            selectedMinute,
            padHourWithZero,
            padMinuteWithZero,
            selectedDay,
            selectedMonth,
            selectedYear,
            formatDay,
            formatMonth,
            formatYear,
            columnOrder,
        ]);

        const daysInMonth = useMemo(
            () => getDaysInMonthForParts(selectedYear, selectedMonth),
            [selectedMonth, selectedYear]
        );

        const monthLimits = useMemo(() => {
            let min = 1;
            let max = 12;

            if (selectedYear === minDate.getFullYear()) {
                min = minDate.getMonth() + 1;
            }
            if (selectedYear === maxDate.getFullYear()) {
                max = maxDate.getMonth() + 1;
            }

            return { min, max };
        }, [maxDate, minDate, selectedYear]);

        const dayLimits = useMemo(() => {
            let min = 1;
            let max = daysInMonth;

            if (
                selectedYear === minDate.getFullYear() &&
                selectedMonth === minDate.getMonth() + 1
            ) {
                min = minDate.getDate();
            }

            if (
                selectedYear === maxDate.getFullYear() &&
                selectedMonth === maxDate.getMonth() + 1
            ) {
                max = Math.min(max, maxDate.getDate());
            }

            return { min, max };
        }, [daysInMonth, maxDate, minDate, selectedMonth, selectedYear]);

        useEffect(() => {
            if (mode !== "date") return;
            if (selectedMonth < monthLimits.min) {
                setSelectedMonth(monthLimits.min);
                monthScrollRef.current?.setValue(monthLimits.min, {
                    animated: false,
                });
            } else if (selectedMonth > monthLimits.max) {
                setSelectedMonth(monthLimits.max);
                monthScrollRef.current?.setValue(monthLimits.max, {
                    animated: false,
                });
            }
        }, [mode, monthLimits.max, monthLimits.min, selectedMonth]);

        useEffect(() => {
            if (mode !== "date") return;
            if (selectedDay > dayLimits.max) {
                setSelectedDay(dayLimits.max);
                dayScrollRef.current?.setValue(dayLimits.max, {
                    animated: false,
                });
            } else if (selectedDay < dayLimits.min) {
                setSelectedDay(dayLimits.min);
                dayScrollRef.current?.setValue(dayLimits.min, {
                    animated: false,
                });
            }
        }, [dayLimits.max, dayLimits.min, mode, selectedDay]);

        useEffect(() => {
            if (mode !== "date") return;

            const constrained = getConstrainedDateParts(
                { day: selectedDay, month: selectedMonth, year: selectedYear },
                bounds
            );

            const clampedDate = clampDateToRange(
                new Date(
                    constrained.year,
                    constrained.month - 1,
                    constrained.day
                )
            );
            const dateWithTime = new Date(
                clampedDate.getFullYear(),
                clampedDate.getMonth(),
                clampedDate.getDate(),
                selectedHour,
                selectedMinute
            );

            updateLatestValue({
                day: dateWithTime.getDate(),
                month: dateWithTime.getMonth() + 1,
                year: dateWithTime.getFullYear(),
                hour: selectedHour,
                minute: selectedMinute,
                date: dateWithTime,
            });
        }, [
            bounds,
            clampDateToRange,
            mode,
            selectedDay,
            selectedHour,
            selectedMinute,
            selectedMonth,
            selectedYear,
            updateLatestValue,
        ]);

        useEffect(() => {
            if (!isDateTimeMode) return;

            const date = getDateFromIndex(selectedDateIndex);
            const dateWithTime = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                selectedHour,
                selectedMinute
            );

            updateLatestValue({
                day: dateWithTime.getDate(),
                month: dateWithTime.getMonth() + 1,
                year: dateWithTime.getFullYear(),
                hour: selectedHour,
                minute: selectedMinute,
                date: dateWithTime,
            });
        }, [
            getDateFromIndex,
            isDateTimeMode,
            selectedDateIndex,
            selectedHour,
            selectedMinute,
            updateLatestValue,
        ]);

        const reset = (options?: { animated?: boolean }) => {
            if (isDateTimeMode) {
                setSelectedDateIndex(initialDateIndex);
                setSelectedHour(safeInitialTime.hour);
                setSelectedMinute(safeInitialTime.minute);
                dateScrollRef.current?.setValue(initialDateIndex, options);
                hourScrollRef.current?.setValue(safeInitialTime.hour, options);
                minuteScrollRef.current?.setValue(
                    safeInitialTime.minute,
                    options
                );
                return;
            }

            setSelectedDay(safeInitialValue.day);
            setSelectedMonth(safeInitialValue.month);
            setSelectedYear(safeInitialValue.year);
            setSelectedHour(safeInitialTime.hour);
            setSelectedMinute(safeInitialTime.minute);
            dayScrollRef.current?.setValue(safeInitialValue.day, options);
            monthScrollRef.current?.setValue(safeInitialValue.month, options);
            yearScrollRef.current?.setValue(safeInitialValue.year, options);
        };

        const setValue = (
            value:
                | Date
                | {
                      day?: number;
                      hour?: number;
                      minute?: number;
                      month?: number;
                      year?: number;
                  },
            options?: { animated?: boolean }
        ) => {
            if (isDateTimeMode) {
                const currentDate = getDateFromIndex(selectedDateIndex);
                const nextValue = getSafeInitialDateValue(
                    value instanceof Date
                        ? value
                        : {
                              day: value.day ?? currentDate.getDate(),
                              month: value.month ?? currentDate.getMonth() + 1,
                              year: value.year ?? currentDate.getFullYear(),
                          },
                    bounds,
                    currentDate
                );

                const clampedDate = clampDateToRange(
                    new Date(nextValue.year, nextValue.month - 1, nextValue.day)
                );

                const nextIndex = clampDateIndex(
                    Math.round(
                        (clampedDate.getTime() - minDate.getTime()) / DAY_IN_MS
                    )
                );

                const nextHourRaw =
                    value instanceof Date
                        ? value.getHours()
                        : value.hour ?? selectedHour;

                const nextMinuteRaw =
                    value instanceof Date
                        ? value.getMinutes()
                        : value.minute ?? selectedMinute;

                const clampedTime = clampTimeToBounds(
                    clampedDate,
                    nextHourRaw,
                    nextMinuteRaw
                );

                setSelectedDateIndex(nextIndex);
                setSelectedHour(clampedTime.hour);
                setSelectedMinute(clampedTime.minute);
                dateScrollRef.current?.setValue(nextIndex, options);
                hourScrollRef.current?.setValue(clampedTime.hour, options);
                minuteScrollRef.current?.setValue(clampedTime.minute, options);

                return;
            }

            const nextValue = getSafeInitialDateValue(
                value instanceof Date
                    ? value
                    : {
                          day: value.day ?? selectedDay,
                          month: value.month ?? selectedMonth,
                          year: value.year ?? selectedYear,
                      },
                bounds,
                new Date(selectedYear, selectedMonth - 1, selectedDay)
            );

            const clamped = clampDateToRange(
                new Date(nextValue.year, nextValue.month - 1, nextValue.day)
            );

            const day = clamped.getDate();
            const month = clamped.getMonth() + 1;
            const year = clamped.getFullYear();
            const hour = clampHourValue(
                value instanceof Date
                    ? value.getHours()
                    : value.hour ?? selectedHour
            );
            const minute = clampMinuteValue(
                value instanceof Date
                    ? value.getMinutes()
                    : value.minute ?? selectedMinute
            );

            setSelectedDay(day);
            setSelectedMonth(month);
            setSelectedYear(year);
            setSelectedHour(hour);
            setSelectedMinute(minute);
            dayScrollRef.current?.setValue(day, options);
            monthScrollRef.current?.setValue(month, options);
            yearScrollRef.current?.setValue(year, options);
        };

        useImperativeHandle(ref, () => ({
            latestValue,
            reset,
            setValue,
        }));

        const columns = useMemo(() => {
            if (isDateTimeMode) {
                const order = dateTimeOrder.length
                    ? dateTimeOrder
                    : ["date", "hour", "minute"];
                const hasHour = order.includes("hour");
                const hasMinute = order.includes("minute");
                const insertSeparatorAfterHour =
                    hasHour &&
                    hasMinute &&
                    order.indexOf("hour") < order.indexOf("minute");
                const hasDate = order.includes("date");
                const hasTime = hasHour || hasMinute;

                const renderDateTimeSpacer = (index: number) => {
                    if (!hasDate || !hasTime) return null;
                    const hasTimeAfterDate = order
                        .slice(index + 1)
                        .some((part) => part === "hour" || part === "minute");
                    if (!hasTimeAfterDate) return null;

                    return (
                        <View
                            key="date-time-spacer"
                            style={[
                                styles.dateTimeSpacer,
                                { width: dateTimeSpacing },
                            ]}
                        />
                    );
                };

                return order.map((part, index) => {
                    if (part === "date") {
                        return (
                            <React.Fragment key="date">
                                <DurationScroll
                                    ref={dateScrollRef}
                                    accessibilityHint={
                                        accessibilityLabels?.hint
                                    }
                                    accessibilityLabel={
                                        accessibilityLabels?.date ?? "Date"
                                    }
                                    allowFontScaling={allowFontScaling}
                                    decelerationRate={decelerationRate}
                                    disableInfiniteScroll={
                                        disableInfiniteScroll
                                    }
                                    formatValue={formatDateColumnValue}
                                    initialValue={selectedDateIndex}
                                    interval={1}
                                    isScreenReaderEnabled={
                                        isScreenReaderEnabled
                                    }
                                    limit={{ min: 0, max: totalDays - 1 }}
                                    LinearGradient={LinearGradient}
                                    MaskedView={MaskedView}
                                    maximumValue={totalDays - 1}
                                    onDurationChange={setSelectedDateIndex}
                                    padNumbersWithZero={false}
                                    padWithNItems={safePadWithNItems}
                                    pickerFeedback={pickerFeedback}
                                    pickerGradientOverlayProps={
                                        pickerGradientOverlayProps
                                    }
                                    repeatNumbersNTimes={repeatNumbersNTimes}
                                    repeatNumbersNTimesNotExplicitlySet={
                                        props.repeatNumbersNTimes === undefined
                                    }
                                    startFrom={0}
                                    styles={styles}
                                    testID="duration-scroll-date"
                                />
                                {renderDateTimeSpacer(index)}
                            </React.Fragment>
                        );
                    }

                    if (part === "hour") {
                        return (
                            <React.Fragment key="hour-with-separator">
                                <DurationScroll
                                    ref={hourScrollRef}
                                    accessibilityHint={
                                        accessibilityLabels?.hint
                                    }
                                    accessibilityLabel={
                                        accessibilityLabels?.hour ?? "Hour"
                                    }
                                    allowFontScaling={allowFontScaling}
                                    decelerationRate={decelerationRate}
                                    disableInfiniteScroll={
                                        disableInfiniteScroll
                                    }
                                    formatValue={formatHour}
                                    initialValue={selectedHour}
                                    interval={1}
                                    isScreenReaderEnabled={
                                        isScreenReaderEnabled
                                    }
                                    limit={hourLimit}
                                    LinearGradient={LinearGradient}
                                    MaskedView={MaskedView}
                                    maximumValue={23}
                                    onDurationChange={handleHourChange}
                                    padNumbersWithZero={false}
                                    padWithNItems={safePadWithNItems}
                                    pickerFeedback={pickerFeedback}
                                    pickerGradientOverlayProps={
                                        pickerGradientOverlayProps
                                    }
                                    repeatNumbersNTimes={repeatNumbersNTimes}
                                    repeatNumbersNTimesNotExplicitlySet={
                                        props.repeatNumbersNTimes === undefined
                                    }
                                    startFrom={0}
                                    styles={styles}
                                    testID="duration-scroll-hour"
                                />
                                {insertSeparatorAfterHour ? (
                                    <View
                                        key="time-separator"
                                        accessible={false}
                                        importantForAccessibility="no"
                                        style={styles.timeSeparatorContainer}>
                                        <Text style={styles.timeSeparatorText}>
                                            {timeSeparator}
                                        </Text>
                                    </View>
                                ) : null}
                            </React.Fragment>
                        );
                    }

                    // minute
                    return (
                        <DurationScroll
                            key="minute"
                            ref={minuteScrollRef}
                            accessibilityHint={accessibilityLabels?.hint}
                            accessibilityLabel={
                                accessibilityLabels?.minute ?? "Minute"
                            }
                            allowFontScaling={allowFontScaling}
                            decelerationRate={decelerationRate}
                            disableInfiniteScroll={disableInfiniteScroll}
                            formatValue={formatMinute}
                            initialValue={selectedMinute}
                            interval={1}
                            isScreenReaderEnabled={isScreenReaderEnabled}
                            limit={minuteLimit}
                            LinearGradient={LinearGradient}
                            MaskedView={MaskedView}
                            maximumValue={59}
                            onDurationChange={handleMinuteChange}
                            padNumbersWithZero={false}
                            padWithNItems={safePadWithNItems}
                            pickerFeedback={pickerFeedback}
                            pickerGradientOverlayProps={
                                pickerGradientOverlayProps
                            }
                            repeatNumbersNTimes={repeatNumbersNTimes}
                            repeatNumbersNTimesNotExplicitlySet={
                                props.repeatNumbersNTimes === undefined
                            }
                            startFrom={0}
                            styles={styles}
                            testID="duration-scroll-minute"
                        />
                    );
                });
            }

            const order = columnOrder.length
                ? columnOrder
                : ["day", "month", "year"];

            return order.map((part) => {
                if (part === "day") {
                    return (
                        <DurationScroll
                            key="day"
                            ref={dayScrollRef}
                            accessibilityHint={accessibilityLabels?.hint}
                            accessibilityLabel={
                                accessibilityLabels?.day ?? "Day"
                            }
                            allowFontScaling={allowFontScaling}
                            decelerationRate={decelerationRate}
                            disableInfiniteScroll={disableInfiniteScroll}
                            formatValue={formatDay}
                            initialValue={selectedDay}
                            interval={1}
                            isScreenReaderEnabled={isScreenReaderEnabled}
                            limit={dayLimits}
                            LinearGradient={LinearGradient}
                            MaskedView={MaskedView}
                            maximumValue={dayLimits.max}
                            onDurationChange={setSelectedDay}
                            padNumbersWithZero={padDayWithZero}
                            padWithNItems={safePadWithNItems}
                            pickerFeedback={pickerFeedback}
                            pickerGradientOverlayProps={
                                pickerGradientOverlayProps
                            }
                            repeatNumbersNTimes={repeatNumbersNTimes}
                            repeatNumbersNTimesNotExplicitlySet={
                                props.repeatNumbersNTimes === undefined
                            }
                            startFrom={dayLimits.min}
                            styles={styles}
                            testID="duration-scroll-day"
                        />
                    );
                }

                if (part === "month") {
                    return (
                        <DurationScroll
                            key="month"
                            ref={monthScrollRef}
                            accessibilityHint={accessibilityLabels?.hint}
                            accessibilityLabel={
                                accessibilityLabels?.month ?? "Month"
                            }
                            allowFontScaling={allowFontScaling}
                            decelerationRate={decelerationRate}
                            disableInfiniteScroll={disableInfiniteScroll}
                            formatValue={formatMonth}
                            initialValue={selectedMonth}
                            interval={1}
                            isScreenReaderEnabled={isScreenReaderEnabled}
                            limit={monthLimits}
                            LinearGradient={LinearGradient}
                            MaskedView={MaskedView}
                            maximumValue={monthLimits.max}
                            onDurationChange={setSelectedMonth}
                            padNumbersWithZero={padMonthWithZero}
                            padWithNItems={safePadWithNItems}
                            pickerFeedback={pickerFeedback}
                            pickerGradientOverlayProps={
                                pickerGradientOverlayProps
                            }
                            repeatNumbersNTimes={repeatNumbersNTimes}
                            repeatNumbersNTimesNotExplicitlySet={
                                props.repeatNumbersNTimes === undefined
                            }
                            startFrom={monthLimits.min}
                            styles={styles}
                            testID="duration-scroll-month"
                        />
                    );
                }

                // year
                return (
                    <DurationScroll
                        key="year"
                        ref={yearScrollRef}
                        accessibilityHint={accessibilityLabels?.hint}
                        accessibilityLabel={accessibilityLabels?.year ?? "Year"}
                        allowFontScaling={allowFontScaling}
                        decelerationRate={decelerationRate}
                        disableInfiniteScroll={disableInfiniteScroll}
                        formatValue={formatYear}
                        initialValue={selectedYear}
                        interval={1}
                        isScreenReaderEnabled={isScreenReaderEnabled}
                        limit={{
                            min: bounds.minimumYear,
                            max: bounds.maximumYear,
                        }}
                        LinearGradient={LinearGradient}
                        MaskedView={MaskedView}
                        maximumValue={bounds.maximumYear}
                        onDurationChange={setSelectedYear}
                        padNumbersWithZero={false}
                        padWithNItems={safePadWithNItems}
                        pickerFeedback={pickerFeedback}
                        pickerGradientOverlayProps={pickerGradientOverlayProps}
                        repeatNumbersNTimes={repeatNumbersNTimes}
                        repeatNumbersNTimesNotExplicitlySet={
                            props.repeatNumbersNTimes === undefined
                        }
                        startFrom={bounds.minimumYear}
                        styles={styles}
                        testID="duration-scroll-year"
                    />
                );
            });
        }, [
            isDateTimeMode,
            columnOrder,
            dateTimeOrder,
            styles,
            dateTimeSpacing,
            accessibilityLabels?.hint,
            accessibilityLabels?.minute,
            accessibilityLabels?.date,
            accessibilityLabels?.hour,
            accessibilityLabels?.year,
            accessibilityLabels?.day,
            accessibilityLabels?.month,
            allowFontScaling,
            decelerationRate,
            disableInfiniteScroll,
            formatMinute,
            selectedMinute,
            isScreenReaderEnabled,
            minuteLimit,
            LinearGradient,
            MaskedView,
            handleMinuteChange,
            safePadWithNItems,
            pickerFeedback,
            pickerGradientOverlayProps,
            repeatNumbersNTimes,
            props.repeatNumbersNTimes,
            formatDateColumnValue,
            selectedDateIndex,
            totalDays,
            formatHour,
            selectedHour,
            hourLimit,
            handleHourChange,
            timeSeparator,
            formatYear,
            selectedYear,
            bounds.minimumYear,
            bounds.maximumYear,
            formatDay,
            selectedDay,
            dayLimits,
            padDayWithZero,
            formatMonth,
            selectedMonth,
            monthLimits,
            padMonthWithZero,
        ]);

        return (
            <View
                {...pickerContainerProps}
                accessibilityLabel={
                    accessibilityLabel ??
                    accessibilityLabels?.picker ??
                    (mode === "datetime"
                        ? "Date and time picker"
                        : "Date picker")
                }
                accessibilityValue={{
                    text: getAccessibilityValueText(),
                }}
                accessible={Platform.OS === "android"}
                style={styles.pickerContainer}
                testID="date-spinner">
                {columns}
            </View>
        );
    }
);

export default React.memo(DateTimeSpinner);
