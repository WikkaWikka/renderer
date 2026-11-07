import { type CoreNode } from './CoreNode.js';
import type { Coord } from './lib/utils.js';
export declare enum AutosizeMode {
    Children = 0,
    Texture = 1
}
export declare enum AutosizeUpdateType {
    None = 0,
    Filtered = 1,
    All = 2
}
export declare class Autosizer {
    node: CoreNode;
    id: number;
    mode: AutosizeMode;
    updateType: AutosizeUpdateType;
    lastWidth: number;
    lastHeight: number;
    lastHasChanged: boolean;
    flaggedChildren: number[];
    childMap: Map<number, CoreNode>;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    corners: [Coord, Coord, Coord, Coord];
    constructor(node: CoreNode);
    attach(node: CoreNode): void;
    detach(node: CoreNode): void;
    patch(id: number): void;
    setUpdateType(updateType: AutosizeUpdateType): void;
    setMode(mode: AutosizeMode): void;
    update(): void;
    destroy(): void;
}
