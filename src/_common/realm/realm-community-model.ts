import { CommunityModel } from '../community/community.model';
import { Model } from '../model/model.service';

export class RealmCommunityModel extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.community) {
			this.community = new CommunityModel(data.community);
		}
	}

	declare realm_id: number;
	declare community: CommunityModel;
	declare added_on: number;
}
