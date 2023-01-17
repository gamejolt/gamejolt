import { Model } from '../../model/model.service';
import { Realm } from '../../realm/realm-model';

export class FiresideRealm extends Model {
	fireside_id!: number;
	realm!: Realm;

	added_on!: number;
	featured_on!: number | null;

	constructor(data: Partial<FiresideRealm> = {}) {
		super(data);

		this.featured_on = data.featured_on ?? null;
		if (data.realm) {
			this.realm = new Realm(data.realm);
		}
	}

	get isFeatured() {
		return !!this.featured_on;
	}
}

Model.create(FiresideRealm);
