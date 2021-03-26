import * as Elevated from 'typescript-elevated-objects';

export class Handle extends Elevated.Serializable {
    displayName?: string;
    systemId?: Object;

    getClassSpec() { return "Actor.Handle"; }

    constructor(initializer?: any) { super(); this.overlay(... initializer ? [ initializer ] : []); }

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.primitive<Object>(this, 'systemId');
        visitor.primitive<string>(this, 'displayName');
        visitor.endObject(this);
    }

    sameAs(other?: Handle) {
        return !!other && other.systemId === this.systemId;
    }

    getDisplayName(): string|undefined { return this.displayName }
    getSystemId(): any { return this.systemId; }
}

export const builders = [
    () => new Elevated.Builder("Actor.Handle", (initializer?: any) => new Handle(initializer))
];
