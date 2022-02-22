import { Community } from '../community/community.model';
import { Model } from '../model/model.service';

export class RealmCommunity extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.community) {
			this.community = new Community(data.community);
		}
	}

	declare realm_id: number;
	declare community: Community;
	declare added_on: number;
}

Model.create(RealmCommunity);
