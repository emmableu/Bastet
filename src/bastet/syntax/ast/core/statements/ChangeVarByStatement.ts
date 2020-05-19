/*
 *   BASTET Program Analysis and Verification Framework
 *
 *   Copyright 2020 by University of Passau (uni-passau.de)
 *
 *   See the file CONTRIBUTORS.md for the list of contributors.
 *
 *   Please make sure to CITE this work in your publications if you
 *   build on this work. Some of our maintainers or contributors might
 *   be interested in actively CONTRIBUTING to your research project.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

import {Statement} from "./Statement";
import {Expression} from "../expressions/Expression";
import {Variable} from "../Variable";

export class ChangeVarByStatement extends Statement {

    private readonly _variable: Variable;
    private readonly _value: Expression;

    constructor(variable: Variable, value: Expression) {
        super([variable.identifier, value]);
        this._variable = variable;
        this._value = value;
    }

    get variable(): Variable {
        return this._variable;
    }

    get value(): Expression {
        return this._value;
    }
}
