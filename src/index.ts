import * as Actor from './Actor';
import * as Outcome from './Outcome';

import * as Elevated from 'typescript-elevated-objects';

export const factory = new Elevated.Factory([
    ... Actor.builders,
    ... Outcome.builders,
]);

export * from './Action';
export * from './Effect';
export * from './Listener';
export * from './Local';
export * from './Remote';
export * from './Resource';
export * from './State';
export * from './Actor';

export * as Contact from './Contact';
export * as Outcome from './Outcome';
