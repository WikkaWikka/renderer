/**
 * Class that keeps track of the invocations of Context methods when
 * the `enableContextSpy` renderer option is enabled.
 */
export declare class ContextSpy {
    private data;
    reset(): void;
    increment(name: string): void;
    getData(): {
        [x: string]: number;
    };
}
