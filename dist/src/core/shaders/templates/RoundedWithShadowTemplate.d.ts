import type { CoreShaderType } from '../../renderers/CoreShaderNode.js';
import { type RoundedProps } from './RoundedTemplate.js';
import type { PrefixedType } from '../utils.js';
import { type ShadowProps } from './ShadowTemplate.js';
export type RoundedWithShadowProps = RoundedProps & PrefixedType<ShadowProps, 'shadow'>;
export declare const RoundedWithShadowTemplate: CoreShaderType<RoundedWithShadowProps>;
