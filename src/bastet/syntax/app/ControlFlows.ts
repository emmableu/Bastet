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

import {App} from "./App";
import {IllegalArgumentException} from "../../core/exceptions/IllegalArgumentException";
import {Actor} from "./Actor";
import {Preconditions} from "../../utils/Preconditions";
import {TypeInformationStorage} from "../DeclarationScopes";

export class ControlFlows {

    public static unionOf(controlflow1: App, controlflow2: App, ident: string) : App {
        const unionActors: Actor[] = controlflow1.actors.concat(controlflow2.actors);
        const typeInfoUnion: TypeInformationStorage = TypeInformationStorage.union(controlflow1.typeStorage, controlflow2.typeStorage);
        let resultActorsMap = {};

        for (let a of unionActors) {
            if (resultActorsMap[a.ident]) {
                if (a.isBootstrapper || a.isTerminator) {
                    Preconditions.checkState(resultActorsMap[a.ident] === a);
                    continue;
                }
                throw new IllegalArgumentException("Duplicated actor name! " + a.ident);
            }
            resultActorsMap[a.ident] = a;
        }

        return new App("union_of_" + controlflow1.origin + "_and_" + controlflow2.origin, ident, resultActorsMap, typeInfoUnion);
    }

}
