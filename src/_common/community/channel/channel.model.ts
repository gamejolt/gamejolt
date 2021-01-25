import { Api } from '../../api/api.service';
import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { CommunityCompetition } from '../competition/competition.model';
import {
	CommunityChannelPermissions,
	COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING,
} from './channel-permissions';

export type CommunityChannelType = 'post-feed' | 'competition';

export type CommunityChannelVisibility = 'draft' | 'published';

export class CommunityChannel extends Model {
	community_id!: number;
	title!: string;
	added_on!: number;
	sort!: number;
	type!: CommunityChannelType;
	visibility!: CommunityChannelVisibility;
	display_title!: string | null;
	description_content!: string | null;
	is_archived!: boolean;

	permissions!: CommunityChannelPermissions;

	background?: MediaItem;
	competition!: CommunityCompetition | null;

	get hasDisplayTitle() {
		return !!this.display_title && this.display_title !== this.title;
	}

	get displayTitle() {
		return this.display_title || this.title;
	}

	get isUnpublished() {
		return this.visibility !== 'published';
	}

	get canPost() {
		return (
			this.permissions.canPerform(COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING) &&
			this.visibility !== 'draft' &&
			!this.is_archived
		);
	}

	constructor(data: any = {}) {
		super(data);

		if (data.background) {
			this.background = new MediaItem(data.background);
		}
		if (data.competition) {
			this.competition = new CommunityCompetition(data.competition);
		}

		this.permissions = new CommunityChannelPermissions(data.perms);
	}

	static $saveSort(communityId: number, channelIds: number[]) {
		return Api.sendRequest(
			'/web/dash/communities/channels/save-sort/' + communityId,
			channelIds
		);
	}

	static $saveSortArchived(communityId: number, channelIds: number[]) {
		return Api.sendRequest(
			'/web/dash/communities/channels/save-sort-archived/' + communityId,
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

	$saveDescription() {
		return this.$_save('/web/dash/communities/description/save-channel/' + this.id, 'channel');
	}

	$publish() {
		return this.$_save(
			`/web/dash/communities/channels/publish/` + this.community_id + '/' + this.id,
			'channel'
		);
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

	$archive() {
		return this.$_save(
			`/web/dash/communities/channels/archive/` + this.community_id + '/' + this.id,
			'channel'
		);
	}

	$unarchive() {
		return this.$_save(
			`/web/dash/communities/channels/unarchive/` + this.community_id + '/' + this.id,
			'channel'
		);
	}
}

Model.create(CommunityChannel);
