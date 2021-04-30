import type { Location, Route } from 'vue-router';
import { Api } from '../api/api.service';
import { Collaboratable, Perm } from '../collaborator/collaboratable';
import { Game } from '../game/game.model';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { Theme } from '../theme/theme.model';
import { UserBlock } from '../user/block/block.model';
import { CommunityChannel } from './channel/channel.model';

export class Community extends Collaboratable(Model) {
	name!: string;
	path!: string;
	added_on!: number;
	post_placeholder_text!: string | null;
	description_content!: string;
	is_verified!: boolean;
	has_archived_channels!: boolean | null;

	thumbnail?: MediaItem;
	header?: MediaItem;
	theme!: Theme | null;
	games!: Game[] | null;
	channels?: CommunityChannel[] | null;
	featured_background?: MediaItem;
	all_background?: MediaItem;
	user_block?: UserBlock | null;

	member_count!: number;
	is_member?: boolean;

	perms?: Perm[];

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
		return require('./no-thumb.png');
	}

	get routeLocation(): Location {
		return {
			name: 'communities.view.overview',
			params: {
				path: this.path,
			},
		};
	}

	get routeEditLocation(): Location {
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

	channelRouteLocation(channel: CommunityChannel): Location {
		return {
			name: 'communities.view.channel',
			params: {
				path: this.path,
				channel: channel.title,
			}
		} as Location
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
		return this.$_save('/web/dash/communities/design/save-thumbnail/' + this.id, 'community', {
			file: this.file,
			allowComplexData: ['crop'],
		});
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

Model.create(Community);

export async function $joinCommunity(community: Community) {
	community.is_member = true;
	++community.member_count;

	let success = false;
	try {
		const response = await Api.sendRequest(
			'/web/communities/join/' + community.path,
			{},
			// Normally we would call the request with detach,
			// but in this specific case we want to process the updates
			// to the user to see if they just went over the join limit
			{ ignoreLoadingBar: true, noErrorRedirect: true }
		);

		success = !!response.success;

		if (!success) {
			if (response) {
				throw response;
			}
			throw new Error('Empty response');
		}
	} finally {
		if (!success) {
			community.is_member = false;
			--community.member_count;
		}
	}
}

export async function $leaveCommunity(community: Community) {
	community.is_member = false;
	--community.member_count;

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
		community.is_member = false;
		++community.member_count;
		throw e;
	}
}

export const enum CommunityPresetChannelType {
	FEATURED = 'featured',
	ALL = 'all',
}

export function isEditingCommunity(route: Route) {
	return !!route.name && route.name.startsWith('communities.view.edit.');
}
