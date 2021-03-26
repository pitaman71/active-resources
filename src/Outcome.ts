import * as Elevated from 'typescript-elevated-objects';

export abstract class Outcome extends Elevated.Serializable {
    hasStarted: boolean = false;
    hasSucceeded: boolean = false;
    hasFailed: boolean = false;
    unitsExpected?: number;
    unitsCompleted?: number;

    abstract asHTTPCode():number;

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.primitive<boolean>(this, 'hasStarted');
        visitor.primitive<boolean>(this, 'hasSucceeded');
        visitor.primitive<number>(this, 'unitsExpected');
        visitor.primitive<boolean>(this, 'hasFailed');
        visitor.primitive<number>(this, 'unitsCompleted');
        visitor.endObject(this);
    }
}

export class Success extends Outcome {
    getClassSpec(): string { return 'Outcome.Success'};
    asHTTPCode():number { return 200; }
    constructor(initializer?: any) { 
        super(); 
        this.hasStarted = true;
        this.hasSucceeded = true;
        this.hasFailed = false;
        this.overlay(... initializer ? [ initializer ] : []); 
    }        
}

export abstract class Failure extends Outcome {
    message?: string;
    details?: any;
    constructor(initializer?: any) { 
        super(); 
        this.hasStarted = true;
        this.hasSucceeded = false;
        this.hasFailed = true;
        this.overlay(... initializer ? [ initializer ] : []); 
    }

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.primitive<string>(this, 'message');
        visitor.primitive<any>(this, 'details');
        visitor.endObject(this);
    }
}

export class AuthenticationRequired extends Failure {
    getClassSpec(): string { return 'Outcome.AuthenticationRequired'};
    asHTTPCode():number { return 401; }
}

export class AuthorizationRequired extends Failure {
    getClassSpec(): string { return 'Outcome.AuthorizationRequired'};
    asHTTPCode():number { return 403; }
}

export class ServiceUnreachable extends Failure {
    getClassSpec(): string { return 'Outcome.ServiceUnreachable'};
    asHTTPCode():number { return 503; }
}

export class ServiceBusy extends Failure {
    getClassSpec(): string { return 'Outcome.ServiceBusy'};
    asHTTPCode():number { return 429; }
}

export class ServiceCapacity extends Failure {
    getClassSpec(): string { return 'Outcome.ServiceCapacity'};
    asHTTPCode():number { return 429; }
}

export class ServiceNonspecificError extends Failure {
    error: any;
    getClassSpec(): string { return 'Outcome.ServiceNonspecificError'};
    asHTTPCode():number { return 500; }

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        super.marshal(visitor);
        visitor.primitive<any>(this, 'error');
        visitor.endObject(this);
    }
}

export class MissingData extends Failure {
    getClassSpec(): string { return 'Outcome.MissingData'};
    asHTTPCode():number { return 400; }
}

export class ConflictingData extends Failure {
    getClassSpec(): string { return 'Outcome.ConflictingData'};
    asHTTPCode():number { return 400; }
}

export class Race extends Failure {
    getClassSpec(): string { return 'Outcome.Race'};
    asHTTPCode():number { return 408; }
}

export const builders = [
    () => new Elevated.Builder("Outcome.Success", (initializer?: any) => new Success(initializer)),
    () => new Elevated.Builder("Outcome.AuthenticationRequired", (initializer?: any) => new AuthenticationRequired(initializer)),
    () => new Elevated.Builder("Outcome.AuthorizationRequired", (initializer?: any) => new AuthorizationRequired(initializer)),
    () => new Elevated.Builder("Outcome.ServiceUnreachable", (initializer?: any) => new ServiceUnreachable(initializer)),
    () => new Elevated.Builder("Outcome.ServiceBusy", (initializer?: any) => new ServiceBusy(initializer)),
    () => new Elevated.Builder("Outcome.ServiceCapacity", (initializer?: any) => new ServiceCapacity(initializer)),
    () => new Elevated.Builder("Outcome.ServiceNonspecificError", (initializer?: any) => new ServiceNonspecificError(initializer)),
    () => new Elevated.Builder("Outcome.MissingData", (initializer?: any) => new MissingData(initializer)),
    () => new Elevated.Builder("Outcome.ConflictingData", (initializer?: any) => new ConflictingData(initializer)),
    () => new Elevated.Builder("Outcome.Race", (initializer?: any) => new Race(initializer))
];
