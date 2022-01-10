import { Community } from '../../community/community.model';
import { Model } from '../../model/model.service';

export class FiresideCommunity extends Model {
	fireside_id!: number;
	community!: Community;

	added_on!: number;
	featured_on!: number | null;

	constructor(data: Partial<FiresideCommunity> = {}) {
		super(data);

		this.featured_on = data.featured_on ?? null;
		if (data.community) {
			this.community = new Community(data.community);
		}
	}

	get isFeatured() {
		return !!this.featured_on;
	}
}

Model.create(FiresideCommunity);
