import * as Contact from './Contact';
import * as Outcome from './Outcome';

import * as Elevated from 'typescript-elevated-objects';

export const factory = new Elevated.Factory([
    ... Contact.builders,
    ... Outcome.builders,
]);

export * from './Action';
export * from './Actor';
export * from './Effect';
export * from './Listener';
export * from './Local';
export * from './Remote';
export * from './Resource';
export * from './State';

export * as Contact from './Contact';
export * as Outcome from './Outcome';
