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

import {Record as ImmRec} from "immutable";
import {PerfTimer} from "../utils/PerfTimer";

export interface AbstractElement extends ImmRec<any> {

}

export interface AbstractElementVisitor<T> {

    visit(element: AbstractElement): T;

}

export interface AbstractState extends AbstractElement {

    accept<T>(visitor: AbstractElementVisitor<T>): T;

}

export interface Lattice<E extends AbstractElement> {

    /**
     * The lattice's inclusion relation (is-less-or-equal).
     * @param element1
     * @param element2
     */
    isIncluded(element1: E, element2: E): boolean;

    /**
     * Determines the greatest lower bound (glb) of two given elements.
     * @param element1
     * @param element2
     */
    meet(element1: E, element2: E): E;

    /**
     * Determines the least upper bound (lub) of two given elements.
     * @param element1
     * @param element2
     */
    join(element1: E, element2: E): E;

    /**
     * Returns the bottom element of the lattice.
     */
    bottom(): E;

    /**
     * Returns the top element of the lattice.
     */
    top(): E;

}

export interface LatticeWithComplements<E extends AbstractElement> extends Lattice<E> {

    complement(element: E): E;

}

export class Lattices {

    private static isFeasible0<E extends AbstractElement>(element: E, inLattice: Lattice<E>) {
        return !inLattice.isIncluded(element, inLattice.bottom());
    }

    public static isFeasible<E extends AbstractElement>(element: E, inLattice: Lattice<E>, purpose: string = null) {
        let isFeasible: boolean;
        if (purpose) {
            console.group(`Feasibility Check (${purpose})...`);
        } else {
            console.group("Feasibility Check...");
        }

        const timer = new PerfTimer(null);
        timer.start();
        try {
            isFeasible = this.isFeasible0(element, inLattice);
            return isFeasible;
        } finally {
            timer.stop();
            console.log(`${isFeasible ? "Feasible" : "Infeasible"} ${timer.lastIntervalDuration}`)
            console.groupEnd();
        }

    }

}
