/**
 * Note that, within the createImageWorkerNoOptions function, we must only use
 * ES5 code to keep it ES5-valid after babelifying, as the converted code of
 * this section is converted to a blob and used as the js of the web worker
 * thread.
 */
export declare function createImageWorkerNoOptions(): void;
