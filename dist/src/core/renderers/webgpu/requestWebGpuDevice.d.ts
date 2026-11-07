export interface RequestWebGpuDeviceOptions {
    powerPreference?: GPUPowerPreference;
    forceFallbackAdapter?: boolean;
    requiredFeatures?: GPUFeatureName[];
    requiredLimits?: Record<string, GPUSize64>;
    label?: string;
}
export declare const requestWebGpuDevice: (options?: RequestWebGpuDeviceOptions) => Promise<GPUDevice>;
