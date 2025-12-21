import { getAdjustedLimit } from "../utils/getAdjustedLimit";

describe("getAdjustedLimit", () => {
    it("defaults to the full range starting from startFrom", () => {
        const result = getAdjustedLimit(undefined, 31, 1, 1);

        expect(result).toEqual({ min: 1, max: 31 });
    });

    it("clamps values inside provided bounds", () => {
        const result = getAdjustedLimit({ min: 10, max: 40 }, 50, 1, 1);

        expect(result).toEqual({ min: 10, max: 40 });
    });

    it("guards against inverted limits", () => {
        const result = getAdjustedLimit({ min: 50, max: 10 }, 20, 1, 0);

        expect(result).toEqual({ min: 0, max: 19 });
    });

    it("respects intervals when computing max", () => {
        const result = getAdjustedLimit(undefined, 76, 1, 1950);

        expect(result.max).toBe(2025);
        expect(result.min).toBe(1950);
    });
});
