import { Task } from 'typescript-task-tuning';
import * as Elevated from 'typescript-elevated-objects';
import { Action } from './Action';
import * as Actor from './Actor';
import { Resource } from './Resource';
import * as Outcome from './Outcome';

const logTags = {
    Remote: false
};

export abstract class Remote<ResourceT extends Resource> {
    baseUri: string;
    fetch: any;
    resource: ResourceT;
    factory: Elevated.Factory;

    constructor(
        baseUri: string, 
        fetch: any,
        resource: ResourceT,
        factory: Elevated.Factory
    ) {
        this.baseUri = baseUri;
        this.fetch = fetch;
        this.resource = resource;
        this.factory = factory;
    }

    geturi<ActionT extends Action<ResourceT>>(action: ActionT): string {
        const resourceSlug = this.resource.getSlug();
        const actionSlug = action.getSlug();
        return [ 
            ... this.baseUri.split('/'), 
            ... resourceSlug.split('.'),
            ... actionSlug.split('.') 
        ].join('/');
    }

    send<ActionT extends Action<ResourceT>>(
        authorization: any, 
        who: Actor.Handle|undefined,
        action: ActionT): Promise<ActionT> 
    {
        const restUri = this.geturi(action);
        return new Task.Task(`Remote<${action.getClassSpec()}>.send`)
        .logs(console.log, () => logTags['Remote'])
        .withTags('Remote', ... action.getClassSpec().split('.'))
        .format((obj:any) => this.factory.toJSON(obj))
        .promises(action, () => {
            const writer = new Elevated.JSONMarshal.Writer<ActionT>(
                action.clone(action, { who }).restart(), 
                this.factory
            );
            writer.write();
            const body = JSON.stringify(writer.json);
            return this.fetch(restUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    ... authorization && { 'Authorization': authorization }
                },
                body
            })
            .then((res:any) => res.json())
            .then((asJSON:any) => {
                const reader = new Elevated.JSONMarshal.Reader<ActionT>(asJSON, this.factory);
                reader.read();
                if(!reader.obj) {
                    return Promise.reject(`${this.resource.getClassSpec()}: Unable to parse JSON response body`);
                } else if(reader.obj instanceof Outcome.Outcome) {
                    return action.clone(action, { outcome: reader.obj });
                } else {
                    return reader.obj.reconcile(action);
                }
            }).catch((networkError: Error) => {
                action.outcome = new Outcome.ServiceUnreachable({ message: `Cannot reach service at ${restUri}`, details: networkError });
                return action;
            })
        });
    }
}
