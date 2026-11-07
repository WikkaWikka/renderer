import type { Stage } from '../Stage.js';
import type { CoreRenderer } from '../renderers/CoreRenderer.js';
import type { FontHandler, TextRenderInfo, TextLayout, TextRenderProps } from './TextRenderer.js';
import type { CoreTextNodeProps } from '../CoreTextNode.js';
/**
 * SDF Text Renderer - implements TextRenderer interface
 */
declare const SdfTextRenderer: {
    type: "sdf";
    font: FontHandler;
    renderText: (props: CoreTextNodeProps) => TextRenderInfo;
    renderQuads: (renderer: CoreRenderer, layout: TextLayout, _vertexBuffer: Float32Array | null, renderProps: TextRenderProps) => void;
    init: (stage: Stage) => void;
    clearCache: () => void;
};
export default SdfTextRenderer;
