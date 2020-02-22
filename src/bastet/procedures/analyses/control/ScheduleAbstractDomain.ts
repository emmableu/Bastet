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

import {SingletonStateWrapper} from "../AbstractStates";
import {AbstractDomain, AbstractionPrecision} from "../../domains/AbstractDomain";
import {AbstractElement, Lattice} from "../../../lattices/Lattice";
import {List as ImmList, Record as ImmRec, Set as ImmSet} from "immutable";
import {ActorId} from "../../../syntax/app/Actor";
import {LocationID} from "../../../syntax/app/controlflow/ControlLocation";
import {ScriptId} from "../../../syntax/app/controlflow/Script";
import {ImplementMeException} from "../../../core/exceptions/ImplementMeException";
import {ConcreteDomain} from "../../domains/ConcreteElements";
import {App} from "../../../syntax/app/App";
import {BootstrapEvent} from "../../../syntax/ast/core/CoreEvent";
import {Property} from "../../../syntax/Property";

export const THREAD_STATE_RUNNING = 1;
export const THREAD_STATE_RUNNING_ATOMIC = 2;
export const THREAD_STATE_WAIT = 3;
export const THREAD_STATE_DONE = 4;
export const THREAD_STATE_YIELD = 5;
export const THREAD_STATE_FAILURE = 6;
export const THREAD_STATE_UNKNOWN = 0;

export type ScriptComputationState = number;

export type ThreadId = number;

export interface ScheduleConcreteState {

}

export interface ThreadStateAttributes {

    threadId: ThreadId;

    actorId: ActorId;

    scriptId: ScriptId;

    locationId: LocationID;

    computationState: ScriptComputationState;

    waitingForThreads: ImmSet<ThreadId>;

    failedFor: ImmSet<Property>;

}

const ThreadStateRecord = ImmRec({
    threadId: -1,
    actorId: "",
    scriptId: -1,
    locationId: -1,
    computationState: THREAD_STATE_UNKNOWN,
    waitingForThreads: ImmSet<ThreadId>(),
    failedFor: ImmSet<Property>()
});

export class ThreadState extends ThreadStateRecord implements AbstractElement {

    constructor(threadId: ThreadId, actorId: ActorId, scriptId: ScriptId,
                locationId: LocationID, compState: ScriptComputationState,
                waitingForThreads: ImmSet<ThreadId>, failedFor: ImmSet<Property>) {
        super({threadId: threadId, actorId: actorId, scriptId: scriptId,
            locationId: locationId, computationState: compState,
            waitingForThreads: waitingForThreads, failedFor: failedFor});
    }

    public getThreadId(): ThreadId {
        return this.get('threadId');
    }

    public getActorId(): ActorId {
        return this.get('actorId');
    }

    public getScriptId(): ScriptId {
        return this.get('scriptId');
    }

    public getLocationId(): LocationID {
        return this.get('locationId');
    }

    public withLocationId(value: LocationID): ThreadState {
        return this.set('locationId', value);
    }

    public getComputationState(): ScriptComputationState {
        return this.get('computationState');
    }

    public withComputationState(value: ScriptComputationState): ThreadState {
        return this.set('computationState', value);
    }

    public getWaitingForThreads(): ImmSet<ThreadId> {
        return this.get('waitingForThreads');
    }

    public getFailedFor(): ImmSet<Property> {
        return this.get('failedFor');
    }

    public withWaitingForThreads(value: ImmSet<ThreadId>): ThreadState {
        return this.set('waitingForThreads', value);
    }

    public withFailedFor(value: ImmSet<Property>): ThreadState {
        return this.set('failedFor', value);
    }

}

export class ThreadStateFactory {

    private static THREAD_ID_SEQ: number;

    public static freshId(): number {
        if (!ThreadStateFactory.THREAD_ID_SEQ) {
            ThreadStateFactory.THREAD_ID_SEQ = 0;
        }
        return ThreadStateFactory.THREAD_ID_SEQ++;
    }

    public static createRunningThread(actorId: ActorId,
                                      scriptId: ScriptId, locationId: LocationID): ThreadState {
        const threadId = this.freshId();
        return new ThreadState(threadId, actorId, scriptId, locationId,
            THREAD_STATE_RUNNING, ImmSet(), ImmSet());
    }

}

export interface ScheduleAbstractStateAttributes extends AbstractElement, SingletonStateWrapper {

    isTargetFor: ImmSet<Property>;

    threadStates: ImmList<ThreadState>;

    wrappedState: AbstractElement;

}

const ScheduleAbstractStateRecord = ImmRec({

    threadStates: ImmList<ThreadState>([]),

    wrappedState: null,

    isTargetFor: ImmSet()

});


/**
 * A state with SHARED MEMORY
 */
export class ScheduleAbstractState extends ScheduleAbstractStateRecord implements AbstractElement {

    constructor(threadStates: ImmList<ThreadState>, wrappedState: AbstractElement, isTargetFor: ImmSet<Property>) {
        super({threadStates: threadStates, wrappedState: wrappedState, isTargetFor: isTargetFor});
    }

    public getThreadStates(): ImmList<ThreadState> {
        return this.get("threadStates");
    }

    public getWrappedState(): AbstractElement {
        return this.get("wrappedState");
    }

    public getIsTargetFor(): ImmSet<Property> {
        return this.get("isTargetFor");
    }
}

export class ScheduleAbstractStateFactory {

    public static createState(threadStates: ImmList<ThreadState>, wrappedStated: ImmRec<any>, isTargetFor: ImmSet<Property>): ScheduleAbstractState {
        return new ScheduleAbstractState(threadStates, wrappedStated, isTargetFor);
    }

    static createInitialState(task: App, wrappedState: ImmRec<any>, isTarget) {
        let threads = ImmList<ThreadState>([]);
        for (const actor of task.actors) {
            for (const script of actor.scripts) {
                const threadId = ThreadStateFactory.freshId();
                let threadState = THREAD_STATE_WAIT;
                if (script.event === BootstrapEvent.instance()) {
                    threadState = THREAD_STATE_RUNNING;
                }
                for (const locId of script.transitions.entryLocationSet) {
                    threads = threads.push(new ThreadState(threadId, actor.ident, script.id, locId,
                        threadState, ImmSet(), ImmSet()));
                }
            }
        }

        return new ScheduleAbstractState(threads, wrappedState, isTarget);
    }
}

export class ScheduleAbstractDomain implements AbstractDomain<ScheduleConcreteState, ScheduleAbstractState> {

    lattice: Lattice<ScheduleAbstractState>;

    abstract(elements: Iterable<ScheduleConcreteState>): ScheduleAbstractState {
        throw new ImplementMeException();
    }

    concretize(element: ScheduleAbstractState): Iterable<ScheduleConcreteState> {
        throw new ImplementMeException();
    }

    widen(element: ScheduleAbstractState, precision: AbstractionPrecision): ScheduleAbstractState {
        throw new ImplementMeException();
    }

    get concreteDomain(): ConcreteDomain<ScheduleConcreteState> {
        throw new ImplementMeException();
    }

}