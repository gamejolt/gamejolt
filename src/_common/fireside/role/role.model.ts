import { Model } from '../../model/model.service';

export type FIRESIDE_ROLES = 'host' | 'cohost' | 'guest' | 'audience';

export class FiresideRole extends Model {
	role!: FIRESIDE_ROLES;
}

Model.create(FiresideRole);
