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


import {ReachedSet} from "../../../algorithms/StateSet";
import {AbstractElement, AbstractElementVisitor, AbstractState} from "../../../../lattices/Lattice";
import {App} from "../../../../syntax/app/App";
import {AbstractStateVisitor, DelegatingStateVisitor} from "../../AbstractStates";
import {List as ImmList, Map as ImmMap, Record as ImmRec, Set as ImmSet} from "immutable";
import {ControlAbstractState, IndexedThread, RelationLocation} from "../ControlAbstractDomain";
import {Preconditions} from "../../../../utils/Preconditions";
import {TransitionRelation} from "../../../../syntax/app/controlflow/TransitionRelation";
import {ActorId} from "../../../../syntax/app/Actor";

export class ControlCoverageReport {

    private readonly _absUncoveredLocations: number;

    private readonly _absCoveredLocations: number;

    private readonly _totalTaskLocations: number;

    private readonly _numberOfUncoveredPerRelation: ImmMap<any, any>;

    constructor(absUncoveredLocations: number, absCoveredLocations: number, totalTaskLocations: number,
                numberOfUncoveredPerRelation: {}) {
        Preconditions.checkArgument(totalTaskLocations > 0);
        this._absUncoveredLocations = absUncoveredLocations;
        this._absCoveredLocations = absCoveredLocations;
        this._totalTaskLocations = totalTaskLocations;
        this._numberOfUncoveredPerRelation = ImmMap(numberOfUncoveredPerRelation);
    }

    get uncoveredControlLocationsAbs(): number {
        return this._absUncoveredLocations;
    }

    get coveredControlLocationsAbs(): number {
        return this._absCoveredLocations;
    }

    get controlCoveragePercent(): number {
        return Math.floor((this._absCoveredLocations / this._totalTaskLocations) * 10000) / 10000;
    }

    get numberOfUncoveredPerRelation(): ImmMap<any, any> {
        return this._numberOfUncoveredPerRelation;
    }
}

/**
 * Extracts the set of control locations to that the abstract
 * state made a step to.
 */
class ControlLocationExtractor extends DelegatingStateVisitor<ImmSet<RelationLocation>> {

    private readonly _task: App;

    constructor(task: App) {
        super();
        this._task = Preconditions.checkNotUndefined(task);
    }

    protected defaultResultFor(element: AbstractElement): ImmSet<RelationLocation> {
        return ImmSet<RelationLocation>();
    }

    visitControlAbstractState(element: ControlAbstractState): ImmSet<RelationLocation> {
        const steppedThreads = element.getSteppedFor().map((i) => element.getIndexedThreadState(i));

        let result = ImmSet();

        for (const steppedThread of steppedThreads) {
            const relLoc: RelationLocation = steppedThread.threadStatus.getRelationLocation();
            result = result.add(relLoc);
        }

        return result;
    }

}

export class ControlCoverageExaminer {

    public determineCoverageOf(task: App, reached: ReachedSet<AbstractState>): ControlCoverageReport {
        // 1. Extract the set of reached control locations from the set `reached`
        const reachedLocs = this.collectReachedLocs(task, reached);

        // 2. Collect the set of control locations of the task
        const taskLocsAll = this.collectTaskLocs(task);
        const taskLocs = taskLocsAll.filter((l) => {
            // Filter out some locations for this calculation
           const relation = task.getTransitionRelationById(l.getRelationId());
           return !(relation.entryLocationSet.contains(l.getLocationId())
                || relation.exitLocationSet.contains(l.getLocationId()));
        });

        // 3. Build the coverage report
        const uncoveredLocs = taskLocs.subtract(reachedLocs);
        const coveredLocs = taskLocs.subtract(uncoveredLocs);

        const rwu = {};
        for (const ucrl of uncoveredLocs) {
            const relation = task.getTransitionRelationById(ucrl.getRelationId());
            rwu[relation.name] = (rwu[relation.name] || 0) + 1;
        }

        // ATTENTION: Dead code (unreachable code/locations are not considered by this calculation!)
        return new ControlCoverageReport(uncoveredLocs.size, coveredLocs.size, taskLocs.size, rwu);
    }

    private collectReachedLocs(task: App, reached: ReachedSet<AbstractState>): ImmSet<RelationLocation> {
        const result = ImmSet<RelationLocation>().asMutable();
        const visitor = new ControlLocationExtractor(task);
        for (const e of reached) {
            e.accept(visitor).map((rl) => result.add(rl));
        }
        return result.asImmutable();
    }

    private collectTaskLocs(task: App): ImmSet<RelationLocation> {
        const result: ImmSet<RelationLocation> = ImmSet().asMutable();

        const collectLocsFromRelation = (actor: ActorId, rel: TransitionRelation) => {
            for (const lid of rel.locationSet) {
                result.add(new RelationLocation(actor, rel.ident, lid));
            }
        };

        for (const actor of task.actors) {
            for (const script of actor.scripts) {
                collectLocsFromRelation(actor.ident, script.transitions);
            }
            for (const method of actor.methods) {
                collectLocsFromRelation(actor.ident, method.transitions);
            }
        }

        return result.asImmutable();
    }

}