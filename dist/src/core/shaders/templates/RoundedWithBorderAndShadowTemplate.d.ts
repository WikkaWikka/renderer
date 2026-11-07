import type { CoreShaderType } from '../../renderers/CoreShaderNode.js';
import { type BorderProps } from './BorderTemplate.js';
import { type RoundedProps } from './RoundedTemplate.js';
import type { PrefixedType } from '../utils.js';
import { type ShadowProps } from './ShadowTemplate.js';
export type RoundedWithBorderAndShadowProps = RoundedProps & PrefixedType<BorderProps, 'border'> & PrefixedType<ShadowProps, 'shadow'>;
export declare const RoundedWithBorderAndShadowTemplate: CoreShaderType<RoundedWithBorderAndShadowProps>;
