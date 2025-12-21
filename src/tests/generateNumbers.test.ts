import { generate12HourNumbers, generateNumbers } from "../utils/generateNumbers";
describe("Test", () => {
    describe("generateNumbers", () => {
        it("supports custom starting values", () => {
            const result = generateNumbers(3, {
                interval: 1,
                padWithNItems: 0,
                repeatNTimes: 1,
                startFrom: 1,
                disableInfiniteScroll: true,
            });

            expect(result).toEqual([" 1", " 2", " 3"]);
        });

        it("applies padding when infinite scroll is disabled", () => {
            const result = generateNumbers(2, {
                interval: 1,
                padWithNItems: 2,
                repeatNTimes: 1,
                disableInfiniteScroll: true,
            });

            expect(result.slice(0, 2)).toEqual(["", ""]);
            expect(result.slice(-2)).toEqual(["", ""]);
        });

        it("pads with zeros when requested", () => {
            const result = generateNumbers(3, {
                interval: 1,
                padWithNItems: 0,
                repeatNTimes: 1,
                padNumbersWithZero: true,
                startFrom: 8,
                disableInfiniteScroll: true,
            });

            expect(result).toEqual(["08", "09", "10"]);
        });

        it("repeats sequences when repeatNTimes > 1", () => {
            const result = generateNumbers(2, {
                interval: 1,
                padWithNItems: 0,
                repeatNTimes: 3,
                disableInfiniteScroll: false,
            });

            expect(result).toEqual([" 0", " 1", " 0", " 1", " 0", " 1"]);
        });

        it("generates hours with 6-hour interval", () => {
            const result = generate12HourNumbers({
                interval: 6,
                padWithNItems: 0,
                disableInfiniteScroll: false,
            });
            expect(result).toHaveLength(4);
            expect(result[0]).toBe(" 0 AM");
            expect(result[1]).toBe(" 6 AM");
            expect(result[2]).toBe("12 PM");
            expect(result[3]).toBe(" 6 PM");
        });
    });

    describe("padding with zeros", () => {
        it("pads hours with zeros", () => {
            const result = generate12HourNumbers({
                interval: 1,
                padWithNItems: 0,
                padNumbersWithZero: true,
                disableInfiniteScroll: false,
            });
            expect(result[0]).toBe("00 AM");
            expect(result[1]).toBe("01 AM");
            expect(result[9]).toBe("09 AM");
            expect(result[10]).toBe("10 AM");
            expect(result[12]).toBe("12 PM");
        });

        it("handles 12-hour format correctly with zero padding", () => {
            const result = generate12HourNumbers({
                interval: 1,
                padWithNItems: 0,
                padNumbersWithZero: true,
                disableInfiniteScroll: false,
            });
            expect(result[12]).toBe("12 PM"); // 12 PM should not be 00 PM
            expect(result[13]).toBe("01 PM");
        });
    });

    describe("padding with empty items", () => {
        it("adds padding at start and end when infinite scroll is disabled", () => {
            const result = generate12HourNumbers({
                interval: 6,
                padWithNItems: 2,
                disableInfiniteScroll: true,
            });
            expect(result[0]).toBe("");
            expect(result[1]).toBe("");
            expect(result[2]).toBe(" 0 AM");
            expect(result[3]).toBe(" 6 AM");
            expect(result[4]).toBe("12 PM");
            expect(result[5]).toBe(" 6 PM");
            expect(result[6]).toBe("");
            expect(result[7]).toBe("");
            expect(result).toHaveLength(8);
        });

        it("does not add padding when infinite scroll is enabled", () => {
            const result = generate12HourNumbers({
                interval: 6,
                padWithNItems: 2,
                disableInfiniteScroll: false,
            });
            expect(result[0]).toBe(" 0 AM");
            expect(result[3]).toBe(" 6 PM");
            expect(result).toHaveLength(4);
        });
    });

    describe("number repetition", () => {
        it("repeats hours when repeatNTimes is 2", () => {
            const result = generate12HourNumbers({
                interval: 6,
                padWithNItems: 0,
                repeatNTimes: 2,
                disableInfiniteScroll: false,
            });
            expect(result).toHaveLength(8);
            expect(result[0]).toBe(" 0 AM");
            expect(result[3]).toBe(" 6 PM");
            expect(result[4]).toBe(" 0 AM");
            expect(result[7]).toBe(" 6 PM");
        });

        it("repeats hours when repeatNTimes is 3", () => {
            const result = generate12HourNumbers({
                interval: 12,
                padWithNItems: 0,
                repeatNTimes: 3,
                disableInfiniteScroll: false,
            });
            expect(result).toHaveLength(6);
            expect(result[0]).toBe(" 0 AM");
            expect(result[1]).toBe("12 PM");
            expect(result[2]).toBe(" 0 AM");
            expect(result[3]).toBe("12 PM");
            expect(result[4]).toBe(" 0 AM");
            expect(result[5]).toBe("12 PM");
        });

        it("defaults to repeatNTimes of 1 when not provided", () => {
            const result = generate12HourNumbers({
                interval: 12,
                padWithNItems: 0,
                disableInfiniteScroll: false,
            });
            expect(result).toHaveLength(2);
        });
    });

    describe("combined options", () => {
        it("combines padding with zeros and empty items", () => {
            const result = generate12HourNumbers({
                interval: 12,
                padWithNItems: 1,
                padNumbersWithZero: true,
                disableInfiniteScroll: true,
            });
            expect(result).toEqual(["", "00 AM", "12 PM", ""]);
        });

        it("combines all options", () => {
            const result = generate12HourNumbers({
                interval: 6,
                padWithNItems: 1,
                padNumbersWithZero: true,
                repeatNTimes: 2,
                disableInfiniteScroll: false,
            });
            expect(result).toHaveLength(8);
            expect(result[0]).toBe("00 AM");
            expect(result[1]).toBe("06 AM");
            expect(result[2]).toBe("12 PM");
            expect(result[3]).toBe("06 PM");
            expect(result[4]).toBe("00 AM");
            expect(result[7]).toBe("06 PM");
        });
    });
});
