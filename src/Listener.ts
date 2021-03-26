import * as Elevated from 'typescript-elevated-objects';
import { Action } from './Action';
import { Resource } from './Resource';

export class Listener<ResourceT extends Resource> {
    when: (action: Action<ResourceT>) => boolean;
    then: (action: Action<ResourceT>) => void;
    constructor(
        when: (action: Action<ResourceT>) => boolean, 
        then: (action: Action<ResourceT>) => void
    ) {
        this.when = when;
        this.then = then;
    }
}
