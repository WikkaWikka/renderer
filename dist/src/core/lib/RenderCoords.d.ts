export declare class RenderCoords {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    x4: number;
    y4: number;
    constructor(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number);
    static translate(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, out?: RenderCoords): RenderCoords;
}
