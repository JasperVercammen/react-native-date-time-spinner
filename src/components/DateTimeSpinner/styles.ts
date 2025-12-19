import { StyleSheet } from "react-native";
import type { TextStyle, ViewStyle } from "react-native";

export type CustomDateTimeSpinnerStyles = {
    backgroundColor?: string;
    dateTimeSpacer?: ViewStyle;
    disabledPickerContainer?: ViewStyle;
    disabledPickerItem?: TextStyle;
    durationScrollFlatList?: ViewStyle;
    durationScrollFlatListContainer?: ViewStyle;
    durationScrollFlatListContentContainer?: ViewStyle;
    pickerContainer?: ViewStyle & { backgroundColor?: string };
    pickerGradientOverlay?: ViewStyle;
    pickerItem?: TextStyle;
    pickerItemContainer?: ViewStyle & { height?: number };
    pickerLabel?: TextStyle;
    pickerLabelContainer?: ViewStyle;
    text?: TextStyle;
    theme?: "light" | "dark";
    timeSeparatorContainer?: ViewStyle;
    timeSeparatorText?: TextStyle;
};

const DARK_MODE_BACKGROUND_COLOR = "#232323";
const DARK_MODE_TEXT_COLOR = "#E9E9E9";
const LIGHT_MODE_BACKGROUND_COLOR = "#FFFFFF";
const LIGHT_MODE_TEXT_COLOR = "#1B1B1B";

export const generateStyles = (
    customStyles: CustomDateTimeSpinnerStyles | undefined
) =>
    StyleSheet.create({
        pickerContainer: {
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor:
                customStyles?.backgroundColor ??
                (customStyles?.theme === "dark"
                    ? DARK_MODE_BACKGROUND_COLOR
                    : LIGHT_MODE_BACKGROUND_COLOR),
            ...customStyles?.pickerContainer,
        },
        pickerLabelContainer: {
            position: "absolute",
            right: 4,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            minWidth:
                (customStyles?.pickerLabel?.fontSize ??
                    customStyles?.text?.fontSize ??
                    25) * 0.65,
            ...customStyles?.pickerLabelContainer,
        },
        pickerLabel: {
            fontSize: 18,
            fontWeight: "bold",
            marginTop:
                (customStyles?.pickerItem?.fontSize ??
                    customStyles?.text?.fontSize ??
                    25) / 6,
            color:
                customStyles?.theme === "dark"
                    ? DARK_MODE_TEXT_COLOR
                    : LIGHT_MODE_TEXT_COLOR,
            ...customStyles?.text,
            ...customStyles?.pickerLabel,
        },
        pickerItemContainer: {
            flexDirection: "row",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal:
                customStyles?.pickerItemContainer?.paddingHorizontal ?? 12,
            ...customStyles?.pickerItemContainer,
        },
        pickerItem: {
            textAlignVertical: "center",
            fontSize: 25,
            color:
                customStyles?.theme === "dark"
                    ? DARK_MODE_TEXT_COLOR
                    : LIGHT_MODE_TEXT_COLOR,
            ...customStyles?.text,
            ...customStyles?.pickerItem,
        },
        disabledPickerContainer: {
            opacity: 0.4,
            ...customStyles?.disabledPickerContainer,
        },
        disabledPickerItem: {
            opacity: 0.2,
            ...customStyles?.disabledPickerItem,
        },
        maskedView: {
            flex: 1,
        },
        pickerGradientOverlay: {
            position: "absolute",
            width: "100%",
            height: "100%",
            ...customStyles?.pickerGradientOverlay,
        },
        durationScrollFlatList: {
            minWidth: 1,
            ...customStyles?.durationScrollFlatList,
        },
        durationScrollFlatListContainer: {
            overflow: "visible",
            ...customStyles?.durationScrollFlatListContainer,
        },
        durationScrollFlatListContentContainer: {
            ...customStyles?.durationScrollFlatListContentContainer,
        },
        dateTimeSpacer: {
            width: 12,
            ...customStyles?.dateTimeSpacer,
        },
        timeSeparatorContainer: {
            justifyContent: "center",
            alignItems: "center",
            ...customStyles?.timeSeparatorContainer,
        },
        timeSeparatorText: {
            fontSize: 24,
            color:
                customStyles?.theme === "dark"
                    ? DARK_MODE_TEXT_COLOR
                    : LIGHT_MODE_TEXT_COLOR,
            ...customStyles?.text,
            ...customStyles?.timeSeparatorText,
        },
    });
