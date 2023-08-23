import { Model } from '../../../model/model.service';
import { Realm } from '../../../realm/realm-model';

export class FiresidePostRealm extends Model {
	declare fireside_post_id: number;
	declare realm: Realm;
	declare added_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.realm) {
			this.realm = new Realm(data.realm);
		}
	}
}
