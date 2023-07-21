import { CommunityChannel } from '../../../community/channel/channel.model';
import { Community } from '../../../community/community.model';
import { Model, defineLegacyModel } from '../../../model/model.service';
import { FiresidePost } from '../post-model';

export class FiresidePostCommunity extends defineLegacyModel(
	class FiresidePostCommunityDefinition extends Model {
		declare fireside_post_id: number;
		declare fireside_post?: FiresidePost;
		declare community: Community;
		declare channel?: CommunityChannel;
		declare added_on: number;
		declare featured_on: number;

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
) {}
