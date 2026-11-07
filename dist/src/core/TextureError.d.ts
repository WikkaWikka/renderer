export declare enum TextureErrorCode {
    MEMORY_THRESHOLD_EXCEEDED = "MEMORY_THRESHOLD_EXCEEDED",
    TEXTURE_DATA_NULL = "TEXTURE_DATA_NULL",
    TEXTURE_TYPE_NOT_REGISTERED = "TEXTURE_TYPE_NOT_REGISTERED"
}
export declare class TextureError extends Error {
    code?: TextureErrorCode;
    constructor(message: string);
    constructor(code: TextureErrorCode, message?: string);
}
export declare function isTextureError(err: unknown): err is TextureError;
