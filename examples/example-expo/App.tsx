import React, { useState } from "react";

import { format, subYears } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { DateTimeSpinner } from "react-native-date-time-spinner";
import type { CustomDateTimeSpinnerStyles } from "react-native-date-time-spinner";

const minDate = new Date(2020, 0, 1);
const maxDate = new Date(2025, 11, 31, 11, 55);

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [boundedDate, setBoundedDate] = useState(new Date(2024, 5, 15));
    const [selectedDateTime, setSelectedDateTime] = useState(
        new Date(2025, 11, 15, 14, 30)
    );

    return (
        <ScrollView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <Text style={styles.title}>Spinner Date Picker</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>Simple</Text>
                    <Text style={styles.value}>{formatDate(selectedDate)}</Text>
                    <View style={styles.pickerContainer}>
                        <DateTimeSpinner
                            disableInfiniteScroll={true}
                            formatDateToParts={(date) => ({
                                day: format(date, "dd"),
                                month: format(date, "MMMM"),
                                year: format(date, "yyyy"),
                            })}
                            initialValue={selectedDate}
                            LinearGradient={LinearGradient}
                            onDateChange={({ date }) => setSelectedDate(date)}
                            pickerGradientOverlayProps={{
                                locations: [0, 0.5, 0.5, 1],
                            }}
                            repeatNumbersNTimes={1}
                            styles={datePickerStyles}
                        />
                        <View accessible={false} style={styles.selected}></View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Date + time</Text>
                    <Text style={styles.value}>
                        {format(selectedDateTime, "PP p")}
                    </Text>
                    <View style={styles.pickerContainer}>
                        <DateTimeSpinner
                            dateTimeOrder={["date", "hour", "minute"]}
                            formatDateLabel={(date) =>
                                format(date, "eee, MMM d")
                            }
                            initialValue={selectedDateTime}
                            maxDate={maxDate}
                            minDate={minDate}
                            mode="datetime"
                            onDateChange={({ date }) =>
                                setSelectedDateTime(date)
                            }
                            padHourWithZero
                            padMinuteWithZero
                            styles={{
                                pickerItem: styles.pickerItem,
                                pickerLabel: styles.pickerLabel,
                            }}
                        />
                        <View accessible={false} style={styles.selected}></View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>With min/max bounds</Text>
                    <Text style={styles.value}>{formatDate(boundedDate)}</Text>
                    <DateTimeSpinner
                        initialValue={boundedDate}
                        maxDate={maxDate}
                        minDate={minDate}
                        onDateChange={({ date }) => setBoundedDate(date)}
                        styles={{
                            pickerItem: styles.pickerItem,
                            pickerLabel: styles.pickerLabel,
                        }}
                    />
                    <Text style={styles.helper}>
                        Allowed range: {formatDate(minDate)} –{" "}
                        {formatDate(maxDate)}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Custom formatting & order</Text>
                    <Text style={styles.value}>
                        {format(boundedDate, "do MMM yyyy")}
                    </Text>
                    <DateTimeSpinner
                        columnOrder={["month", "day", "year"]}
                        formatDateToParts={(date) => ({
                            day: format(date, "do"),
                            month: format(date, "MMM"),
                            year: format(date, "''yy"),
                        })}
                        initialValue={boundedDate}
                        maxDate={maxDate}
                        minDate={minDate}
                        onDateChange={({ date }) => setBoundedDate(date)}
                        styles={{
                            pickerItem: styles.pickerItem,
                            pickerLabel: styles.pickerLabel,
                        }}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

export const datePickerStyles: CustomDateTimeSpinnerStyles = {
    pickerContainer: {
        marginLeft: 0,
        marginRight: 0,
        justifyContent: "center",
    },
    pickerItem: {
        color: "#2B2B2B",
        fontFamily: "Serif",
    },
    pickerItemContainer: {
        height: 36,
        // width: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontFamily: "Noto Serif",
        fontSize: 22,
    },
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    pickerContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    selected: {
        borderColor: "#1F5E73",
        borderRadius: 12,
        borderWidth: 2,
        height: 40,
        pointerEvents: "none",
        position: "absolute",
        width: 300,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 24,
        color: "#111",
    },
    section: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        color: "#555",
        marginBottom: 12,
    },
    pickerItem: {
        fontSize: 20,
    },
    pickerLabel: {
        fontSize: 16,
        color: "#666",
    },
    helper: {
        marginTop: 8,
        fontSize: 14,
        color: "#777",
    },
});
