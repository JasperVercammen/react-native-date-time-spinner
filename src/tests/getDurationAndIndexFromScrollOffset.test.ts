import { getDurationAndIndexFromScrollOffset } from "../utils/getDurationAndIndexFromScrollOffset";

describe("getDurationAndIndexFromScrollOffset", () => {
    it("respects startFrom when infinite scroll is disabled", () => {
        const result = getDurationAndIndexFromScrollOffset({
            disableInfiniteScroll: true,
            interval: 1,
            itemHeight: 50,
            numberOfItems: 31,
            padWithNItems: 0,
            startFrom: 1,
            yContentOffset: 0,
        });

        expect(result).toEqual({ duration: 1, index: 0 });
    });

    it("respects startFrom when infinite scroll is enabled", () => {
        const result = getDurationAndIndexFromScrollOffset({
            disableInfiniteScroll: false,
            interval: 1,
            itemHeight: 50,
            numberOfItems: 12,
            padWithNItems: 2,
            startFrom: 1950,
            yContentOffset: 50,
        });

        expect(result).toEqual({ duration: 1951, index: 1 });
    });

        it("handles item height of 60", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 60,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 360,
            });
            expect(result).toEqual({ duration: 6, index: 6 });
        });

        it("handles item height of 100", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 100,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 500,
            });
            expect(result).toEqual({ duration: 5, index: 5 });
        });
    });

    describe("rounding behavior", () => {
        it("rounds down when closer to lower index", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 124,
            });
            expect(result).toEqual({ duration: 2, index: 2 }); // 124/50 = 2.48
        });

        it("rounds up when closer to upper index", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 126,
            });
            expect(result).toEqual({ duration: 3, index: 3 }); // 126/50 = 2.52
        });

        it("rounds to nearest for exact halfway point", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 125,
            });
            expect(result).toEqual({ duration: 3, index: 3 }); // 125/50 = 2.5, rounds to 3
        });
    });

    describe("edge cases", () => {
        it("handles zero offset", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 0,
            });
            expect(result).toEqual({ duration: 0, index: 0 });
        });

        it("handles very large offset", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 24,
                padWithNItems: 2,
                yContentOffset: 5000,
            });
            expect(result.index).toBe(100);
            expect(result.duration).toBe(4); // (100 % 24) * 1 = 4
        });

        it("handles small numberOfItems", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 2,
                padWithNItems: 1,
                yContentOffset: 150,
            });
            expect(result).toEqual({ duration: 1, index: 3 }); // 3 % 2 = 1
        });

        it("handles no padding", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: false,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 60,
                padWithNItems: 0,
                yContentOffset: 100,
            });
            expect(result).toEqual({ duration: 2, index: 2 });
        });
    });

    describe("real-world scenarios", () => {
        it("handles typical hour picker scroll", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: false,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 24,
                padWithNItems: 2,
                yContentOffset: 600,
            });
            expect(result).toEqual({ duration: 14, index: 12 }); // (12 + 2) % 24 = 14
        });

        it("handles typical minute picker scroll", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: false,
                interval: 1,
                itemHeight: 50,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 1500,
            });
            expect(result).toEqual({ duration: 32, index: 30 }); // (30 + 2) % 60 = 32
        });

        it("handles minute picker with 5-minute interval", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: false,
                interval: 5,
                itemHeight: 50,
                numberOfItems: 12,
                padWithNItems: 2,
                yContentOffset: 250,
            });
            expect(result).toEqual({ duration: 35, index: 5 }); // (5 + 2) % 12 = 7, 7 * 5 = 35
        });

        it("handles second picker scroll", () => {
            const result = getDurationAndIndexFromScrollOffset({
                disableInfiniteScroll: true,
                interval: 1,
                itemHeight: 40,
                numberOfItems: 60,
                padWithNItems: 2,
                yContentOffset: 800,
            });
            expect(result).toEqual({ duration: 20, index: 20 });
        });
    });
