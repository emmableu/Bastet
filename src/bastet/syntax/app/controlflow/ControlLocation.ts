/*
 *
 *    Copyright 2019 University of Passau
 *
 *    Project maintained by Andreas Stahlbauer (firstname @ lastname . net)
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import {WithIdent} from "../../../utils/WithIdent";

export type LocationID = number;

export class ControlLocation implements WithIdent {

    private readonly _id: LocationID

    private constructor(id: LocationID) {
        this._id = id
    }

    get ident() {
        return this._id
    }

    private static locations: Map<LocationID, ControlLocation> = new Map();
    private static compounds: Map<LocationID, Map<LocationID, ControlLocation>> = new Map();
    private static locationSequence: number = 0;

    private static newLocationID(): LocationID {
        if (isNaN(ControlLocation.locationSequence)) {
            ControlLocation.locationSequence = 0;
        }
        ControlLocation.locationSequence++;
        return ControlLocation.locationSequence;
    }

    public static compound(majorLoc: ControlLocation, minorLoc: ControlLocation): ControlLocation {
        let compoundOnMajor: Map<LocationID, ControlLocation> = this.compounds.get(majorLoc.ident);
        if (!compoundOnMajor) {
            compoundOnMajor = new Map();
            this.compounds.set(majorLoc.ident, compoundOnMajor);
        }

        let result: ControlLocation = compoundOnMajor.get(minorLoc.ident);
        if (!result) {
            // Create a new compound location
            let compLocId: LocationID = this.newLocationID();
            result = new ControlLocation(compLocId);

            // Store the pairing that resulted in the compound location
            compoundOnMajor.set(minorLoc.ident, result);

            // Also add the mapping of location id to location object
            this.locations.set(compLocId, result);
        }

        return result;
    }

    public static for(id: LocationID): ControlLocation {
        let result: ControlLocation = this.locations.get(id);
        if (!result) {
            result = new ControlLocation(id);
            this.locations.set(id, result);
        }
        return result;
    }

    public static fresh(): ControlLocation {
        return this.for(this.newLocationID());
    }

}