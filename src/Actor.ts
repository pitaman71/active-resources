import * as Elevated from 'typescript-elevated-objects';

export abstract class Actor extends Elevated.Serializable {
    abstract getDisplayName(): string|undefined;
    abstract getId(): any;
}
