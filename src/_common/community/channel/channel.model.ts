import { Api } from '../../api/api.service';
import { MediaItem } from '../../media-item/media-item-model';
import { Model, defineLegacyModel } from '../../model/model.service';
import { CommunityCompetition } from '../competition/competition.model';
import {
	COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING,
	CommunityChannelPermissions,
} from './channel-permissions';

export type CommunityChannelType = 'post-feed' | 'competition';
export type CommunityChannelVisibility = 'draft' | 'published';

export class CommunityChannel extends defineLegacyModel(
	class CommunityChannelDefinition extends Model {
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
		declare background?: MediaItem;
		declare competition: CommunityCompetition | null;

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
				this.background = new MediaItem(data.background);
			}
			if (data.competition) {
				this.competition = new CommunityCompetition(data.competition);
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

			return this.$_save(
				'/web/dash/communities/channels/save/' + this.community_id,
				'channel'
			);
		}

		$saveBackground() {
			return this.$_save(
				'/web/dash/communities/channels/save-background/' +
					this.community_id +
					'/' +
					this.id,
				'channel',
				{ file: this.file, allowComplexData: ['crop'] }
			);
		}

		$saveDescription() {
			return this.$_save(
				'/web/dash/communities/description/save-channel/' + this.id,
				'channel'
			);
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
) {}

export function $saveCommunityChannelSort(communityId: number, channelIds: number[]) {
	return Api.sendRequest('/web/dash/communities/channels/save-sort/' + communityId, channelIds);
}

export function $saveCommunityChannelSortArchived(communityId: number, channelIds: number[]) {
	return Api.sendRequest(
		'/web/dash/communities/channels/save-sort-archived/' + communityId,
		channelIds
	);
}
