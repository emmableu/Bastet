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

import {AbstractElement} from './AbstractElement'
import {Record, Set} from 'immutable'

export interface FlatElementAttributes {
    readonly value: any
}

export const bottomElementAttributes: FlatElementAttributes = {
    value: Set(),
}

export class FlatElement extends Record(bottomElementAttributes) implements FlatElementAttributes, AbstractElement {
    constructor(value: any) {
        super({ value: value })
    }

    get value() {
        return this.get('value')
    }
}