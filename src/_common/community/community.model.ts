import { RouteLocationNormalized } from 'vue-router';
import { RouteLocationDefinition } from '../../utils/router';
import { assertNever } from '../../utils/utils';
import { CommunityJoinLocation, trackCommunityJoin } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { Collaboratable, Perm } from '../collaborator/collaboratable';
import { Game } from '../game/game.model';
import { MediaItem } from '../media-item/media-item-model';
import { Model, defineLegacyModel } from '../model/model.service';
import { Theme } from '../theme/theme.model';
import { UserBlock } from '../user/block/block.model';
import { CommunityChannel } from './channel/channel.model';
import noThumbImage from './no-thumb.png';

export class Community extends defineLegacyModel(
	class CommunityDefinition extends Collaboratable(Model) {
		declare name: string;
		declare path: string;
		declare added_on: number;
		declare post_placeholder_text: string | null;
		declare description_content: string;
		declare is_verified: boolean;
		declare has_archived_channels: boolean | null;
		declare thumbnail?: MediaItem;
		declare header?: MediaItem;
		declare theme?: Theme;
		declare games?: Game[];
		declare channels?: CommunityChannel[];
		declare featured_background?: MediaItem;
		declare all_background?: MediaItem;
		declare user_block?: UserBlock;
		declare member_count: number;
		declare is_member?: boolean;
		declare perms?: Perm[];

		constructor(data: any = {}) {
			super(data);

			if (data.header) {
				this.header = new MediaItem(data.header);
			}

			if (data.thumbnail) {
				this.thumbnail = new MediaItem(data.thumbnail);
			}

			if (data.theme) {
				this.theme = new Theme(data.theme);
			}

			if (data.games) {
				this.games = Game.populate(data.games);
			}

			if (data.channels) {
				this.channels = CommunityChannel.populate(data.channels);
			}

			if (data.featured_background) {
				this.featured_background = new MediaItem(data.featured_background);
			}

			if (data.all_background) {
				this.all_background = new MediaItem(data.all_background);
			}

			if (data.user_block) {
				this.user_block = new UserBlock(data.user_block);
			}
		}

		get img_thumbnail() {
			if (this.thumbnail instanceof MediaItem) {
				return this.thumbnail.mediaserver_url;
			}
			return noThumbImage;
		}

		get routeLocation(): RouteLocationDefinition {
			return {
				name: 'communities.view.overview',
				params: {
					path: this.path,
				},
			};
		}

		get routeEditLocation(): RouteLocationDefinition {
			return {
				name: 'communities.view.edit.details',
				params: {
					path: this.path,
					id: this.id + '',
				},
			};
		}

		get isBlocked() {
			return this.user_block instanceof UserBlock;
		}

		get postableChannels() {
			if (!this.channels) {
				return [];
			}

			return this.channels?.filter(channel => channel.canPost);
		}

		/** Whether or not a generally removable channel can be removed from the community at this moment. */
		get canRemoveChannel() {
			if (!this.channels) {
				return false;
			}

			// Only publicly visible channels count.
			return this.channels.filter(i => i.visibility === 'published').length > 1;
		}

		channelRouteLocation(channel: CommunityChannel): RouteLocationDefinition {
			return {
				name: 'communities.view.channel',
				params: {
					path: this.path,
					channel: channel.title,
				},
			};
		}

		$save() {
			if (this.id) {
				return this.$_save('/web/dash/communities/save/' + this.id, 'community', {
					allowComplexData: ['theme'],
				});
			} else {
				return this.$_save('/web/dash/communities/save', 'community', {
					allowComplexData: ['theme'],
				});
			}
		}

		$saveHeader() {
			return this.$_save('/web/dash/communities/design/save-header/' + this.id, 'community', {
				file: this.file,
				allowComplexData: ['crop'],
			});
		}

		async $clearHeader() {
			return this.$_save('/web/dash/communities/design/clear-header/' + this.id, 'community');
		}

		$saveThumbnail() {
			return this.$_save(
				'/web/dash/communities/design/save-thumbnail/' + this.id,
				'community',
				{
					file: this.file,
					allowComplexData: ['crop'],
				}
			);
		}

		$saveDescription() {
			return this.$_save('/web/dash/communities/description/save/' + this.id, 'community');
		}

		$remove() {
			return this.$_remove('/web/dash/communities/remove/' + this.id);
		}

		$savePresetChannelBackground(presetType: CommunityPresetChannelType) {
			return this.$_save(
				`/web/dash/communities/channels/save-preset-background/${this.id}/${presetType}`,
				'community',
				{
					file: this.file,
					allowComplexData: ['crop'],
				}
			);
		}

		$clearPresetChannelBackground(presetType: CommunityPresetChannelType) {
			return this.$_save(
				`/web/dash/communities/channels/clear-preset-background/${this.id}/${presetType}`,
				'community'
			);
		}

		async saveGameSort() {
			const response = await Api.sendRequest(
				`/web/dash/communities/games/save-sort/${this.id}`,
				this.games!.map(i => i.id),
				{
					noErrorRedirect: true,
				}
			);
			if (response.success) {
				this.assign(response.community);
			}
			return response;
		}
	}
) {}

export async function joinCommunity(community: Community, location?: CommunityJoinLocation) {
	community.is_member = true;
	++community.member_count;

	let failed = false;
	try {
		const response = await Api.sendRequest(
			'/web/communities/join/' + community.path,
			{},
			// Normally we would call the request with detach,
			// but in this specific case we want to process the updates
			// to the user to see if they just went over the join limit
			{ ignoreLoadingBar: true, noErrorRedirect: true }
		);

		failed = !response.success;

		if (failed) {
			if (response) {
				throw response;
			}
			throw new Error('Empty response');
		}
	} finally {
		if (failed) {
			community.is_member = false;
			--community.member_count;
		}

		if (location) {
			trackCommunityJoin(true, { failed, location });
		}
	}
}

export async function leaveCommunity(community: Community, location?: CommunityJoinLocation) {
	community.is_member = false;
	--community.member_count;

	let failed = false;
	try {
		await Api.sendRequest(
			'/web/communities/leave/' + community.path,
			{},
			// We use these options for the request for the same reason
			// commented in the $joinCommunity function, only to update
			// when the user goes under the join limit.
			{ ignoreLoadingBar: true, noErrorRedirect: true }
		);
	} catch (e) {
		failed = true;
		community.is_member = false;
		++community.member_count;
		throw e;
	} finally {
		if (location) {
			trackCommunityJoin(false, { failed, location });
		}
	}
}

export const enum CommunityPresetChannelType {
	FEATURED = 'featured',
	ALL = 'all',
}

export function isEditingCommunity(route: RouteLocationNormalized) {
	return typeof route.name === 'string' && route.name.startsWith('communities.view.edit.');
}

export function getCommunityChannelBackground(
	community: Community,
	presetType: CommunityPresetChannelType
) {
	switch (presetType) {
		case CommunityPresetChannelType.FEATURED:
			return community.featured_background;
		case CommunityPresetChannelType.ALL:
			return community.all_background;
		default:
			assertNever(presetType);
	}
}

/**
 * @deprecated we always auto-feature now
 */
export function canCommunityFeatureFireside(_community: Community) {
	return false;
}

export function canCommunityEjectFireside(community: Community) {
	return !!community.hasPerms('community-firesides');
}

export function canCommunityCreateFiresides(community: Community) {
	return community.hasPerms('community-firesides');
}
