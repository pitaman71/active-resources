import * as Elevated from 'typescript-elevated-objects';

export class Handle extends Elevated.Serializable {
    oktaUserId?: string;
    testUserId?: string;
    displayName?: string;

    getClassSpec() { return "Contact.Handle"; }
    constructor(initializer?: any) { super(); this.overlay(... initializer ? [ initializer ] : []); }
    getDisplayName(): string|undefined { return this.displayName; }
    getId(): any { return this.oktaUserId || this.testUserId; }

    toHandle(): Handle {
        return this;
    }

    allocate() {
        // must be allocated by Okta
    }

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.primitive<string>(this, 'oktaUserId');
        visitor.primitive<string>(this, 'testUserId');
        visitor.primitive<string>(this, 'displayName');
        visitor.endObject(this);
    }

    needsFields(): string[] {
        return [
            ... !this.displayName ? ['displayName'] : []
        ];
    }
}

export class Profile extends Handle {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    privilege?: string[];

    getClassSpec() { return "Contact.Profile"; }
    constructor(initializer?: any) { super(); this.overlay(... initializer ? [ initializer ] : []); }

    toHandle(): Handle {
        return new Handle(this);
    }

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        super.marshal(visitor);
        visitor.primitive<string>(this, 'firstName');
        visitor.primitive<string>(this, 'lastName');
        visitor.primitive<string>(this, 'email');
        visitor.primitive<string>(this, 'phone');
        visitor.primitive<string[]>(this, 'privilege');
        visitor.endObject(this);
    }

    needsFields(): string[] {
        return [
            ... super.needsFields(),
            ... !this.firstName ? ['firstName'] : [],
            ... !this.lastName ? ['lastName'] : [],
            ... !this.email ? ['email'] : [],
            ... !this.phone ? ['phone'] : []
        ];
    }
}

export const builders = [
    () => new Elevated.Builder("Contact.Handle", (initializer?: any) => new Handle(initializer)),
    () => new Elevated.Builder("Contact.Profile", (initializer?: any) => new Profile(initializer))
];
