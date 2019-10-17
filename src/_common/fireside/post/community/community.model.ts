import { CommunityChannel } from '../../../community/channel/channel.model';
import { Community } from '../../../community/community.model';
import { Model } from '../../../model/model.service';
import { FiresidePost } from '../post-model';

export class FiresidePostCommunity extends Model {
	fireside_post_id!: number;
	fireside_post?: FiresidePost;
	community!: Community;
	channel?: CommunityChannel;
	added_on!: number;
	featured_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.fireside_post) {
			this.fireside_post = new FiresidePost(data.fireside_post);
		}

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
