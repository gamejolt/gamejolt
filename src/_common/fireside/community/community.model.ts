import { CommunityModel } from '../../community/community.model';
import { Model } from '../../model/model.service';

export class FiresideCommunityModel extends Model {
	declare fireside_id: number;
	declare community: CommunityModel;
	declare added_on: number;
	declare featured_on: number | null;

	constructor(data: any = {}) {
		super(data);

		this.featured_on = data.featured_on ?? null;
		if (data.community) {
			this.community = new CommunityModel(data.community);
		}
	}

	get isFeatured() {
		return !!this.featured_on;
	}
}
