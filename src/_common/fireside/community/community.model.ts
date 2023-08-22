import { Community } from '../../community/community.model';
import { Model, defineLegacyModel } from '../../model/model.service';

export class FiresideCommunity extends defineLegacyModel(
	class FiresideCommunityDefinition extends Model {
		declare fireside_id: number;
		declare community: Community;
		declare added_on: number;
		declare featured_on: number | null;

		constructor(data: any = {}) {
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
) {}
