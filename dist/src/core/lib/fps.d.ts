export interface FrameCount {
    /**
     * The boundaries for the frame count buckets.
     */
    boundaries: number[];
    /**
     * The count of frames in each bucket.
     */
    count: Record<number | string, number>;
    /**
     * The total number of frames counted.
     */
    total: number;
}
export type FrameCounter = FrameCount & {
    /**
     * The start time of the frame counting interval.
     */
    start: number;
    /**
     * The end time of the frame counting interval.
     */
    end: number;
    /**
     * Increments the frame count based on the provided frame delta time.
     * @param frameDelta - The time in milliseconds it took to render the last frame.
     */
    increment: (frameDelta: number) => void;
    /**
     * Calculates and returns the average frames per second (FPS) based on the total frames counted and the elapsed time.
     * @returns The average FPS.
     */
    get averageFps(): number;
};
export declare function setFpsBoundaries(newBoundaries: number[]): void;
export declare function setFpsInterval(newInterval: number): void;
export declare function createFrameCounter(frameTime: number): FrameCounter;
