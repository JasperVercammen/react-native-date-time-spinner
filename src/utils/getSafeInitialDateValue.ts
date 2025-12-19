export type DateInput =
    | Date
    | {
          day?: number;
          month?: number;
          year?: number;
      }
    | undefined;

const getDaysInMonth = (year: number, month: number) => {
    // month is 1-indexed here
    return new Date(year, month, 0).getDate();
};

export const getSafeInitialDateValue = (
    initialValue: DateInput,
    bounds: { maximumYear: number; minimumYear: number },
    fallbackDate: Date = new Date()
) => {
    const rawValue =
        initialValue instanceof Date
            ? {
                  day: initialValue.getDate(),
                  month: initialValue.getMonth() + 1,
                  year: initialValue.getFullYear(),
              }
            : initialValue ?? {};

    const clampYear = (year?: number) => {
        const safeYear =
            typeof year === "number" && !isNaN(year)
                ? year
                : fallbackDate.getFullYear();
        return Math.min(
            Math.max(safeYear, bounds.minimumYear),
            bounds.maximumYear
        );
    };

    const safeYear = clampYear(rawValue.year);

    const clampMonth = (month?: number) => {
        const safeMonth =
            typeof month === "number" && !isNaN(month)
                ? month
                : fallbackDate.getMonth() + 1;
        return Math.min(Math.max(safeMonth, 1), 12);
    };

    const safeMonth = clampMonth(rawValue.month);
    const daysInMonth = getDaysInMonth(safeYear, safeMonth);

    const clampDay = (day?: number) => {
        const safeDay =
            typeof day === "number" && !isNaN(day)
                ? day
                : fallbackDate.getDate();
        return Math.min(Math.max(safeDay, 1), daysInMonth);
    };

    const safeDay = clampDay(rawValue.day);

    return {
        day: safeDay,
        month: safeMonth,
        year: safeYear,
    };
};

export const getConstrainedDateParts = (
    value: { day: number; month: number; year: number },
    bounds: { maximumYear: number; minimumYear: number }
) => {
    const safeYear = Math.min(
        Math.max(value.year, bounds.minimumYear),
        bounds.maximumYear
    );
    const safeMonth = Math.min(Math.max(value.month, 1), 12);
    const daysInMonth = getDaysInMonth(safeYear, safeMonth);
    const safeDay = Math.min(Math.max(value.day, 1), daysInMonth);

    return {
        day: safeDay,
        month: safeMonth,
        year: safeYear,
        daysInMonth,
    };
};

export const getDaysInMonthForParts = (year: number, month: number) =>
    getDaysInMonth(year, month);
