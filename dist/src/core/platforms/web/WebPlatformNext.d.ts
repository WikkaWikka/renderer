import { WebPlatform } from './WebPlatform.js';
/**
 * Next-generation Web Platform implementation that uses Fetch API
 *
 * @remarks
 * This platform uses the modern Fetch API instead of XMLHttpRequest for
 * loading image resources. The Fetch API provides a more modern, promise-based
 * interface for network requests and better streaming capabilities.
 *
 * Benefits over XMLHttpRequest:
 * - Promise-based (no callback-based API)
 * - Better error handling
 * - More consistent across browsers
 * - Better streaming support
 * - Service Worker compatible
 *
 * All other platform features remain the same as WebPlatform.
 */
export declare class WebPlatformNext extends WebPlatform {
    fetch(url: string): Promise<Blob>;
}
