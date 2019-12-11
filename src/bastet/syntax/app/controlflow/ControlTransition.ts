/*
 *
 *    Copyright 2019 University of Passau
 *
 *    Project maintained by Andreas Stahlbauer (firstname @ lastname . net)
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import {ControlLocation} from './ControlLocation'
import {ProgramOperation} from './ops/ProgramOperation'

export default class ControlTransition {

    private readonly _fromLocation: ControlLocation;

    private readonly _toLocation: ControlLocation;

    private readonly _operation: ProgramOperation;

    constructor(from: ControlLocation, to: ControlLocation, op: ProgramOperation) {
        this._fromLocation = from;
        this._toLocation = to;
        this._operation = op;
    }

    get from() {
        return this._fromLocation
    }

    get to() {
        return this._toLocation
    }

    get op() {
        return this._operation
    }

}