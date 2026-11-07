export var TextureErrorCode;
(function (TextureErrorCode) {
    TextureErrorCode["MEMORY_THRESHOLD_EXCEEDED"] = "MEMORY_THRESHOLD_EXCEEDED";
    TextureErrorCode["TEXTURE_DATA_NULL"] = "TEXTURE_DATA_NULL";
    TextureErrorCode["TEXTURE_TYPE_NOT_REGISTERED"] = "TEXTURE_TYPE_NOT_REGISTERED";
})(TextureErrorCode || (TextureErrorCode = {}));
const defaultMessages = {
    [TextureErrorCode.MEMORY_THRESHOLD_EXCEEDED]: 'Memory threshold exceeded',
    [TextureErrorCode.TEXTURE_DATA_NULL]: 'Texture data is null',
    [TextureErrorCode.TEXTURE_TYPE_NOT_REGISTERED]: 'Texture type is not registered',
};
export class TextureError extends Error {
    code;
    constructor(codeOrMessage, maybeMessage) {
        const isCode = Object.values(TextureErrorCode).includes(codeOrMessage);
        const code = isCode ? codeOrMessage : undefined;
        let message;
        if (isCode && code) {
            message = maybeMessage ?? defaultMessages[code];
        }
        else {
            message = String(codeOrMessage);
        }
        super(message);
        this.name = new.target.name;
        if (code)
            this.code = code;
    }
}
export function isTextureError(err) {
    return (err instanceof TextureError ||
        (typeof err === 'object' &&
            err !== null &&
            err.name === 'TextureError' &&
            typeof err.code === 'string'));
}
//# sourceMappingURL=TextureError.js.map