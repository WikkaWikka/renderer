import type { CoreTextureManager } from '../CoreTextureManager.js';
import { Texture, TextureType, type TextureData } from './Texture.js';
/**
 * Properties of the {@link SubTexture}
 */
export interface SubTextureProps {
    /**
     * The texture that this sub-texture is a sub-region of.
     */
    texture: Texture;
    /**
     * The x pixel position of the top-left of the sub-texture within the parent
     * texture.
     *
     * @default 0
     */
    x?: number;
    /**
     * The y pixel position of the top-left sub-texture within the parent
     * texture.
     *
     * @default 0
     **/
    y?: number;
    /**
     * The width of the sub-texture in pixels.
     *
     * @default 0
     */
    w?: number;
    /**
     * The height of the sub-texture in pixels
     **/
    h?: number;
}
/**
 * A Texture that is a sub-region of another Texture.
 *
 * @remarks
 * The parent texture can be a Sprite Sheet/Texture Atlas and set using the
 * {@link SubTextureProps.texture} prop. The sub-region relative to the parent
 * texture is defined with the {@link SubTextureProps.x},
 * {@link SubTextureProps.y}, {@link SubTextureProps.w}, and
 * {@link SubTextureProps.h} pixel values.
 */
export declare class SubTexture extends Texture {
    props: Required<SubTextureProps>;
    parentTexture: Texture;
    type: TextureType;
    subtextureId: string;
    constructor(txManager: CoreTextureManager, props: Required<SubTextureProps>);
    private onParentTxLoaded;
    private onParentTxFailed;
    private onParentTxLoading;
    private onParentTxFreed;
    onChangeIsRenderable(isRenderable: boolean): void;
    getTextureSource(): TextureData;
    static makeCacheKey(props: SubTextureProps): string | false;
    static resolveDefaults(props: SubTextureProps): Required<SubTextureProps>;
    static z$__type__Props: SubTextureProps;
}
