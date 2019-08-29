import { CommunityChannel } from '../../../community/channel/channel.model';
import { Community } from '../../../community/community.model';
import { Model } from '../../../model/model.service';

export class FiresidePostCommunity extends Model {
	fireside_post_id!: number;
	community!: Community;
	channel?: CommunityChannel;
	added_on!: number;
	featured_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.community) {
			this.community = new Community(data.community);
		}

		if (data.channel) {
			this.channel = new CommunityChannel(data.channel);
		}
	}

	get isFeatured() {
		return this.featured_on;
	}
}

Model.create(FiresidePostCommunity);
