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


import {ConcreteElement} from "../domains/ConcreteElements";
import {AbstractElement} from "../../lattices/Lattice";
import {StateSet} from "./StateSet";
import {AnalysisAlgorithm} from "./Algorithm";
import {Refiner} from "../analyses/Refiner";
import {Preconditions} from "../../utils/Preconditions";

export class BMCAlgorithm<C extends ConcreteElement, E extends AbstractElement>
    implements AnalysisAlgorithm<C, E> {

    private readonly wrappedAlgorithm: AnalysisAlgorithm<C, E>;

    private readonly refiner: Refiner<E>;

    constructor(wrappedAlgorithm: AnalysisAlgorithm<C, E>, refiner: Refiner<E>) {
        this.wrappedAlgorithm = Preconditions.checkNotUndefined(wrappedAlgorithm);
        this.refiner = Preconditions.checkNotUndefined(refiner);
    }

    public run(frontier: StateSet<E>, reached: StateSet<E>): [StateSet<E>, StateSet<E>] {
        do {
            [frontier, reached] = this.wrappedAlgorithm.run(frontier, reached);
        } while (!frontier.isEmpty());

        return [frontier, reached];
    }
}
