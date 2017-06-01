/*

UI INSIGHTS @ https://github.com/asitparida/ui-insights

MIT License

Copyright (c) 2017 Asit Parida

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


*/


export module Metrics {
    export function LogExecutionTime(target, key, descriptor) {

        // save a reference to the original method this way we keep the values currently in the
        // descriptor and don't overwrite what another decorator might have done to the descriptor.
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
        const originalMethod = descriptor.value;
        // editing the descriptor/value parameter
        descriptor.value = function () {
            const args = [];
            for (let _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            // let a = args.map(function (a) { return JSON.stringify(a); }).join();
            // note usage of originalMethod here
            const _startDt = new Date();
            const result = originalMethod.apply(this, args);
            const _endDt = new Date();
            console.log('Call: ' + key + ' => UI thread execution took ' + (_endDt.getTime() - _startDt.getTime()) + ' ms');
            return result;
        };
        // return edited descriptor as opposed to overwriting the descriptor
        return descriptor;
    }
    export const LogExecutionTimeForClicks = {
        _timeStamps: {},
        _bubbleListener: (e: Event) => {
            if (typeof e['_EID'] !== 'undefined' && e['_EID'] != null && typeof e['_EID'] === 'string') {
                const _eid: string = e['_EID'];
                if (typeof LogExecutionTimeForClicks._timeStamps[_eid] !== 'undefined'
                    && LogExecutionTimeForClicks._timeStamps[_eid] != null
                    && typeof LogExecutionTimeForClicks._timeStamps[_eid] === 'number') {
                    const _endDt: number = +new Date().getTime();
                    const _startDt: number = LogExecutionTimeForClicks._timeStamps[_eid];
                    console.log('Click Handler On => ' + e.target + ' => UI thread execution took ' + (_endDt - _startDt) + ' ms');
                }
            }

        },
        _captureListener: (e) => {
            const _eid: string = GUID('EVENTER');
            e['_EID'] = _eid;
            LogExecutionTimeForClicks._timeStamps[_eid] = new Date().getTime();
        },
        enable: function (): void {
            document.addEventListener('click', LogExecutionTimeForClicks._captureListener, true);
            document.addEventListener('click', LogExecutionTimeForClicks._bubbleListener);
        },
        disable: function (): void {
            document.removeEventListener('click', LogExecutionTimeForClicks._captureListener);
            document.removeEventListener('click', LogExecutionTimeForClicks._bubbleListener);
        }
    }
    export function GUID(str: string) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        let id: string = s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        if (str && str.trim() !== '') {
            id = id + str.trim();
        }
        return id;
    }
}
