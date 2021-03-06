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

import {AbstractNode} from "../AstNode";
import {AstNodeList} from "../AstNodeList";
import {Identifier} from "./Identifier";
import {ParameterDeclarationList} from "./ParameterDeclaration";
import {StatementList} from "./statements/Statement";
import {ScratchType, VoidType} from "./ScratchType";
import {Variable, VariableWithDataLocation} from "./Variable";
import {DataLocations} from "../../app/controlflow/DataLocation";


export class ResultDeclaration extends AbstractNode {

    private readonly _variable: Variable;

    constructor(variable: Variable) {
        super([variable.identifier, variable.variableType]);
        this._variable = variable;
    }

    get ident(): Identifier {
        return this._variable.identifier;
    }

    get type(): ScratchType {
        return this._variable.variableType;
    }

    get variable(): Variable {
        return this._variable;
    }

    private static VOID;

    public static void(): ResultDeclaration {
        if (!ResultDeclaration.VOID) {
            ResultDeclaration.VOID = new ResultDeclaration(
                new VariableWithDataLocation(DataLocations.createTypedLocation(
                    Identifier.of(""), VoidType.instance())));
        }
        return ResultDeclaration.VOID;
    }

}

export class MethodSignature extends AbstractNode {

    private readonly _ident: Identifier;
    private readonly _params: ParameterDeclarationList;
    private readonly _returns: ResultDeclaration;
    private readonly _isExtern: boolean;

    constructor(ident: Identifier, params: ParameterDeclarationList, returns: ResultDeclaration, isExtern: boolean) {
        super([ident, params, returns]);
        this._ident = ident;
        this._params = params;
        this._returns = returns;
        this._isExtern = isExtern;
    }

    get ident(): Identifier {
        return this._ident;
    }

    get params(): ParameterDeclarationList {
        return this._params;
    }

    get returns(): ResultDeclaration {
        return this._returns;
    }

    get isExtern(): boolean {
        return this._isExtern;
    }

}

export type MethodDefinitionMap = { [id:string]: MethodDefinition } ;

export type MethodSignatureMap = { [id:string]: MethodSignature } ;

export class ExternMethodDeclaration extends MethodSignature {

    constructor(ident: Identifier, params: ParameterDeclarationList, returns: ResultDeclaration) {
        super(ident, params, returns, true);
    }

}

export class MethodDefinition extends MethodSignature {

    private readonly _statements: StatementList;

    private readonly _isAtomic: boolean;

    constructor(ident: Identifier, params: ParameterDeclarationList, statements: StatementList,
                returns: ResultDeclaration, isAtomic: boolean) {
        super(ident, params, returns, false);
        this._statements = statements;
        this._isAtomic = isAtomic;
    }

    get statements(): StatementList {
        return this._statements;
    }

    get isAtomic(): boolean {
        return this._isAtomic;
    }

}

export type MethodDefinitionType = MethodDefinition | ExternMethodDeclaration ;

export class MethodDefinitions extends AstNodeList<MethodSignature> {

    private readonly _fullMethodDefinitions: MethodDefinitionList;

    private readonly _externalMethods: MethodSignatureList;

    constructor(full: MethodDefinition[], external: ExternMethodDeclaration[]) {
        const elements: MethodSignature[] = [];
        full.forEach((e) => elements.push(e));
        external.forEach((e) => elements.push(e));
        super(elements);
        this._externalMethods = new MethodSignatureList(external.slice());
        this._fullMethodDefinitions = new MethodDefinitionList(full.slice());
    }

    public getFullMethodDefinitions(): MethodDefinitionList {
        return this._fullMethodDefinitions;
    }

    public getExternalMethods(): MethodSignatureList {
        return this._externalMethods;
    }

    public static fromMixed(elements: MethodDefinitionType[]): MethodDefinitions {
        const fullMethodDefinitions = elements.filter((m) => m instanceof MethodDefinition) as MethodDefinition[];
        const externalMethods = elements.filter((m) => m instanceof ExternMethodDeclaration) as ExternMethodDeclaration[];
        return new MethodDefinitions(fullMethodDefinitions, externalMethods);
    }

}

export class MethodDefinitionList extends AstNodeList<MethodDefinition> {

    constructor(elements: MethodDefinition[]) {
        super(elements);
    }

}

export class MethodSignatureList extends AstNodeList<MethodSignature> {

    constructor(elements: MethodSignature[]) {
        super(elements);
    }

}
