/*
 *   BASTET Program Analysis and Verification Framework
 *
 *   Copyright 2019 by University of Passau (uni-passau.de)
 *
 *   Maintained by Andreas Stahlbauer (firstname@lastname.net)
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

import {
    MergeIntoOperator,
    ProgramAnalysis,
    TransitionLabelProvider,
    WrappingProgramAnalysis
} from "../ProgramAnalysis";
import {AbstractDomain} from "../../domains/AbstractDomain";
import {
    GraphAbstractDomain,
    GraphAbstractState,
    GraphAbstractStateFactory,
    GraphConcreteState
} from "./GraphAbstractDomain";
import {App} from "../../../syntax/app/App";
import {GraphTransferRelation} from "./GraphTransferRelation";
import {AbstractElement, AbstractState} from "../../../lattices/Lattice";
import {OrderedStateSet, StateSet} from "../../algorithms/StateSet";
import {Preconditions} from "../../../utils/Preconditions";
import {GraphToDot} from "./GraphToDot";
import {Refiner, Unwrapper, Wrapper, WrappingRefiner} from "../Refiner";
import {Property} from "../../../syntax/Property";
import {GraphReachedSetWrapper} from "./GraphStatesSetWrapper";
import {AnalysisStatistics} from "../AnalysisStatistics";
import {ProgramOperation} from "../../../syntax/app/controlflow/ops/ProgramOperation";
import {NoMergeIntoOperator, StandardMergeIntoOperator} from "../Operators";
import {BastetConfiguration} from "../../../utils/BastetConfiguration";
import {IllegalArgumentException} from "../../../core/exceptions/IllegalArgumentException";


export class GraphAnalysisConfig extends BastetConfiguration {

    constructor(dict: {}) {
        super(dict, ['GraphAnalysis']);
    }

    get mergeIntoOperator(): string {
        return this.getStringProperty('mergeIntoOperator', 'NoMergeIntoOperator');
    }

}

export class GraphAnalysis implements WrappingProgramAnalysis<GraphConcreteState, GraphAbstractState, GraphAbstractState>,
    Unwrapper<GraphAbstractState, AbstractElement>,
    TransitionLabelProvider<GraphAbstractState> {

    private readonly _abstractDomain: AbstractDomain<GraphConcreteState, GraphAbstractState>;

    private readonly _wrappedAnalysis: ProgramAnalysis<any, any, any>;

    private readonly _transferRelation: GraphTransferRelation;

    private readonly _refiner: Refiner<GraphAbstractState>;

    private readonly _task: App;

    private readonly _statistics: AnalysisStatistics;

    private readonly _mergeIntoOp: MergeIntoOperator<GraphAbstractState, GraphAbstractState>;

    private readonly _config: GraphAnalysisConfig;

    constructor(config: {}, task: App, wrappedAnalysis: ProgramAnalysis<any, any, any>, statistics: AnalysisStatistics) {
        this._statistics = Preconditions.checkNotUndefined(statistics).withContext(this.constructor.name);

        this._config = new GraphAnalysisConfig(config);
        this._task = Preconditions.checkNotUndefined(task);
        this._wrappedAnalysis = Preconditions.checkNotUndefined(wrappedAnalysis);
        this._abstractDomain = new GraphAbstractDomain(wrappedAnalysis.abstractDomain);
        this._transferRelation = new GraphTransferRelation((e) => this._wrappedAnalysis.abstractSucc(e));
        this._refiner = new WrappingRefiner(this._wrappedAnalysis.refiner, this);

        if (this._config.mergeIntoOperator == 'NoMergeIntoOperator') {
            this._mergeIntoOp = new NoMergeIntoOperator<GraphAbstractState, GraphAbstractState>();

        } else if (this._config.mergeIntoOperator == 'StandardMergeIntoOperator') {
            this._mergeIntoOp = new StandardMergeIntoOperator(this, this, this);

        } else {
            throw new IllegalArgumentException("Illegal configuration value");
        }
    }

    abstractSucc(fromState: GraphAbstractState): Iterable<GraphAbstractState> {
        return this._transferRelation.abstractSucc(fromState);
    }

    join(state1: GraphAbstractState, state2: GraphAbstractState): GraphAbstractState {
        return this._abstractDomain.lattice.join(state1, state2);
    }

    shouldMerge(state1: GraphAbstractState, state2: GraphAbstractState): boolean {
        return this._wrappedAnalysis.shouldMerge(state1.getWrappedState(), state2.getWrappedState());
    }

    merge(state1: GraphAbstractState, state2: GraphAbstractState): GraphAbstractState {
        return GraphAbstractStateFactory.withFreshID(
            state1.getPredecessors().union(state2.getPredecessors()),
            state1.getMergeOf().union(state2.getMergeOf()),
            this._wrappedAnalysis.merge(state1.getWrappedState(), state2.getWrappedState()));
    }

    mergeInto(state: GraphAbstractState, frontier: StateSet<GraphAbstractState>, reached: StateSet<GraphAbstractState>, unwrapper: (AbstractElement) => GraphAbstractState, wrapper: (E) => AbstractElement): [StateSet<GraphAbstractState>, StateSet<GraphAbstractState>] {
        return this._mergeIntoOp.mergeInto(state, frontier, reached, unwrapper, wrapper);
    }

    stop(state: GraphAbstractState, reached: Iterable<GraphAbstractState>, unwrapper: (GraphAbstractState) => GraphAbstractState): boolean {
        for (const r of reached) {
            if (r.getMergeOf().contains(state.getId())) {
                return true;
            }
        }
        return this._wrappedAnalysis.stop(state.getWrappedState(), reached, (e) => this.unwrap(unwrapper(e)));
    }

    target(state: GraphAbstractState): Property[] {
        return this._wrappedAnalysis.target(state.wrappedState);
    }

    widen(state: GraphAbstractState): GraphAbstractState {
        // TODO: Implement the widening (delegate to wrapped analyses)
        return state;
    }

    initialStatesFor(task: App): GraphAbstractState[] {
        Preconditions.checkArgument(task === this._task);
        return this._wrappedAnalysis.initialStatesFor(task).map((w) => {
            return GraphAbstractStateFactory.withFreshID([],[],  w);
        } );
    }

    exportAnalysisResult(reachedPrime: StateSet<AbstractState>, frontierPrime: StateSet<AbstractState>) {
        const exporter = new GraphToDot(this._task, this,
            reachedPrime as StateSet<GraphAbstractState>,
            frontierPrime as StateSet<GraphAbstractState>);

        exporter.writeToFile(`output/reachability-graph.dot`);
    }

    unwrap(e: GraphAbstractState): AbstractElement {
        return e.getWrappedState();
    }

    get refiner(): Refiner<GraphAbstractState> {
        return this._refiner;
    }

    get abstractDomain(): AbstractDomain<GraphConcreteState, GraphAbstractState> {
        return this._abstractDomain;
    }

    get wrappedAnalysis(): ProgramAnalysis<any, any, GraphAbstractState> {
        return this._wrappedAnalysis;
    }

    createStateSets(): [StateSet<GraphAbstractState>, StateSet<GraphAbstractState>] {
        const frontierSet = new OrderedStateSet<GraphAbstractState>();
        const reachedSet = new GraphReachedSetWrapper(frontierSet);
        return [frontierSet, reachedSet];
    }

    getTransitionLabel(from: GraphAbstractState, to: GraphAbstractState): ProgramOperation[] {
        return this.wrappedAnalysis['getTransitionLabel'](from.getWrappedState(), to.getWrappedState());
    }

    partitionOf(ofState: GraphAbstractState, reached: StateSet<GraphAbstractState>): Iterable<GraphAbstractState> {
        return this.wrappedAnalysis.partitionOf(ofState.getWrappedState(), reached);
    }

}
