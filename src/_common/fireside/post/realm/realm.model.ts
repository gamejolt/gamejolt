import { Model } from '~common/model/model.service';
import { RealmModel } from '~common/realm/realm-model';

export class FiresidePostRealmModel extends Model {
	declare fireside_post_id: number;
	declare realm: RealmModel;
	declare added_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.realm) {
			this.realm = new RealmModel(data.realm);
		}
	}
}
