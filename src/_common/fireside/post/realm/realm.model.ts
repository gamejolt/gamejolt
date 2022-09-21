import { Model } from '../../../model/model.service';
import { Realm } from '../../../realm/realm-model';

export class FiresidePostRealm extends Model {
	fireside_post_id!: number;
	realm!: Realm;
	added_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.realm) {
			this.realm = new Realm(data.realm);
		}
	}
}

Model.create(FiresidePostRealm);
