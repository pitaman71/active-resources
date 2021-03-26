import * as Elevated from 'typescript-elevated-objects';
import { Task } from 'typescript-task-tuning';
import { Action } from './Action';
import * as Actor from './Actor';
import { Effect } from './Effect';
import { Listener } from './Listener';
import { Resource } from './Resource';
import { State } from './State';

const logTags = {
    Local: false,
}

export abstract class Local<ResourceT extends Resource, StateT extends State<ResourceT>> {
    factory: Elevated.Factory;
    resource: ResourceT;
    state: StateT;
    actor: Actor.Handle;
    interval: any;
    beforeListeners: Listener<ResourceT>[] = [];
    afterListeners: Listener<ResourceT>[] = [];

    constructor(
        factory: Elevated.Factory,
        resource: ResourceT,
        state: StateT,
        actor: Actor.Handle
    ) {
        this.factory = factory;
        this.resource = resource;
        this.state = state;
        this.actor = actor;
        this.interval = setInterval(() => this.state.tick(null, this.actor, this), 1000);
    }

    getEndpoints(): string[] {
        return this.resource.getActionSlugs().map((className:string) => 
            [ 
                ... this.resource.getSlug().split('.'), 
                ... className.split('.')
            ].join('/'));
    }

    listenBefore(listener: Listener<ResourceT>) {
        this.beforeListeners = [ ... this.beforeListeners, listener];
    }

    listenAfter(listener: Listener<ResourceT>) {
        this.afterListeners = [ ... this.afterListeners, listener];
    }
    
    load() {
        this.state.redo(this.factory, this.resource);
    }

    save(
        action: Action<ResourceT>
    ) {
        this.state && 
        (action.effect === Effect.Delta || action.effect === Effect.Summa) &&
        this.state.done(action, this.resource, this.factory);
    }

    start() {
        this.state.redo(this.factory, this.resource);
    }

    execute<ActionT extends Action<ResourceT>>(
        authorization: any,
        who: Actor.Handle,
        action: ActionT
    ): Promise<ActionT> {
        this.beforeListeners
        .filter((listener:Listener<ResourceT>) => listener.when(action))
        .forEach((listener:Listener<ResourceT>) => listener.then(action));

        const cloned = action.clone(action, { who });
        return new Task.Task(`${this.resource.getClassSpec()}.execute<${cloned.getClassSpec()}>`)
        .logs(console.log, () => logTags['Local'])
        .withTags('Local', ... this.resource.getClassSpec().split('.'))
        .promises(cloned, () => cloned.execute(this.resource, this.state))
        .then((action: ActionT) => {
            this.save(action);
            return action;
        }).then((post:ActionT) => {
            this.afterListeners
            .filter((listener:Listener<ResourceT>) => listener.when(post))
            .forEach((listener:Listener<ResourceT>) => listener.then(post));    
            return post;
        });
    }
}
