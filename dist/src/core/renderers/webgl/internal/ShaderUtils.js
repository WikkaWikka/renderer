/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2023 Comcast Cable Communications Management, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//#endregion Types
export function createShader(glw, type, source) {
    const shader = glw.createShader(type);
    if (!shader) {
        const glError = glw.getError();
        throw new Error(`Unable to create the shader: ${type === glw.VERTEX_SHADER ? 'VERTEX_SHADER' : 'FRAGMENT_SHADER'}.${glError ? ` WebGlContext Error: ${glError}` : ''}`);
    }
    glw.shaderSource(shader, source);
    glw.compileShader(shader);
    const success = !!glw.getShaderParameter(shader, glw.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.error(glw.getShaderInfoLog(shader));
    glw.deleteShader(shader);
}
export function createProgram(glw, vertexShader, fragmentShader) {
    const program = glw.createProgram();
    if (!program) {
        throw new Error('Unable to create program');
    }
    glw.attachShader(program, vertexShader);
    glw.attachShader(program, fragmentShader);
    glw.linkProgram(program);
    const success = !!glw.getProgramParameter(program, glw.LINK_STATUS);
    if (success) {
        return program;
    }
    const infoLog = glw.getProgramInfoLog(program) || 'Unknown program link error';
    console.warn(infoLog);
    glw.deleteProgram(program);
    throw new Error(`Unable to link shader program: ${infoLog}`);
}
export const DefaultVertexSource = `
  # ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  # else
  precision mediump float;
  # endif

  attribute vec2 a_position;
  attribute vec2 a_textureCoords;
  attribute vec4 a_color;
  attribute vec2 a_nodeCoords;

  uniform vec2 u_resolution;
  uniform float u_pixelRatio;
  uniform vec2 u_dimensions;
  uniform vec4 u_shadow;

  varying vec4 v_color;
  varying vec2 v_textureCoords;

  void main() {
    vec2 normalized = a_position * u_pixelRatio;
    vec2 screenSpace = vec2(2.0 / u_resolution.x, -2.0 / u_resolution.y);

    vec2 outerEdge = clamp(a_textureCoords * 2.0 - vec2(1.0), -1.0, 1.0);
    vec2 shadowEdge = outerEdge;
    vec2 vertexPos = normalized + outerEdge + shadowEdge;
    v_color = a_color;
    v_textureCoords = a_textureCoords;

    gl_Position = vec4(vertexPos.x * screenSpace.x - 1.0, -sign(screenSpace.y) * (vertexPos.y * -abs(screenSpace.y)) + 1.0, 0.0, 1.0);
  }
`;
/**
 * generate fragment source for
 * @param stops
 * @returns
 */
export function genGradientColors(stops) {
    let result = `
    float stopCalc = (dist - u_stops[0]) / (u_stops[1] - u_stops[0]);
    vec4 colorOut = mix(u_colors[0], u_colors[1], stopCalc);
  `;
    if (stops > 2) {
        for (let i = 2; i < stops; i++) {
            result += `colorOut = mix(colorOut, u_colors[${i}], clamp((dist - u_stops[${i - 1}]) / (u_stops[${i}] - u_stops[${i - 1}]), 0.0, 1.0));`;
        }
    }
    return result;
}
//# sourceMappingURL=ShaderUtils.js.map