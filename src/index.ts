import * as Contact from './Contact';
import * as Outcome from './Outcome';

import * as Elevated from 'typescript-elevated-objects';

export const factory = new Elevated.Factory([
    ... Contact.builders,
    ... Outcome.builders,
]);

export * as Contact from './Contact';
export * as Outcome from './Outcome';
