import { Api } from '../../api/api.service';
import { Model } from '../../model/model.service';

export class CommunityChannel extends Model {
	community_id!: number;
	title!: string;
	added_on!: number;
	sort!: number;

	static $saveSort(communityId: number, channelIds: number[]) {
		return Api.sendRequest(
			'/web/dash/communities/channels/save-sort/' + communityId,
			channelIds
		);
	}

	$save() {
		if (this.id) {
			throw new Error('Updating an existing channel is not supported');
		}

		return this.$_save('/web/dash/communities/channels/save/' + this.community_id, 'channel');
	}

	$remove() {
		if (!this.id) {
			return;
		}

		return this.$_remove(
			'/web/dash/communities/channels/remove/' + this.community_id + '/' + this.id,
			{
				detach: true,
			}
		);
	}
}

Model.create(CommunityChannel);
