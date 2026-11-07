import type { CoreTextureManager } from '../CoreTextureManager.js';
import { Texture, TextureType, type TextureData } from './Texture.js';
/**
 * Properties of the {@link ColorTexture}
 */
export interface ColorTextureProps {
    /**
     * Color to use to generate the texture
     *
     * @default 0xffffffff (opaque white)
     */
    color?: number;
}
/**
 * Texture consisting of only a 1x1 color pixel
 *
 * @remarks
 * The pixel color is set with the {@link ColorTextureProps.color} prop.
 *
 * This is the default texture used for a Node if it's
 * {@link INodeProps.texture} prop is set to `null` (the default)
 *
 * Generally the 1x1 color pixel is stretched to whatever the set dimensions of
 * a Node are.
 */
export declare class ColorTexture extends Texture {
    type: TextureType;
    props: Required<ColorTextureProps>;
    constructor(txManager: CoreTextureManager, props: Required<ColorTextureProps>);
    get color(): number;
    set color(color: number);
    getTextureSource(): TextureData;
    static makeCacheKey(props: ColorTextureProps): string;
    static resolveDefaults(props: ColorTextureProps): Required<ColorTextureProps>;
    static z$__type__Props: ColorTextureProps;
}
