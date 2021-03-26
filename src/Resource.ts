import fs from 'fs';
import * as MomentJS from 'moment';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import * as Elevated from 'typescript-elevated-objects';


export abstract class Resource extends Elevated.Serializable {
    abstract getActionSlugs(): string[];
    abstract getSlug(): string;

    marshal(visitor: Elevated.Visitor<this>) {
        visitor.beginObject(this);
        visitor.endObject(this);
    }
}
