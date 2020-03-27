import { Api } from '../../api/api.service';
import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { CommunityChannelPermissions } from './channel-permissions';

export class CommunityChannel extends Model {
	community_id!: number;
	title!: string;
	added_on!: number;
	sort!: number;
	background?: MediaItem;

	perms!: CommunityChannelPermissions;

	constructor(data: any = {}) {
		super(data);

		if (data.background) {
			this.background = new MediaItem(data.background);
		}

		this.perms = new CommunityChannelPermissions(data.perms);
	}

	static $saveSort(communityId: number, channelIds: number[]) {
		return Api.sendRequest(
			'/web/dash/communities/channels/save-sort/' + communityId,
			channelIds
		);
	}

	$save() {
		if (this.id) {
			return this.$_save(
				'/web/dash/communities/channels/save/' + this.community_id + '/' + this.id,
				'channel',
				{ file: this.file }
			);
		}

		return this.$_save('/web/dash/communities/channels/save/' + this.community_id, 'channel');
	}

	$clearBackground() {
		return this.$_save(
			`/web/dash/communities/channels/clear-background/${this.community_id}/${this.id}`,
			'channel'
		);
	}

	$remove(moveToChannel?: CommunityChannel) {
		if (!this.id) {
			return;
		}

		return this.$_remove(
			'/web/dash/communities/channels/remove/' + this.community_id + '/' + this.id,
			{
				detach: true,
				data: moveToChannel ? { move_to_channel: moveToChannel.id } : {},
			}
		);
	}
}

Model.create(CommunityChannel);
