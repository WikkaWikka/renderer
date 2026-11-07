import type { CoreNode } from '../CoreNode.js';
export declare const bucketSortByZIndex: (nodes: CoreNode[], min: number) => void;
export declare const findChildIndexById: (node: CoreNode, children: CoreNode[]) => number;
export declare const removeChild: (node: CoreNode, children: CoreNode[]) => void;
