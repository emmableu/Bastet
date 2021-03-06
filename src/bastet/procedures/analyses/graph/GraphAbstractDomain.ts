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

import {AbstractDomain, AbstractionPrecision} from "../../domains/AbstractDomain";
import {AbstractElement, AbstractElementVisitor, AbstractState, Lattice} from "../../../lattices/Lattice";
import {ImplementMeException} from "../../../core/exceptions/ImplementMeException";
import {Record as ImmRec, Set as ImmSet} from "immutable"
import {SingletonStateWrapper} from "../AbstractStates";
import {ConcreteDomain, ConcreteElement} from "../../domains/ConcreteElements";
import {Preconditions} from "../../../utils/Preconditions";
import {PartitionKey} from "../../algorithms/StateSet";

export type GraphStateId = number;

export interface GraphAbstractStateAttribs extends AbstractElement, SingletonStateWrapper {

    id: GraphStateId;

    predecessors: ImmSet<GraphStateId>;

    mergeOf: ImmSet<GraphStateId>;

    wrappedState: ImmRec<any>;

    partitionKeys: ImmSet<PartitionKey>;

}

const GraphAbstractStateRecord = ImmRec({
    id: 0,
    predecessors: ImmSet<GraphStateId>([]),
    wrappedState: null,
    mergeOf: ImmSet<GraphStateId>([]),
    partitionKeys: ImmSet()
});

let STATE_ID_SEQ: number = 0;

export class GraphAbstractState extends GraphAbstractStateRecord implements GraphAbstractStateAttribs, AbstractState {

    constructor(id: GraphStateId, preds: ImmSet<GraphStateId>, mergeOf: ImmSet<GraphStateId>, wrapped: ImmRec<any>,
                partitionKey: ImmSet<PartitionKey>) {
        super({id: id, predecessors: preds, wrappedState: wrapped, mergeOf: mergeOf, partitionKeys: partitionKey});
    }

    public getId(): number {
        return this.get('id');
    }

    public getPredecessors(): ImmSet<GraphStateId> {
        return this.get('predecessors');
    }

    public getMergeOf(): ImmSet<GraphStateId> {
        return this.get('mergeOf');
    }

    public getWrappedState(): AbstractState {
        return this.get('wrappedState');
    }

    public withPartitionKeys(keys: ImmSet<PartitionKey>): GraphAbstractState {
        return this.set('partitionKeys', keys);
    }

    public withMergeOf(of: ImmSet<GraphStateId>) {
        return this.set('mergeOf', of);
    }

    public withPredecessors(preds: ImmSet<GraphStateId>): GraphAbstractState {
        return this.set('predecessors', preds);
    }

    public withWrappedState(wrapped: AbstractState): GraphAbstractState {
        return this.set('wrappedState', wrapped);
    }

    public withFreshId(): GraphAbstractState {
        if (!STATE_ID_SEQ) {
            STATE_ID_SEQ = 0;
        }
        const freshId = STATE_ID_SEQ++;

        return this.set('id', freshId);
    }

    public getPartitionKeys(): ImmSet<PartitionKey> {
        return this.get('partitionKeys');
    }

    public accept<R>(visitor: AbstractElementVisitor<R>): R {
        const visitMethod: string = `visit${this.constructor.name}`;
        if (visitor[visitMethod]) {
            return visitor[visitMethod](this);
        } else {
            return visitor.visit(this);
        }
    }
}


export class GraphAbstractStateFactory {

    public static withFreshID(preds: Iterable<GraphStateId>, mergeOf: Iterable<GraphStateId>, wrapped: ImmRec<any>,
                              wrappedKeys: ImmSet<PartitionKey>): GraphAbstractState {
        if (!STATE_ID_SEQ) {
            STATE_ID_SEQ = 0;
        }
        const freshId = STATE_ID_SEQ++;
        return new GraphAbstractState(freshId, ImmSet(preds), ImmSet(mergeOf).union([freshId]), wrapped, wrappedKeys);
    }

}

export class GraphAbstractStateLattice implements Lattice<GraphAbstractState> {

    private readonly _wrappedLattice: Lattice<AbstractElement>;

    constructor(wrappedLattice: Lattice<AbstractElement>) {
        this._wrappedLattice = Preconditions.checkNotUndefined(wrappedLattice);
    }

    bottom(): GraphAbstractState {
        throw new ImplementMeException();
    }

    isIncluded(element1: GraphAbstractState, element2: GraphAbstractState): boolean {
        throw new ImplementMeException();
    }

    join(element1: GraphAbstractState, element2: GraphAbstractState): GraphAbstractState {
        return GraphAbstractStateFactory.withFreshID(
            element1.getPredecessors().union(element2.getPredecessors()),
            element1.getMergeOf().union(element2.getMergeOf()),
            this._wrappedLattice.join(element1.getWrappedState(), element2.getWrappedState()),
            element1.getPartitionKeys());
    }

    meet(element1: GraphAbstractState, element2: GraphAbstractState): GraphAbstractState {
        throw new ImplementMeException();
    }

    top(): GraphAbstractState {
        throw new ImplementMeException();
    }
}

export class GraphAbstractDomain implements AbstractDomain<ConcreteElement, GraphAbstractState> {

    private readonly _lattice: GraphAbstractStateLattice;
    private readonly _wrapped: AbstractDomain<ConcreteElement, AbstractElement>;

    constructor(wrapped: AbstractDomain<ConcreteElement, AbstractElement>) {
        this._wrapped = Preconditions.checkNotUndefined(wrapped);
        this._lattice = new GraphAbstractStateLattice(wrapped.lattice);
    }

    get lattice(): Lattice<GraphAbstractState> {
        return this._lattice;
    }

    abstract(elements: Iterable<ConcreteElement>): GraphAbstractState {
        throw new ImplementMeException();
    }

    concretize(element: GraphAbstractState): Iterable<ConcreteElement> {
        throw new ImplementMeException();
    }

    concretizeOne(element: GraphAbstractState): ConcreteElement {
        return this._wrapped.concretizeOne(element.getWrappedState());
    }

    widen(element: GraphAbstractState, precision: AbstractionPrecision): GraphAbstractState {
        throw new ImplementMeException();
    }

    get concreteDomain(): ConcreteDomain<ConcreteElement> {
        throw new ImplementMeException();
    }
}
