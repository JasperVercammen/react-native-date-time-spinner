import React from "react";

import { render } from "@testing-library/react-native";
import { FlatList } from "react-native";

import DatePicker from "../components/DateTimePicker";

describe("DatePicker", () => {
    it("renders day, month and year columns", () => {
        const { getByTestId } = render(<DatePicker />);

        expect(getByTestId("date-picker")).toBeDefined();
        expect(getByTestId("duration-scroll-day")).toBeDefined();
        expect(getByTestId("duration-scroll-month")).toBeDefined();
        expect(getByTestId("duration-scroll-year")).toBeDefined();
    });

    it("uses a custom FlatList when provided", () => {
        const CustomFlatList = (props) => (
            <FlatList {...props} testID="custom-flat-list" />
        );

        const { queryAllByTestId } = render(
            <DatePicker FlatList={CustomFlatList} />
        );

        expect(queryAllByTestId("custom-flat-list")).toHaveLength(3);
    });

    it("accepts and clamps a custom initial value", () => {
        const { getByTestId } = render(
            <DatePicker
                initialValue={{ day: 31, month: 2, year: 1900 }}
                minimumYear={1950}
                maximumYear={2050}
            />
        );

        expect(getByTestId("date-picker")).toBeDefined();
    });
});
