import { Model } from '../../../model/model.service';
import { Realm } from '../../../realm/realm-model';
import { FiresidePost } from '../post-model';

export class FiresidePostRealm extends Model {
	// TODO(realm-posting) double-check
	fireside_post!: FiresidePost;
	realm!: Realm;
	added_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.fireside_post) {
			this.fireside_post = new FiresidePost(data.fireside_post);
		}

		if (data.realm) {
			this.realm = new Realm(data.realm);
		}
	}
}

Model.create(FiresidePostRealm);
