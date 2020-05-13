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


import {AbstractStateVisitor, DelegatingStateVisitor} from "./AbstractStates";
import {AbstractElement} from "../../lattices/Lattice";
import {ControlAbstractState, RelationLocation, ThreadState} from "./control/ControlAbstractDomain";
import {DataAbstractState} from "./data/DataAbstractDomain";
import {GraphAbstractState} from "./graph/GraphAbstractDomain";
import {SSAState} from "./ssa/SSAAbstractDomain";
import {App} from "../../syntax/app/App";
import {Preconditions} from "../../utils/Preconditions";
import {CorePrintVisitor} from "../../syntax/ast/CorePrintVisitor";
import {TimeState} from "./time/TimeAbstractDomain";
import {ControlLocationExtractor} from "./control/ControlUtils";
import {ImplementMeForException} from "../../core/exceptions/ImplementMeException";
import {Map as ImmMap} from "immutable";
import {IllegalArgumentException} from "../../core/exceptions/IllegalArgumentException";

export class PaperLabelVisitor extends DelegatingStateVisitor<string> {

    private readonly _task: App;

    constructor(task: App) {
        super();
        this._task = Preconditions.checkNotUndefined(task);
    }

    protected defaultResultFor(element: AbstractElement): string {
        return "";
    }

    visitGraphAbstractState(element: GraphAbstractState): string {
        const wrappedLabel: string = element.getWrappedState().accept(this);
        return `e${element.getId()} ${wrappedLabel}`;
    }

    visitControlAbstractState(element: ControlAbstractState): string {
        const v = new ControlLocationExtractor(this._task);
        const relName = (rl: RelationLocation) => this._task.getTransitionRelationById(rl.getRelationId()).name;
        return "@ " + element.accept(v).map( rl => `${rl.getActorId()}:${relName(rl)}:${rl.getLocationId()}`).toArray().toString();
    }

}

export class StateLabelVisitor implements AbstractStateVisitor<string> {

    private readonly _task: App;

    constructor(task: App) {
        this._task = Preconditions.checkNotUndefined(task);
    }

    private formatActorScriptThreadDetails(cs: ControlAbstractState, t: ThreadState, threadIndex: number): string {
        const steppedForIndices = cs.getSteppedFor();
        const wasStepped = (i) => { return steppedForIndices.contains(i) };

        const actor = this._task.getActorByName(t.getActorId());
        const script = actor.getScript(t.getScriptId());

        const astVisitor = new CorePrintVisitor();
        return `${wasStepped(threadIndex) ? "*" : ""}[${t.getThreadId()} ${t.getActorId()} ${t.getScriptId()} ${script.event.accept(astVisitor)} ${t.getRelationLocation().getLocationId()} ${t.getComputationState()} ${t.getWaitingForThreads().join("+")}]`;
    }

    visit(element: AbstractElement): string {
        return "";
    }

    visitControlAbstractState(element: ControlAbstractState): string {
        const steppedForIndices = element.getSteppedFor();
        const wasStepped = (i) => { return steppedForIndices.contains(i) };

        const wrappedLabel: string = element.getWrappedState().accept(this);
        const controlLabel: string = element.getThreadStates()
            .map((t, i) => this.formatActorScriptThreadDetails(element, t, i))
            .join("\n");
        return `${controlLabel}\n${wrappedLabel}`;
    }

    visitDataAbstractState(element: DataAbstractState): string {
        return undefined;
    }

    visitGraphAbstractState(element: GraphAbstractState): string {
        const wrappedLabel: string = element.getWrappedState().accept(this);
        return `${element.getId()} ${wrappedLabel}`;
    }

    visitSSAState(element: SSAState): string {
        const wrappedLabel = element.getWrappedState().accept(this);
        return wrappedLabel;
        // return `${element.getSSA().toString()} ${wrappedLabel}`;
    }

    visitTimeState(element: TimeState): string {
        return element.getWrappedState().accept(this);
    }

}

export class StateColorVisitor extends DelegatingStateVisitor<string> {

    protected defaultResultFor(element: AbstractElement): string {
        return "white";
    }

    visitControlAbstractState(element: ControlAbstractState): string {
        if (element.getIsTargetFor().size > 0) {
            return "crimson";
        } else {
            return "white";
        }
    }

}

export class PenSizeVisitor extends DelegatingStateVisitor<number> {

    protected defaultResultFor(element: AbstractElement): number {
        return 1;
    }

}

export class SSAStateVisitor implements AbstractStateVisitor<SSAState> {

    visit(element: AbstractElement): SSAState {
        throw new ImplementMeForException(element.constructor.name);
    }

    visitControlAbstractState(element: ControlAbstractState): SSAState {
        return element.wrappedState.accept(this);
    }

    visitDataAbstractState(element: DataAbstractState): SSAState {
        throw new IllegalArgumentException("Abstract state didnt contain SSAState");
    }

    visitGraphAbstractState(element: GraphAbstractState): SSAState {
        return element.wrappedState.accept(this);
    }

    visitSSAState(element: SSAState): SSAState {
        return element;
    }

    visitTimeState(element: TimeState): SSAState {
        return element.wrappedState.accept(this);
    }

}
