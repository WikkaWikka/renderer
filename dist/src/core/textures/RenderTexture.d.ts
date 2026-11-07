import type { CoreTextureManager } from '../CoreTextureManager.js';
import { Texture, TextureType, type TextureData } from './Texture.js';
/**
 * Properties of the {@link RenderTexture}
 */
export interface RenderTextureProps {
    /**
     * WebGL Texture width
     * @default 256
     */
    w?: number;
    /**
     * WebGL Texture height
     * @default 256
     */
    h?: number;
}
export declare class RenderTexture extends Texture {
    props: Required<RenderTextureProps>;
    type: TextureType;
    constructor(txManager: CoreTextureManager, props: Required<RenderTextureProps>);
    get w(): number;
    set w(value: number);
    get h(): number;
    set h(value: number);
    getTextureSource(): TextureData;
    static resolveDefaults(props: RenderTextureProps): Required<RenderTextureProps>;
    static z$__type__Props: RenderTextureProps;
}
