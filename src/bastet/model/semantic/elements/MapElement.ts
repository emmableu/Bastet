import {AbstractElement} from "./AbstractElement";
import {Map, Record} from "immutable";

export interface MapElementAttributes {
    readonly elements: Map<string, AbstractElement>;
}

export const bottomElementAttributes: MapElementAttributes = {
    elements: Map()
}

export class MapElement extends Record(bottomElementAttributes) implements MapElementAttributes, AbstractElement {

    get elements() {
        return this.get('elements');
    }

}
