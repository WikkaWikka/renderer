import type { Stage } from '../Stage.js';
import type { FontHandler, TextRenderInfo } from './TextRenderer.js';
import type { CoreTextNodeProps } from '../CoreTextNode.js';
/**
 * Canvas Text Renderer - implements TextRenderer interface
 */
declare const CanvasTextRenderer: {
    type: "canvas";
    font: FontHandler;
    renderText: (props: CoreTextNodeProps) => TextRenderInfo;
    renderQuads: () => void;
    init: (_stage: Stage) => void;
    clearCache: () => void;
};
export default CanvasTextRenderer;
