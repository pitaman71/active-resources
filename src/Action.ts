import { v4 as uuidv4 } from 'uuid';
import * as MomentJS from 'moment';
import moment from 'moment';

import * as Elevated from 'typescript-elevated-objects';
import * as UserIdentity from './UserIdentity';
import { Effect } from './Effect';
import { Outcome } from './Outcome';
import { Resource } from './Resource';
import { State } from './State';

export abstract class Action<ResourceT extends Resource> extends Elevated.Serializable {
    nonce: string = uuidv4();
    when: MomentJS.Moment = moment();
    who?: UserIdentity.Handle;
    target?: ResourceT;
    effect?: Effect = Effect.Ready;
    outcome?: Outcome;

    abstract getSlug(): string;

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.primitive<string>(this, 'nonce');
        visitor.primitive<MomentJS.Moment>(this, 'when', moment);
        visitor.scalar<UserIdentity.Handle>(this, 'who');
        visitor.scalar<ResourceT>(this, 'target');
        visitor.primitive<Effect>(this, 'effect');
        visitor.scalar<Outcome>(this, 'outcome');
        visitor.endObject(this);
    }

    isMemoFor(other: Action<ResourceT>):boolean { 
        if(this.who?.sameAs(other.who)) {
            console.log(`${this.nonce} getId mismatch ${this.who?.getSystemId()} != ${other.who?.getSystemId()}`);
            return false;
        }
        return true;
    }

    restart() {
        this.nonce = uuidv4();
        this.outcome = undefined;
        return this;
    }

    abstract isAuthorized(token: any, user: any, actor: UserIdentity.Handle): boolean;
    abstract execute(resource: ResourceT, state: State<ResourceT>): Promise<this>;

    reconcile(last?: Action<ResourceT>): Action<ResourceT> {
        return this;
    }
}
