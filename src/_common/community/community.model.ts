import { RouteLocationNormalized } from 'vue-router';
import { RouteLocationDefinition } from '../../utils/router';
import { assertNever } from '../../utils/utils';
import { CommunityJoinLocation, trackCommunityJoin } from '../analytics/analytics.service';
import { Api } from '../api/api.service';
import { Collaboratable, Perm } from '../collaborator/collaboratable';
import { GameModel } from '../game/game.model';
import { MediaItemModel } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { ThemeModel } from '../theme/theme.model';
import { UserBlockModel } from '../user/block/block.model';
import { CommunityChannelModel } from './channel/channel.model';
import noThumbImage from './no-thumb.png';

export class CommunityModel extends Collaboratable(Model) {
	declare name: string;
	declare path: string;
	declare added_on: number;
	declare post_placeholder_text: string | null;
	declare description_content: string;
	declare is_verified: boolean;
	declare has_archived_channels: boolean | null;
	declare thumbnail?: MediaItemModel;
	declare header?: MediaItemModel;
	declare theme?: ThemeModel;
	declare games?: GameModel[];
	declare channels?: CommunityChannelModel[];
	declare featured_background?: MediaItemModel;
	declare all_background?: MediaItemModel;
	declare user_block?: UserBlockModel;
	declare member_count: number;
	declare is_member?: boolean;
	declare perms?: Perm[];

	constructor(data: any = {}) {
		super(data);

		if (data.header) {
			this.header = new MediaItemModel(data.header);
		}

		if (data.thumbnail) {
			this.thumbnail = new MediaItemModel(data.thumbnail);
		}

		if (data.theme) {
			this.theme = new ThemeModel(data.theme);
		}

		if (data.games) {
			this.games = GameModel.populate(data.games);
		}

		if (data.channels) {
			this.channels = CommunityChannelModel.populate(data.channels);
		}

		if (data.featured_background) {
			this.featured_background = new MediaItemModel(data.featured_background);
		}

		if (data.all_background) {
			this.all_background = new MediaItemModel(data.all_background);
		}

		if (data.user_block) {
			this.user_block = new UserBlockModel(data.user_block);
		}
	}

	get img_thumbnail() {
		if (this.thumbnail instanceof MediaItemModel) {
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
		return this.user_block instanceof UserBlockModel;
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

	channelRouteLocation(channel: CommunityChannelModel): RouteLocationDefinition {
		return {
			name: 'communities.view.channel',
			params: {
				path: this.path,
				channel: channel.title,
			},
		};
	}
}

export function $saveCommunity(model: CommunityModel) {
	if (model.id) {
		return model.$_save('/web/dash/communities/save/' + model.id, 'community', {
			allowComplexData: ['theme'],
		});
	} else {
		return model.$_save('/web/dash/communities/save', 'community', {
			allowComplexData: ['theme'],
		});
	}
}

export function $saveCommunityHeader(community: CommunityModel) {
	return community.$_save(
		'/web/dash/communities/design/save-header/' + community.id,
		'community',
		{
			file: community.file,
			allowComplexData: ['crop'],
		}
	);
}

export async function $clearCommunityHeader(community: CommunityModel) {
	return community.$_save(
		'/web/dash/communities/design/clear-header/' + community.id,
		'community'
	);
}

export function $saveCommunityThumbnail(community: CommunityModel) {
	return community.$_save(
		'/web/dash/communities/design/save-thumbnail/' + community.id,
		'community',
		{
			file: community.file,
			allowComplexData: ['crop'],
		}
	);
}

export function $saveCommunityDescription(community: CommunityModel) {
	return community.$_save('/web/dash/communities/description/save/' + community.id, 'community');
}

export function $removeCommunity(community: CommunityModel) {
	return community.$_remove('/web/dash/communities/remove/' + community.id);
}

export function $saveCommunityPresetChannelBackground(
	community: CommunityModel,
	presetType: CommunityPresetChannelType
) {
	return community.$_save(
		`/web/dash/communities/channels/save-preset-background/${community.id}/${presetType}`,
		'community',
		{
			file: community.file,
			allowComplexData: ['crop'],
		}
	);
}

export function $clearCommunityPresetChannelBackground(
	community: CommunityModel,
	presetType: CommunityPresetChannelType
) {
	return community.$_save(
		`/web/dash/communities/channels/clear-preset-background/${community.id}/${presetType}`,
		'community'
	);
}

export async function $saveCommunityGameSort(community: CommunityModel) {
	const response = await Api.sendRequest(
		`/web/dash/communities/games/save-sort/${community.id}`,
		community.games!.map(i => i.id),
		{
			noErrorRedirect: true,
		}
	);
	if (response.success) {
		community.assign(response.community);
	}
	return response;
}

export async function joinCommunity(community: CommunityModel, location?: CommunityJoinLocation) {
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

export async function leaveCommunity(community: CommunityModel, location?: CommunityJoinLocation) {
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
	community: CommunityModel,
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
export function canCommunityFeatureFireside(_community: CommunityModel) {
	return false;
}

export function canCommunityEjectFireside(community: CommunityModel) {
	return !!community.hasPerms('community-firesides');
}

export function canCommunityCreateFiresides(community: CommunityModel) {
	return community.hasPerms('community-firesides');
}
