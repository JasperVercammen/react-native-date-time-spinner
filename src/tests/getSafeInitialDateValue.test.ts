import { getSafeInitialDateValue } from "../utils/getSafeInitialDateValue";

describe("getSafeInitialDateValue", () => {
    const bounds = { minimumYear: 1950, maximumYear: 2050 };

    it("falls back to current date when undefined", () => {
        const value = getSafeInitialDateValue(
            undefined,
            bounds,
            new Date(2000, 0, 15)
        );

        expect(value).toEqual({ day: 15, month: 1, year: 2000 });
    });

    it("clamps out-of-range years", () => {
        const value = getSafeInitialDateValue(
            { year: 1800, month: 6, day: 10 },
            bounds,
            new Date()
        );

        expect(value.year).toBe(1950);
    });

    it("adjusts days to the target month length", () => {
        const value = getSafeInitialDateValue(
            { year: 2024, month: 2, day: 31 },
            bounds,
            new Date()
        );

        expect(value.day).toBeLessThanOrEqual(29);
        expect(value.month).toBe(2);
    });
});
