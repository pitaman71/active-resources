import fs from 'fs';

import { Task } from 'typescript-task-tuning';
import * as Elevated from 'typescript-elevated-objects';
import { Action } from './Action';
import * as UserIdentity from './UserIdentity';
import { Local } from './Local';
import { Resource } from './Resource';

const logTags = {
    State: false
};

export abstract class State<ResourceT extends Resource> extends Elevated.Serializable {
    actions: Action<ResourceT>[] = [];
    readyPromise: Promise<any> = Promise.resolve();
    static blobSeparator: string = '___%%%JSON_BLOB%%%___';

    getPath(resource: ResourceT):string {
        return `${resource.getClassSpec()}.jsblobs`;
    }

    lookupMemo<ActionT extends Action<ResourceT>>(
        other: ActionT
    ): ActionT|undefined {
        return new Task.Task(`Resource.State.lookupMemo scans ${this.actions.length} actions for a memo`)
        .logs(console.log, () => logTags['State'])
        .withTags('State')
        .returns(other, () => {
            const matches = this.actions.filter((item: Action<ResourceT>) => 
                item.isMemoFor(other));
            return matches.length > 0 ? <ActionT>matches[matches.length - 1] : undefined;            
        });
    }

    redo<ActionT extends Action<ResourceT>>(
        factory: Elevated.Factory, resource: ResourceT) {
            const path = this.getPath(resource)
            if(!fs.existsSync(path)) {
                console.log(`${path}: file does not exist, resetting state`);
            } else {
                this.readyPromise = fs.promises.readFile(path)
                .then((raw:Buffer) => {
                    const blobs = raw.toString().split(State.blobSeparator);
                    const newActions = blobs
                        .filter((blob:string) => blob !== '')
                        .map((blob:string) => factory.fromString(blob));
                    if(!this.actions) {
                        throw new Error(`State.actions is undefined`);
                    }
                    const actions: Action<ResourceT>[] = this.actions;         
                    newActions.forEach((action: Action<ResourceT>) => 
                        new Task.Task(`LOAD ACTION ${resource.getClassSpec()}.${action.getClassSpec()}.${action.nonce}`)
                        .logs(console.log, () => logTags['State'])
                        .withTags('State')
                        .promises(action, () => action.execute(resource, this)
                        .then((action: Action<ResourceT>) => actions.push(action)))
                    );
                    console.log(`${path}: Replayed ${actions.length} stored blobs`);
                }).catch((err: any) => {
                    console.error(err);
                });
            }
    }

    done<ActionT extends Action<ResourceT>>(
        action: ActionT, 
        resource: ResourceT,
        factory: Elevated.Factory) {
        const message = factory.toString(action);
        this.actions = [ ... this.actions, action];
        return new Task.Task(`SAVE ACTION ${resource.getClassSpec()}.${action.getClassSpec()}.${action.nonce}`)
        .logs(console.log, () => logTags['State'])
        .withTags('State')
        .promises(action, () => fs.promises.appendFile(this.getPath(resource), State.blobSeparator+message));
    }

    tick(
        authorization: any,
        who: UserIdentity.Handle,
        client: Local<ResourceT, this>
    ): void { }

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.scalar<ResourceT>(this, 'resource');
        visitor.array<Action<ResourceT>>(this, 'actions');
        visitor.endObject(this);
    }
}
