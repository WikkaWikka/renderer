import { deepClone } from '../../utils.js';
import { UpdateType } from '../CoreNode.js';
export function isAdvancedShaderProp(obj) {
    return obj !== null && typeof obj === 'object' && obj.default !== undefined;
}
export function resolveShaderProps(props, propsConfig) {
    for (const key in propsConfig) {
        if (!isAdvancedShaderProp(propsConfig[key]) && props[key] === undefined) {
            props[key] = propsConfig[key];
            continue;
        }
        const pConfig = propsConfig[key];
        const hasValue = props[key] !== undefined;
        if (pConfig.resolve !== undefined) {
            props[key] = pConfig.resolve(props[key], props);
            continue;
        }
        if (hasValue && pConfig.set !== undefined) {
            pConfig.set(props[key], props);
            continue;
        }
        if (hasValue) {
            continue;
        }
        if (props[key] === undefined && pConfig.get === undefined) {
            props[key] = deepClone(pConfig.default);
            continue;
        }
        props[key] = pConfig.get(props);
    }
}
/**
 * CoreShaderNode is a base class that manages the shader prop values.
 * When a prop is being updated the CoreShaderNode will notify either the associated CoreNode,
 * or the Stage that there has been a change and a new render of the scene.
 */
export class CoreShaderNode {
    shaderKey;
    stage;
    shaderType;
    propsConfig;
    resolvedProps = undefined;
    definedProps = undefined;
    node = null;
    time = undefined;
    update = undefined;
    beforeDraw = undefined;
    _valueKeyCache = '';
    _valueKeyDirty = true;
    _lastW = 0;
    _lastH = 0;
    constructor(shaderKey, type, stage, props) {
        this.shaderKey = shaderKey;
        this.stage = stage;
        this.shaderType = type;
        this.time = type.time;
        if (props !== undefined) {
            /**
             * props are already resolved by shadermanager
             */
            this.resolvedProps = props;
            this.defineProps(props);
        }
    }
    defineProps(props) {
        const definedProps = {};
        for (const key in props) {
            const propConfig = this.shaderType.props[key];
            const isAdvancedProp = isAdvancedShaderProp(propConfig);
            Object.defineProperty(definedProps, key, {
                get: () => {
                    return this.resolvedProps[key];
                },
                set: (value) => {
                    // this.resolvedProps![key as keyof Props] = value;
                    if (isAdvancedProp === true && propConfig.resolve !== undefined) {
                        this.resolvedProps[key] = propConfig.resolve(value, this.resolvedProps);
                    }
                    else if (isAdvancedProp === true && propConfig.set !== undefined) {
                        propConfig.set(value, this.resolvedProps);
                    }
                    else {
                        this.resolvedProps[key] = value;
                    }
                    this._valueKeyDirty = true;
                    if (this.update !== undefined && this.node !== null) {
                        this.node.setUpdateType(UpdateType.RecalcUniforms);
                    }
                    else {
                        this.stage.requestRender();
                    }
                },
            });
        }
        this.definedProps = definedProps;
    }
    attachNode(node) {
        this.node = node;
    }
    createValueKey() {
        if (this._valueKeyDirty === false &&
            this.node !== null &&
            this.node.w === this._lastW &&
            this.node.h === this._lastH) {
            return this._valueKeyCache;
        }
        let valueKey = '';
        for (const key in this.resolvedProps) {
            valueKey += `${key}:${this.resolvedProps[key]};`;
        }
        valueKey += `node-width:${this.node.w}`;
        valueKey += `node-height:${this.node.h}`;
        this._valueKeyCache = valueKey;
        this._valueKeyDirty = false;
        this._lastW = this.node.w;
        this._lastH = this.node.h;
        return valueKey;
    }
    get props() {
        return this.definedProps;
    }
    set props(props) {
        if (props === undefined) {
            return;
        }
        for (const key in props) {
            this.props[key] = props[key];
        }
    }
}
//# sourceMappingURL=CoreShaderNode.js.map