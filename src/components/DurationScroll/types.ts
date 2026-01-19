/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RefObject } from "react";

import type { View } from "react-native";

import type { generateStyles } from "../DateTimeSpinner/styles";

export interface DurationScrollProps {
    FlatList?: any;
    LinearGradient?: any;
    MaskedView?: any;
    accessibilityHint?: string;
    accessibilityLabel?: string;
    allowFontScaling?: boolean;
    decelerationRate?: number | "normal" | "fast";
    disableInfiniteScroll?: boolean;
    formatValue?: (value: number) => string;
    initialValue?: number;
    interval: number;
    isDisabled?: boolean;
    limit?: Limit;
    maximumValue: number;
    onDurationChange: (value: number) => void;
    padNumbersWithZero?: boolean;
    padWithNItems: number;
    pickerFeedback?: () => void | Promise<void>;
    pickerGradientOverlayProps?: Partial<LinearGradientProps>;
    repeatNumbersNTimes?: number;
    repeatNumbersNTimesNotExplicitlySet: boolean;
    startFrom?: number;
    styles: ReturnType<typeof generateStyles>;
    testID?: string;
}

export interface DurationScrollRef {
    latestDuration: RefObject<number>;
    reset: (options?: { animated?: boolean }) => void;
    setValue: (value: number, options?: { animated?: boolean }) => void;
}

type LinearGradientPoint = {
    x: number;
    y: number;
};

export type LinearGradientProps = React.ComponentProps<typeof View> & {
    colors: string[];
    end?: LinearGradientPoint | null;
    locations?: number[] | null;
    start?: LinearGradientPoint | null;
};

export type Limit = {
    max?: number;
    min?: number;
};

// legacy audio types removed; keeping file lean for date picker use cases
