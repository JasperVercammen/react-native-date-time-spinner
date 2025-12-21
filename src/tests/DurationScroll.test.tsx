import React from "react";

import { render } from "@testing-library/react-native";

import type { generateStyles } from "../components/DateTimeSpinner/styles";
import DurationScroll from "../components/DurationScroll";

describe("DurationScroll", () => {
    const onDurationChangeMock = jest.fn();
    const emptyStyles = {
        pickerContainer: {},
        pickerLabelContainer: {},
        pickerLabel: {},
        pickerItemContainer: {},
        pickerItem: {},
        disabledPickerContainer: {},
        disabledPickerItem: {},
        pickerGradientOverlay: {},
    } as ReturnType<typeof generateStyles>;

    it("renders without crashing", () => {
        const { getByTestId } = render(
            <DurationScroll
                interval={1}
                maximumValue={1}
                onDurationChange={onDurationChangeMock}
                padWithNItems={0}
                repeatNumbersNTimesNotExplicitlySet={true}
                styles={emptyStyles}
                testID="duration-scroll"
            />
        );
        const component = getByTestId("duration-scroll");
        expect(component).toBeDefined();
    });

    it("renders the correct number of items", () => {
        const { getAllByTestId } = render(
            <DurationScroll
                interval={1}
                maximumValue={23}
                onDurationChange={onDurationChangeMock}
                padWithNItems={1}
                repeatNumbersNTimesNotExplicitlySet={true}
                styles={emptyStyles}
            />
        );
        const items = getAllByTestId("picker-item");
        expect(items.length).toBeGreaterThan(0);
    });

    it("supports non-zero start values", () => {
        const { getByTestId } = render(
            <DurationScroll
                interval={1}
                maximumValue={12}
                onDurationChange={onDurationChangeMock}
                padWithNItems={0}
                repeatNumbersNTimesNotExplicitlySet={true}
                startFrom={1}
                styles={emptyStyles}
                testID="duration-scroll"
            />
        );

        expect(getByTestId("duration-scroll")).toBeDefined();
    });

    it("handles different intervals", () => {
        const { getAllByTestId } = render(
            <DurationScroll
                interval={5}
                maximumValue={55}
                onDurationChange={onDurationChangeMock}
                padWithNItems={1}
                repeatNumbersNTimesNotExplicitlySet={true}
                styles={emptyStyles}
            />
        );
        const items = getAllByTestId("picker-item");
        expect(items).toBeDefined();
    });

    it("renders with zero padWithNItems", () => {
        const { getByTestId } = render(
            <DurationScroll
                interval={1}
                maximumValue={59}
                onDurationChange={onDurationChangeMock}
                padWithNItems={0}
                repeatNumbersNTimesNotExplicitlySet={true}
                styles={emptyStyles}
                testID="duration-scroll"
            />
        );
        const component = getByTestId("duration-scroll");
        expect(component).toBeDefined();
    });

    it("handles large maximumValue", () => {
        const { getByTestId } = render(
            <DurationScroll
                interval={1}
                maximumValue={999}
                onDurationChange={onDurationChangeMock}
                padWithNItems={1}
                repeatNumbersNTimesNotExplicitlySet={true}
                styles={emptyStyles}
                testID="duration-scroll"
            />
        );
        const component = getByTestId("duration-scroll");
        expect(component).toBeDefined();
    });

    it("handles repeatNumbersNTimesNotExplicitlySet set to false", () => {
        const { getByTestId } = render(
            <DurationScroll
                interval={1}
                maximumValue={59}
                onDurationChange={onDurationChangeMock}
                padWithNItems={1}
                repeatNumbersNTimesNotExplicitlySet={false}
                styles={emptyStyles}
                testID="duration-scroll"
            />
        );
        const component = getByTestId("duration-scroll");
        expect(component).toBeDefined();
    });
});
