import { Model } from '../../model/model.service';
import { RealmModel } from '../../realm/realm-model';

export class FiresideRealmModel extends Model {
	declare fireside_id: number;
	declare realm: RealmModel;
	declare added_on: number;

	constructor(data: Partial<FiresideRealmModel> = {}) {
		super(data);

		if (data.realm) {
			this.realm = new RealmModel(data.realm);
		}
	}
}
