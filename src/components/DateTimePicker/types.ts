import type { RefObject } from "react";

import type { View } from "react-native";

import type { LinearGradientProps } from "../DurationScroll/types";

import type { CustomDateTimePickerStyles } from "./styles";

export type DateTimePickerValue = {
    date: Date;
    day: number;
    hour: number;
    minute: number;
    month: number;
    year: number;
};

export interface DateTimePickerRef {
    latestValue: RefObject<DateTimePickerValue>;
    reset: (options?: { animated?: boolean }) => void;
    setValue: (
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
    ) => void;
}

export type DateTimePickerProps = {
    LinearGradient?: any;
    MaskedView?: any;
    allowFontScaling?: boolean;
    columnOrder?: Array<"day" | "month" | "year">;
    dateTimeOrder?: Array<"date" | "hour" | "minute">;
    dateTimeSpacing?: number;
    decelerationRate?: number | "normal" | "fast";
    disableInfiniteScroll?: boolean;
    formatDateLabel?: (date: Date) => string;
    formatDateToParts?: (date: Date) => {
        day?: string;
        month?: string;
        year?: string;
    };
    initialValue?:
        | Date
        | {
              day?: number;
              hour?: number;
              minute?: number;
              month?: number;
              year?: number;
          };
    maxDate?: Date;
    minDate?: Date;
    mode?: "date" | "datetime";
    onDateChange?: (value: DateTimePickerValue) => void;
    padDayWithZero?: boolean;
    padHourWithZero?: boolean;
    padMinuteWithZero?: boolean;
    padMonthWithZero?: boolean;
    padWithNItems?: number;
    pickerContainerProps?: React.ComponentProps<typeof View>;
    pickerFeedback?: () => void | Promise<void>;
    pickerGradientOverlayProps?: Partial<LinearGradientProps>;
    repeatNumbersNTimes?: number;
    styles?: CustomDateTimePickerStyles;
    timeSeparator?: string;
};
