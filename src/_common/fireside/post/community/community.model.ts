import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { CommunityModel } from '~common/community/community.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { Model } from '~common/model/model.service';

export class FiresidePostCommunityModel extends Model {
	declare fireside_post_id: number;
	declare fireside_post?: FiresidePostModel;
	declare community: CommunityModel;
	declare channel?: CommunityChannelModel;
	declare added_on: number;
	declare featured_on: number;

	constructor(data: any = {}) {
		super(data);

		if (data.fireside_post) {
			this.fireside_post = new FiresidePostModel(data.fireside_post);
		}

		if (data.community) {
			this.community = new CommunityModel(data.community);
		}

		if (data.channel) {
			this.channel = new CommunityChannelModel(data.channel);
		}
	}

	get isFeatured() {
		return this.featured_on;
	}
}
