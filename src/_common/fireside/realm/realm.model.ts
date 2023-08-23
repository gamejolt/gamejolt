import { Model } from '../../model/model.service';
import { Realm } from '../../realm/realm-model';

export class FiresideRealm extends Model {
	declare fireside_id: number;
	declare realm: Realm;
	declare added_on: number;

	constructor(data: Partial<FiresideRealm> = {}) {
		super(data);

		if (data.realm) {
			this.realm = new Realm(data.realm);
		}
	}
}
