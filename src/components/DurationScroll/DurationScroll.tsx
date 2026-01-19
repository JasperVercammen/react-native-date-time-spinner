import React, {
    useRef,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
    useMemo,
} from "react";

import { View, Text, FlatList as RNFlatList } from "react-native";
import type {
    ViewabilityConfigCallbackPairs,
    FlatListProps,
} from "react-native";

import { colorToRgba } from "../../utils/colorToRgba";
import { generateNumbers } from "../../utils/generateNumbers";
import { getAdjustedLimit } from "../../utils/getAdjustedLimit";
import { getDurationAndIndexFromScrollOffset } from "../../utils/getDurationAndIndexFromScrollOffset";
import { getInitialScrollIndex } from "../../utils/getInitialScrollIndex";

import type { DurationScrollProps, DurationScrollRef } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const keyExtractor = (item: any, index: number) => index.toString();

const DurationScroll = forwardRef<DurationScrollRef, DurationScrollProps>(
    (props, ref) => {
        const {
            accessibilityHint,
            accessibilityLabel,
            allowFontScaling = false,
            decelerationRate = 0.88,
            disableInfiniteScroll = false,
            FlatList = RNFlatList,
            interval,
            isDisabled,
            formatValue,
            limit,
            LinearGradient,
            MaskedView,
            maximumValue,
            onDurationChange,
            padNumbersWithZero = false,
            padWithNItems,
            pickerFeedback,
            pickerGradientOverlayProps,
            repeatNumbersNTimes = 1,
            repeatNumbersNTimesNotExplicitlySet,
            startFrom = 0,
            initialValue = startFrom,
            styles,
            testID,
        } = props;

        const numberOfItems = useMemo(() => {
            // guard against negative maximum values
            if (maximumValue < startFrom) {
                return 1;
            }

            return Math.floor((maximumValue - startFrom) / interval) + 1;
        }, [interval, maximumValue, startFrom]);

        const safeRepeatNumbersNTimes = useMemo(() => {
            // do not repeat numbers if there is only one option
            if (numberOfItems === 1) {
                return 1;
            }

            if (!disableInfiniteScroll && repeatNumbersNTimes < 2) {
                return 2;
            } else if (repeatNumbersNTimes < 1 || isNaN(repeatNumbersNTimes)) {
                return 1;
            }

            // if this variable is not explicitly set, we calculate a reasonable value based on
            // the number of items in the picker, avoiding regular jumps up/down the list
            // whilst avoiding rendering too many items in the picker
            if (repeatNumbersNTimesNotExplicitlySet) {
                const dynamicRepeat = Math.max(
                    Math.round(180 / numberOfItems),
                    1
                );

                // In infinite scroll, we need at least two repeats to allow recentering without
                // scrolling out of bounds when the list is long.
                return disableInfiniteScroll
                    ? dynamicRepeat
                    : Math.max(dynamicRepeat, 2);
            }

            return Math.round(repeatNumbersNTimes);
        }, [
            disableInfiniteScroll,
            numberOfItems,
            repeatNumbersNTimes,
            repeatNumbersNTimesNotExplicitlySet,
        ]);

        const numbersForFlatList = useMemo(
            () =>
                generateNumbers(numberOfItems, {
                    padNumbersWithZero,
                    repeatNTimes: safeRepeatNumbersNTimes,
                    disableInfiniteScroll,
                    padWithNItems,
                    interval,
                    startFrom,
                }),
            [
                disableInfiniteScroll,
                interval,
                numberOfItems,
                padNumbersWithZero,
                padWithNItems,
                safeRepeatNumbersNTimes,
                startFrom,
            ]
        );

        const initialScrollIndex = useMemo(
            () =>
                getInitialScrollIndex({
                    disableInfiniteScroll,
                    interval,
                    numberOfItems,
                    padWithNItems,
                    startFrom,
                    repeatNumbersNTimes: safeRepeatNumbersNTimes,
                    value: initialValue,
                }),
            [
                disableInfiniteScroll,
                initialValue,
                interval,
                numberOfItems,
                padWithNItems,
                startFrom,
                safeRepeatNumbersNTimes,
            ]
        );

        const clampIndex = useCallback(
            (index: number) =>
                Math.min(Math.max(index, 0), numbersForFlatList.length - 1),
            [numbersForFlatList.length]
        );

        const safeInitialScrollIndex = useMemo(
            () => clampIndex(initialScrollIndex),
            [clampIndex, initialScrollIndex]
        );

        const adjustedLimited = useMemo(
            () => getAdjustedLimit(limit, numberOfItems, interval, startFrom),
            [interval, limit, numberOfItems, startFrom]
        );

        const numberOfItemsToShow = 1 + padWithNItems * 2;

        // keep track of the latest duration as it scrolls
        const latestDuration = useRef(initialValue ?? startFrom);

        const flatListRef = useRef<RNFlatList | null>(null);

        const renderItem = useCallback<
            NonNullable<FlatListProps<string>["renderItem"]>
        >(
            ({ item }) => {
                const intItem = parseInt(item);
                const isPlaceholder = item === "" || Number.isNaN(intItem);
                const isDisabled =
                    isPlaceholder ||
                    intItem > adjustedLimited.max ||
                    intItem < adjustedLimited.min;

                const displayValue = isPlaceholder
                    ? ""
                    : formatValue
                    ? formatValue(intItem)
                    : item;

                return (
                    <View
                        key={item}
                        accessible={false}
                        importantForAccessibility="no-hide-descendants"
                        style={styles.pickerItemContainer}
                        testID="picker-item">
                        <Text
                            allowFontScaling={allowFontScaling}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            style={[
                                styles.pickerItem,
                                isDisabled ? styles.disabledPickerItem : {},
                            ]}>
                            {displayValue}
                        </Text>
                    </View>
                );
            },
            [
                adjustedLimited.max,
                adjustedLimited.min,
                allowFontScaling,
                formatValue,
                styles.disabledPickerItem,
                styles.pickerItem,
                styles.pickerItemContainer,
            ]
        );

        const onMomentumScrollEnd = useCallback<
            NonNullable<FlatListProps<string>["onMomentumScrollEnd"]>
        >(
            (e) => {
                const newValues = getDurationAndIndexFromScrollOffset({
                    disableInfiniteScroll,
                    interval,
                    itemHeight: styles.pickerItemContainer.height,
                    numberOfItems,
                    padWithNItems,
                    startFrom,
                    yContentOffset: e.nativeEvent.contentOffset.y,
                });

                // check limits
                if (newValues.duration > adjustedLimited.max) {
                    const targetScrollIndex =
                        newValues.index -
                        (newValues.duration - adjustedLimited.max);
                    flatListRef.current?.scrollToIndex({
                        animated: true,
                        index:
                            // guard against scrolling beyond end of list
                            targetScrollIndex >= 0
                                ? targetScrollIndex
                                : adjustedLimited.max - 1,
                    }); // scroll down to max
                    newValues.duration = adjustedLimited.max;
                } else if (newValues.duration < adjustedLimited.min) {
                    const targetScrollIndex =
                        newValues.index +
                        (adjustedLimited.min - newValues.duration);
                    flatListRef.current?.scrollToIndex({
                        animated: true,
                        index:
                            // guard against scrolling beyond end of list
                            targetScrollIndex <= numbersForFlatList.length - 1
                                ? targetScrollIndex
                                : adjustedLimited.min,
                    }); // scroll up to min
                    newValues.duration = adjustedLimited.min;
                }

                latestDuration.current = newValues.duration;

                onDurationChange(newValues.duration);
                pickerFeedback?.();
            },
            [
                disableInfiniteScroll,
                interval,
                styles.pickerItemContainer.height,
                numberOfItems,
                padWithNItems,
                startFrom,
                adjustedLimited.max,
                adjustedLimited.min,
                onDurationChange,
                numbersForFlatList.length,
                pickerFeedback,
            ]
        );

        const onViewableItemsChanged = useCallback<
            NonNullable<FlatListProps<string>["onViewableItemsChanged"]>
        >(
            ({ viewableItems }) => {
                if (numberOfItems === 1) {
                    return;
                }

                if (
                    viewableItems[0]?.index &&
                    viewableItems[0].index < numberOfItems * 0.5
                ) {
                    flatListRef.current?.scrollToIndex({
                        animated: false,
                        index: viewableItems[0].index + numberOfItems,
                    });
                } else if (
                    viewableItems[0]?.index &&
                    viewableItems[0].index >=
                        numberOfItems * (safeRepeatNumbersNTimes - 0.5)
                ) {
                    flatListRef.current?.scrollToIndex({
                        animated: false,
                        index: viewableItems[0].index - numberOfItems,
                    });
                }
            },
            [numberOfItems, safeRepeatNumbersNTimes]
        );

        const [
            viewabilityConfigCallbackPairs,
            setViewabilityConfigCallbackPairs,
        ] = useState<ViewabilityConfigCallbackPairs | undefined>(
            !disableInfiniteScroll
                ? [
                      {
                          viewabilityConfig: {
                              viewAreaCoveragePercentThreshold: 0,
                          },
                          onViewableItemsChanged: onViewableItemsChanged,
                      },
                  ]
                : undefined
        );

        const [flatListRenderKey, setFlatListRenderKey] = useState(0);

        const initialRender = useRef(true);

        useEffect(() => {
            // don't run on first render
            if (initialRender.current) {
                initialRender.current = false;
                return;
            }

            // if the onViewableItemsChanged callback changes, we need to update viewabilityConfigCallbackPairs
            // which requires the FlatList to be remounted, hence the increase of the FlatList key
            setFlatListRenderKey((prev) => prev + 1);
            setViewabilityConfigCallbackPairs(
                !disableInfiniteScroll
                    ? [
                          {
                              viewabilityConfig: {
                                  viewAreaCoveragePercentThreshold: 0,
                              },
                              onViewableItemsChanged: onViewableItemsChanged,
                          },
                      ]
                    : undefined
            );
        }, [disableInfiniteScroll, onViewableItemsChanged]);

        const getItemLayout = useCallback<
            NonNullable<FlatListProps<string>["getItemLayout"]>
        >(
            (_, index) => ({
                length: styles.pickerItemContainer.height,
                offset: styles.pickerItemContainer.height * index,
                index,
            }),
            [styles.pickerItemContainer.height]
        );

        const setValue = useCallback(
            (value: number, options?: { animated?: boolean }) => {
                latestDuration.current = value;
                flatListRef.current?.scrollToIndex({
                    animated: options?.animated ?? false,
                    index: clampIndex(
                        getInitialScrollIndex({
                            disableInfiniteScroll,
                            interval,
                            numberOfItems,
                            padWithNItems,
                            startFrom,
                            repeatNumbersNTimes: safeRepeatNumbersNTimes,
                            value: value,
                        })
                    ),
                });
            },
            [
                clampIndex,
                disableInfiniteScroll,
                interval,
                numberOfItems,
                padWithNItems,
                safeRepeatNumbersNTimes,
                startFrom,
            ]
        );

        useImperativeHandle(ref, () => ({
            reset: (options) => {
                latestDuration.current = initialValue;
                flatListRef.current?.scrollToIndex({
                    animated: options?.animated ?? false,
                    index: safeInitialScrollIndex,
                });
            },
            setValue: setValue,
            latestDuration: latestDuration,
        }));

        const renderContent = useMemo(() => {
            return (
                <View
                    accessibilityActions={[
                        { name: "increment" },
                        { name: "decrement" },
                    ]}
                    accessibilityHint={
                        accessibilityHint ?? "Swipe up or down to adjust"
                    }
                    accessibilityLabel={accessibilityLabel}
                    accessibilityRole="adjustable"
                    accessibilityValue={{
                        text: formatValue
                            ? formatValue(latestDuration.current)
                            : String(latestDuration.current),
                    }}
                    accessible={true}
                    onAccessibilityAction={(event: {
                        nativeEvent: { actionName: string };
                    }) => {
                        if (event.nativeEvent.actionName === "increment") {
                            const newValue = Math.min(
                                latestDuration.current + interval,
                                adjustedLimited.max
                            );
                            setValue(newValue, { animated: true });
                        } else if (
                            event.nativeEvent.actionName === "decrement"
                        ) {
                            const newValue = Math.max(
                                latestDuration.current - interval,
                                adjustedLimited.min
                            );
                            setValue(newValue, { animated: true });
                        }
                    }}>
                    <FlatList
                        key={flatListRenderKey}
                        ref={flatListRef}
                        accessible={false}
                        contentContainerStyle={
                            styles.durationScrollFlatListContentContainer
                        }
                        data={numbersForFlatList}
                        decelerationRate={decelerationRate}
                        getItemLayout={getItemLayout}
                        importantForAccessibility="no-hide-descendants"
                        initialScrollIndex={safeInitialScrollIndex}
                        keyExtractor={keyExtractor}
                        nestedScrollEnabled
                        onMomentumScrollEnd={onMomentumScrollEnd}
                        renderItem={renderItem}
                        scrollEnabled={!isDisabled}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        style={styles.durationScrollFlatList}
                        testID="duration-scroll-flatlist"
                        viewabilityConfigCallbackPairs={
                            viewabilityConfigCallbackPairs
                        }
                        windowSize={
                            numberOfItemsToShow > 10 ? numberOfItemsToShow : 10
                        }
                        snapToAlignment="start"
                        // used in place of snapToInterval due to bug on Android
                        snapToOffsets={[
                            ...Array(numbersForFlatList.length),
                        ].map((_, i) => i * styles.pickerItemContainer.height)}
                    />
                    <View
                        pointerEvents="none"
                        style={styles.pickerLabelContainer}
                    />
                </View>
            );
        }, [
            FlatList,
            accessibilityHint,
            accessibilityLabel,
            adjustedLimited.max,
            adjustedLimited.min,
            decelerationRate,
            flatListRenderKey,
            formatValue,
            getItemLayout,
            interval,
            isDisabled,
            numberOfItemsToShow,
            numbersForFlatList,
            onMomentumScrollEnd,
            renderItem,
            safeInitialScrollIndex,
            setValue,
            styles.durationScrollFlatList,
            styles.durationScrollFlatListContentContainer,
            styles.pickerItemContainer.height,
            styles.pickerLabelContainer,
            viewabilityConfigCallbackPairs,
        ]);

        const renderLinearGradient = useMemo(() => {
            if (!LinearGradient) {
                return null;
            }

            let colors: string[];

            if (MaskedView) {
                // if using masked view, we only care about the opacity
                colors = [
                    "rgba(0,0,0,0)",
                    "rgba(0,0,0,1)",
                    "rgba(0,0,0,1)",
                    "rgba(0,0,0,0)",
                ];
            } else {
                const backgroundColor =
                    styles.pickerContainer.backgroundColor ?? "white";
                const transparentBackgroundColor = colorToRgba({
                    color: backgroundColor,
                    opacity: 0,
                });
                colors = [
                    backgroundColor,
                    transparentBackgroundColor,
                    transparentBackgroundColor,
                    backgroundColor,
                ];
            }

            // calculate the gradient height to cover the top item and bottom item
            const gradientHeight =
                padWithNItems > 0 ? 1 / (padWithNItems * 2 + 1) : 0.3;

            return (
                <LinearGradient
                    colors={colors}
                    locations={[0, gradientHeight, 1 - gradientHeight, 1]}
                    pointerEvents="none"
                    style={styles.pickerGradientOverlay}
                    {...pickerGradientOverlayProps}
                />
            );
        }, [
            LinearGradient,
            MaskedView,
            padWithNItems,
            pickerGradientOverlayProps,
            styles.pickerContainer.backgroundColor,
            styles.pickerGradientOverlay,
        ]);

        return (
            <View
                pointerEvents={isDisabled ? "none" : undefined}
                style={[
                    styles.durationScrollFlatListContainer,
                    {
                        height:
                            styles.pickerItemContainer.height *
                            numberOfItemsToShow,
                    },
                    isDisabled && styles.disabledPickerContainer,
                ]}
                testID={testID}>
                {MaskedView ? (
                    <MaskedView
                        maskElement={renderLinearGradient}
                        style={[styles.maskedView]}>
                        {renderContent}
                    </MaskedView>
                ) : (
                    <>
                        {renderContent}
                        {renderLinearGradient}
                    </>
                )}
            </View>
        );
    }
);

export default React.memo(DurationScroll);
