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
export class ImageWorkerManager {
    imageWorkersEnabled = true;
    messageManager = {};
    workers = [];
    workerLoad = [];
    nextId = 0;
    maxWorkers;
    workerFactory;
    blobURL;
    /**
     * @param maxWorkers Maximum pool size. Workers spawn on demand (see
     * {@link getImage}): the first image load spawns one worker and the pool
     * grows while all workers are busy, instead of spawning everything upfront.
     */
    constructor(maxWorkers, workerFactory) {
        this.maxWorkers = Math.max(1, maxWorkers);
        this.workerFactory = workerFactory;
        this.blobURL = this.createBlobURL(workerFactory);
    }
    isLegacyResponse(data) {
        return data.data instanceof Blob;
    }
    createImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(blob);
            const image = new Image();
            image.onload = () => {
                URL.revokeObjectURL(objectUrl);
                resolve({ data: image, premultiplied: false });
            };
            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Image loading failed for legacy worker response.'));
            };
            image.src = objectUrl;
        });
    }
    handleMessage(event, workerIndex) {
        const { id, data, error } = event.data;
        const msg = this.messageManager[id];
        if (this.workerLoad[workerIndex]) {
            this.workerLoad[workerIndex]--;
        }
        if (msg) {
            const [resolve, reject] = msg;
            delete this.messageManager[id];
            if (error) {
                reject(new Error(error));
            }
            else if (this.isLegacyResponse(data)) {
                this.createImageFromBlob(data.data).then(resolve).catch(reject);
            }
            else {
                resolve(data);
            }
        }
    }
    createBlobURL(workerFactory) {
        let workerCode = `(${workerFactory.toString()})()`;
        workerCode = workerCode.replace('"use strict";', '');
        const blob = new Blob([workerCode], {
            type: 'application/javascript',
        });
        return (self.URL ? URL : webkitURL).createObjectURL(blob);
    }
    /**
     * Spawn one worker and append it to the pool.
     *
     * @returns Index of the new worker, or -1 when the pool is at capacity.
     */
    addWorker() {
        if (this.workers.length >= this.maxWorkers) {
            return -1;
        }
        const worker = new Worker(this.blobURL);
        const index = this.workers.length;
        worker.onmessage = (event) => this.handleMessage(event, index);
        this.workers.push(worker);
        this.workerLoad.push(0);
        return index;
    }
    /**
     * Pick the worker for the next image, growing the pool on demand.
     *
     * @remarks
     * An idle worker wins immediately. When every worker is busy and the pool
     * is below capacity, a new worker spawns instead of queueing behind busy
     * ones; otherwise the least-loaded worker takes the job. Never returns -1:
     * the pool always grows from empty since capacity is at least 1.
     */
    getNextWorkerIndex() {
        if (this.workers.length === 0) {
            return this.addWorker();
        }
        let minLoad = 99;
        let workerIndex = 0;
        for (let i = 0; i < this.workers.length; i++) {
            const load = this.workerLoad[i] || 0;
            if (load === 0) {
                return i;
            }
            if (load < minLoad) {
                minLoad = load;
                workerIndex = i;
            }
        }
        const grown = this.addWorker();
        return grown !== -1 ? grown : workerIndex;
    }
    getImage(src, premultiplyAlpha, sx, sy, sw, sh) {
        return new Promise((resolve, reject) => {
            if (this.workers) {
                const id = this.nextId++;
                this.messageManager[id] = [resolve, reject];
                const nextWorkerIndex = this.getNextWorkerIndex();
                if (nextWorkerIndex !== -1) {
                    const worker = this.workers[nextWorkerIndex];
                    if (worker === undefined) {
                        delete this.messageManager[id];
                        reject(new Error('No image worker available.'));
                        return;
                    }
                    this.workerLoad[nextWorkerIndex] =
                        (this.workerLoad[nextWorkerIndex] ?? 0) + 1;
                    worker.postMessage({
                        id,
                        src: src,
                        premultiplyAlpha,
                        sx,
                        sy,
                        sw,
                        sh,
                    });
                }
            }
        });
    }
}
//# sourceMappingURL=ImageWorker.js.map