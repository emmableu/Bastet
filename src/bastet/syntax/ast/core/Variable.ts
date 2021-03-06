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

import {ScratchType} from "./ScratchType";
import {Identifier} from "./Identifier";
import {AbstractExpression} from "./expressions/AbstractExpression";
import {DataLocation} from "../../app/controlflow/DataLocation";
import {Preconditions} from "../../../utils/Preconditions";
import {AbstractNode} from "../AstNode";

export interface Variable {

    identifier: Identifier;

    variableType: ScratchType;

    qualifiedName: string;

}

export class QualifiedVariableName extends AbstractNode {

    private readonly _qualifiedName : string;

    constructor(qualifiedName: string) {
        super([]);
        this._qualifiedName = qualifiedName;
    }

    toTreeString(): string {
        return this._qualifiedName;
    }

}

export class VariableExpression extends AbstractExpression {

    private readonly _variable: VariableWithDataLocation;

    constructor(variable: VariableWithDataLocation) {
        super(Preconditions.checkNotUndefined(variable.expressionType), [variable]);
        this._variable = variable;
    }

    get variable(): VariableWithDataLocation {
        return this._variable;
    }

}

export class VariableWithDataLocation extends AbstractExpression implements Variable {

    private readonly _dataloc: DataLocation;

    private readonly _identifier: Identifier;

    constructor(dataloc: DataLocation) {
        const ident = Identifier.of(dataloc.ident);
        const type = ScratchType.fromId(dataloc.type);
        super(type, [new QualifiedVariableName(dataloc.qualifiedName), type]); // IMPORTANT: Include the type as AST child! Important for using this var as cache key
        this._dataloc = dataloc;
        this._identifier = ident;
    }

    get identifier(): Identifier {
        return this._identifier;
    }

    get qualifiedName(): string {
        return this._dataloc.qualifiedName;
    }

    get dataloc(): DataLocation {
        return this._dataloc;
    }

    get variableType(): ScratchType {
        return this.expressionType;
    }

    toString() {
        return this.qualifiedName;
    }
}

