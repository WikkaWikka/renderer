/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2026 Comcast Cable Communications Management, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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

export interface RequestWebGpuDeviceOptions {
  powerPreference?: GPUPowerPreference;
  forceFallbackAdapter?: boolean;
  requiredFeatures?: GPUFeatureName[];
  requiredLimits?: Record<string, GPUSize64>;
  label?: string;
}

export const requestWebGpuDevice = async (
  options: RequestWebGpuDeviceOptions = {},
): Promise<GPUDevice> => {
  if (navigator.gpu === undefined) {
    throw new Error('WebGPU is not available in this runtime');
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: options.powerPreference,
    forceFallbackAdapter: options.forceFallbackAdapter,
  });
  if (adapter === null) {
    throw new Error('WebGPU did not provide an adapter');
  }

  return adapter.requestDevice({
    label: options.label ?? 'Lightning WebGPU device',
    requiredFeatures: options.requiredFeatures,
    requiredLimits: options.requiredLimits,
  });
};
