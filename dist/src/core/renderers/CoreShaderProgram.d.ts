export interface CoreShaderProgram {
    attach?: () => void;
    detach?: () => void;
    destroy?: () => void;
    isDestroyed?: boolean;
}
