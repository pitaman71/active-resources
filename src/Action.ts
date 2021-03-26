import { v4 as uuidv4 } from 'uuid';
import * as MomentJS from 'moment';
import moment from 'moment';

import * as Elevated from 'typescript-elevated-objects';
import * as Contact from './Contact';
import { Actor } from './Actor';
import { Effect } from './Effect';
import { Outcome } from './Outcome';
import { Resource } from './Resource';
import { State } from './State';

export abstract class Action<ResourceT extends Resource> extends Elevated.Serializable {
    nonce: string = uuidv4();
    when: MomentJS.Moment = moment();
    who?: Actor;
    target?: ResourceT;
    effect?: Effect = Effect.Ready;
    outcome?: Outcome;

    abstract getSlug(): string;

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.primitive<string>(this, 'nonce');
        visitor.primitive<MomentJS.Moment>(this, 'when', moment);
        visitor.scalar<Actor>(this, 'who');
        visitor.scalar<ResourceT>(this, 'target');
        visitor.primitive<Effect>(this, 'effect');
        visitor.scalar<Outcome>(this, 'outcome');
        visitor.endObject(this);
    }

    isMemoFor(other: Action<ResourceT>):boolean { 
        if(this.who?.getId() !== other.who?.getId()) {
            console.log(`${this.nonce} getId mismatch ${this.who?.getId()} != ${other.who?.getId()}`);
            return false;
        }
        return true;
    }

    restart() {
        this.nonce = uuidv4();
        this.outcome = undefined;
        return this;
    }

    abstract isAuthorized(token: any, user: any, contact: Contact.Profile): boolean;
    abstract execute(resource: ResourceT, state: State<ResourceT>): Promise<this>;

    reconcile(last?: Action<ResourceT>): Action<ResourceT> {
        return this;
    }
}
