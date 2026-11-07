import type { CoreShaderType } from '../../renderers/CoreShaderNode.js';
import { type BorderProps } from './BorderTemplate.js';
import { type RoundedProps } from './RoundedTemplate.js';
import type { PrefixedType } from '../utils.js';
export type RoundedWithBorderProps = RoundedProps & PrefixedType<BorderProps, 'border'>;
export declare const RoundedWithBorderTemplate: CoreShaderType<RoundedWithBorderProps>;
