/*
 *   BASTET Program Analysis and Verification Framework
 *
 *   Copyright 2019 by University of Passau (uni-passau.de)
 *
 *   Maintained by Andreas Stahlbauer (firstname@lastname.net),
 *   see the file CONTRIBUTORS.md for the list of contributors.
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

import {AbstractElement, Lattice} from "../../lattices/Lattice";
import {ImmutableMap} from "../../utils/ImmutableMap";
import {ImmutableList} from "../../utils/ImmutableList";
import {Preconditions} from "../../utils/Preconditions";
import {Record as ImmRec} from "immutable";
import {ImplementMeException} from "../../core/exceptions/ImplementMeException";

export interface ConcreteElement {

}

export class ConcreteNumberOrderLattice implements Lattice<ConcreteNumber> {

    private readonly _bottom: ConcreteNumber;
    private readonly _top: ConcreteNumber;

    constructor(bottomElement: ConcreteNumber, topElement: ConcreteNumber) {
        this._bottom = Preconditions.checkNotUndefined(bottomElement);
        this._top = Preconditions.checkNotUndefined(topElement);
    }

    bottom(): ConcreteNumber {
        return this._bottom;
    }

    isIncluded(element1: ConcreteNumber, element2: ConcreteNumber): boolean {
        return element1.value <= element2.value;
    }

    join(element1: ConcreteNumber, element2: ConcreteNumber): ConcreteNumber {
        throw new ImplementMeException();
    }

    meet(element1: ConcreteNumber, element2: ConcreteNumber): ConcreteNumber {
        throw new ImplementMeException();
    }

    top(): ConcreteNumber {
        return this._top;
    }

}

export interface ConcretePrimitiveValue<T> extends ConcreteElement {

    value: T;

}

const ConcretePrimitiveValueRecord = ImmRec({

    value: null,

});

export class ConcretePrimitive<T> extends ConcretePrimitiveValueRecord implements ConcretePrimitiveValue<T> {

    constructor(args: any = {}) {
        super(Object.assign({}, args, {}));
    }

    get value(): T {
        return this.get('value');
    }
}

export class ConcreteString extends ConcretePrimitive<string> {

    constructor(value: string) {
        super({value: value});
    }
}

export class ConcreteBoolean extends ConcretePrimitive<boolean> {

    constructor(value: boolean) {
        super({value: value});
    }
}

export class ConcreteNumber extends ConcretePrimitive<number> {

    constructor(value: number) {
        super({value: value});
    }
}

export interface ConcreteDomain<T extends ConcreteElement> {

    createElement(attrs: {}): T;

}

export class ConcreteNumberDomain implements ConcreteDomain<ConcreteNumber> {

    createElement(attrs: {}): ConcreteNumber {
        return new ConcreteNumber(attrs['value']);
    }

    elementFomPrimitive(num: number): ConcreteNumber {
        return new ConcreteNumber(num);
    }

}

export class ConcreteBooleanDomain implements ConcreteDomain<ConcreteBoolean> {

    createElement(attrs: {}): ConcreteBoolean {
        return new ConcreteBoolean(attrs['value']);
    }

    elementFomPrimitive(val: boolean): ConcreteBoolean {
        return new ConcreteBoolean(val);
    }

}

export class ConcreteBoundedStringDomain implements ConcreteDomain<ConcreteString> {

    private readonly _bound: number;

    constructor(bound: number) {
        this._bound = bound;
    }

    createElement(attrs: {}): ConcreteString {
        return this.createFrom(attrs['value']);
    }

    createFrom(str: string): ConcreteString {
        return new ConcreteString(str.substr(0, this._bound));
    }

}

export class ConcreteBoundedStringListDomain implements ConcreteDomain<ConcreteStringList> {

    private readonly _bound: number;

    constructor(bound: number) {
        this._bound = bound;
    }

    createElement(attrs: {}): ConcreteStringList {
        throw new ImplementMeException();
    }

    createFrom(lst: ConcreteString[]) {
        Preconditions.checkNotUndefined(lst);
        return new ConcreteStringList(lst.slice(0, this._bound)); // `slice`: excluding the end
    }

}


export class ConcreteMemory implements ConcreteElement {

    private readonly _numberMem: ImmutableMap<string, ConcreteNumber>;

    private readonly _stringMem: ImmutableMap<string, ConcreteString>;

    private readonly _booleanMem: ImmutableMap<string, ConcreteBoolean>;

    private readonly _listMem: ImmutableMap<string, ConcreteList<ConcreteString>>;

    constructor(numberMem: Map<string, ConcreteNumber>, stringMem: Map<string, ConcreteString>,
                booleanMem: Map<string, ConcreteBoolean>, listMem: Map<string, ConcreteList<ConcreteString>>) {
        this._numberMem = ImmutableMap.copyOf(numberMem);
        this._stringMem = ImmutableMap.copyOf(stringMem);
        this._booleanMem = ImmutableMap.copyOf(booleanMem);
        this._listMem = ImmutableMap.copyOf(listMem);
    }

    get numberMem(): ImmutableMap<string, ConcreteNumber> {
        return this._numberMem;
    }

    get stringMem(): ImmutableMap<string, ConcreteString> {
        return this._stringMem;
    }

    get booleanMem(): ImmutableMap<string, ConcreteBoolean> {
        return this._booleanMem;
    }

    get listMem(): ImmutableMap<string, ConcreteList<ConcreteString>> {
        return this._listMem;
    }
}

export class ConcreteList<Of> implements ConcreteElement {

    private readonly _elements: ImmutableList<Of>;

    constructor(elements: Of[]) {
        Preconditions.checkNotUndefined(elements);
        this._elements = new ImmutableList(elements);
    }

    get elements(): ImmutableList<Of> {
        return this._elements;
    }
}

export class ConcreteStringList extends ConcreteList<ConcreteString> {

    constructor(elements: ConcreteString[]) {
        super(elements);
    }
}

export class ConcreteElementFactory {

    static concreteStringFrom(str: string): ConcreteString {
        return new ConcreteString(str);
    }

    static concreteNumberFrom(num: number): ConcreteNumber {
        return new ConcreteNumber(num);
    }

    static concreteBooleanFrom(bo: boolean): ConcreteBoolean {
        return new ConcreteBoolean(bo);
    }

}
