import { Api } from '../../api/api.service';
import { MediaItemModel } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { CommunityCompetitionModel } from '../competition/competition.model';
import {
	COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING,
	CommunityChannelPermissions,
} from './channel-permissions';

export type CommunityChannelType = 'post-feed' | 'competition';
export type CommunityChannelVisibility = 'draft' | 'published';

export class CommunityChannelModel extends Model {
	declare community_id: number;
	declare title: string;
	declare added_on: number;
	declare sort: number;
	declare type: CommunityChannelType;
	declare visibility: CommunityChannelVisibility;
	declare display_title: string | null;
	declare description_content: string | null;
	declare is_archived: boolean;
	declare permissions: CommunityChannelPermissions;
	declare background?: MediaItemModel;
	declare competition: CommunityCompetitionModel | null;

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
			this.type != 'competition' &&
			this.permissions.canPerform(COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING) &&
			this.visibility !== 'draft' &&
			!this.is_archived
		);
	}

	constructor(data: any = {}) {
		super(data);

		if (data.background) {
			this.background = new MediaItemModel(data.background);
		}
		if (data.competition) {
			this.competition = new CommunityCompetitionModel(data.competition);
		}

		this.permissions = new CommunityChannelPermissions(data.perms);
	}

	$save() {
		if (this.id) {
			return this.$_save(
				'/web/dash/communities/channels/save/' + this.community_id + '/' + this.id,
				'channel'
			);
		}

		return this.$_save('/web/dash/communities/channels/save/' + this.community_id, 'channel');
	}

	$saveBackground() {
		return this.$_save(
			'/web/dash/communities/channels/save-background/' + this.community_id + '/' + this.id,
			'channel',
			{ file: this.file, allowComplexData: ['crop'] }
		);
	}

	$saveDescription() {
		return this.$_save('/web/dash/communities/description/save-channel/' + this.id, 'channel');
	}
}

export function $publishCommunityChannel(model: CommunityChannelModel) {
	return model.$_save(
		`/web/dash/communities/channels/publish/` + model.community_id + '/' + model.id,
		'channel'
	);
}

export function $clearCommunityChannelBackground(model: CommunityChannelModel) {
	return model.$_save(
		`/web/dash/communities/channels/clear-background/${model.community_id}/${model.id}`,
		'channel'
	);
}

export function $removeCommunityChannel(
	model: CommunityChannelModel,
	moveToChannel?: CommunityChannelModel
) {
	if (!model.id) {
		return;
	}

	return model.$_remove(
		'/web/dash/communities/channels/remove/' + model.community_id + '/' + model.id,
		{
			detach: true,
			data: moveToChannel ? { move_to_channel: moveToChannel.id } : {},
		}
	);
}

export function $archiveCommunityChannel(model: CommunityChannelModel) {
	return model.$_save(
		`/web/dash/communities/channels/archive/` + model.community_id + '/' + model.id,
		'channel'
	);
}

export function $unarchiveCommunityChannel(model: CommunityChannelModel) {
	return model.$_save(
		`/web/dash/communities/channels/unarchive/` + model.community_id + '/' + model.id,
		'channel'
	);
}

export function $saveCommunityChannelSort(communityId: number, channelIds: number[]) {
	return Api.sendRequest('/web/dash/communities/channels/save-sort/' + communityId, channelIds);
}

export function $saveCommunityChannelSortArchived(communityId: number, channelIds: number[]) {
	return Api.sendRequest(
		'/web/dash/communities/channels/save-sort-archived/' + communityId,
		channelIds
	);
}
