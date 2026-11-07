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
/**
 * Creates a FIFO queue with O(1) membership check and O(1) cancellation.
 *
 * @remarks
 * Backed by an array (for ordering) and a Set (for fast lookup/cancel).
 * Cancelled entries are tombstoned (set to null) and skipped on dequeue.
 * The array is compacted when the head pointer exceeds half the array length
 * and is at least 64 entries deep, amortising the compaction cost.
 */
export function createTextureUploadQueue() {
    let list = [];
    const set = new Set();
    let head = 0;
    function compact() {
        if (head >= 64 && head >= list.length >> 1) {
            list = list.slice(head);
            head = 0;
        }
    }
    return {
        get size() {
            return set.size;
        },
        has(texture) {
            return set.has(texture);
        },
        enqueue(texture) {
            if (set.has(texture) === true)
                return;
            set.add(texture);
            list.push(texture);
        },
        dequeue() {
            while (head < list.length) {
                const t = list[head];
                head++;
                if (t !== null && set.has(t) === true) {
                    set.delete(t);
                    compact();
                    return t;
                }
            }
            compact();
            return undefined;
        },
        remove(texture) {
            if (set.delete(texture) === false)
                return;
            const idx = list.indexOf(texture);
            if (idx !== -1) {
                list[idx] = null;
            }
        },
        clear() {
            list.length = 0;
            set.clear();
            head = 0;
        },
    };
}
//# sourceMappingURL=TextureUploadQueue.js.map