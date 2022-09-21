import { RouteLocationNormalized } from 'vue-router';
import { numberSort } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import { Collaborator } from '../../../../_common/collaborator/collaborator.model';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../_common/community/community.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { Screen } from '../../../../_common/screen/screen-service';
import { Translate } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';
import { routeCommunitiesViewOverview } from './overview/overview.route';

export const CommunityRouteStoreKey = Symbol('community-route');

export class CommunityRouteStore {
	isLoaded = false;
	community: Community = null as any;
	frontpageChannel: CommunityChannel = null as any;
	allChannel: CommunityChannel = null as any;
	channelPath: null | string = null;

	sidebarData: null | CommunitySidebarData = null;
	collaborator: null | Collaborator = null;

	/** Gets populated when visiting an archived channel (just one) or viewing them in the sidebar/edit section. */
	archivedChannels: CommunityChannel[] = [];
	expandedArchivedChannels = false;
	loadedArchivedChannels = false;

	get channel() {
		const channels = [
			this.frontpageChannel,
			this.allChannel,
			...(this.community.channels || []),
			...this.archivedChannels,
		];
		return channels.find(i => i.title === this.channelPath) || null;
	}

	get competition() {
		return this.channel?.competition;
	}

	get canEditMedia() {
		return this.community.hasPerms('community-media');
	}

	get canEditDescription() {
		return this.community.hasPerms('community-description');
	}

	get isShowingSidebar() {
		return Screen.isLg;
	}
}

export function setCommunity(store: CommunityRouteStore, community: Community) {
	store.isLoaded = true;

	// When the community changes, reset archive channel settings.
	if (store.community?.id !== community.id) {
		store.archivedChannels = [];
		store.loadedArchivedChannels = false;
		store.expandedArchivedChannels = false;
	}

	store.community = community;
	_updateChannels(store);
}

export function updateCommunity(store: CommunityRouteStore, community: any) {
	store.community.assign(community);
	_updateChannels(store);
}

/**
 * The preset channels are fake channels created from the community and have to
 * be refreshed anytime the community is modified.
 */
function _updateChannels(store: CommunityRouteStore) {
	const { community } = store;
	// Generated channels.
	const commonFields = {
		community_id: community.id,
		added_on: community.added_on,
		sort: 0,
		permissions: true,
	};
	store.frontpageChannel = new CommunityChannel({
		title: CommunityPresetChannelType.FEATURED,
		background: community.featured_background,
		...commonFields,
	});
	store.allChannel = new CommunityChannel({
		title: CommunityPresetChannelType.ALL,
		background: community.all_background,
		...commonFields,
	});
}

export function setChannelPathFromRoute(
	store: CommunityRouteStore,
	route: RouteLocationNormalized
) {
	store.channelPath = getChannelPathFromRoute(route);
}

export function isVirtualChannel(store: CommunityRouteStore, channel: CommunityChannel) {
	return [store.frontpageChannel, store.allChannel].includes(channel);
}

export async function acceptCollaboration(store: CommunityRouteStore, currentUser: User) {
	const invite = store.collaborator;
	if (!invite) {
		return;
	}

	await invite.$accept();
	const { community, sidebarData } = store;

	// Accepting the collaboration also automatically follow you to the
	// community. To avoid sending the api request needlessly we update the
	// community model before calling joinCommunity.

	community.perms = invite.perms;
	community.is_member = true;

	// Add the user to the list of collaborators.
	if (currentUser && sidebarData) {
		// When there are hidden collaborators because the list hasn't been
		// fully expanded, just increase the number. The new collaborator
		// will be loaded when clicking Load More.
		if (sidebarData.collaboratorCount > sidebarData.collaborators.length) {
			sidebarData.collaboratorCount++;
		} else {
			sidebarData.collaborators.push(currentUser);
		}
	}
}

export async function declineCollaboration(store: CommunityRouteStore) {
	if (!store.collaborator) {
		return;
	}

	await store.collaborator.$remove();
	store.collaborator = null;
}

export function getChannelPathFromRoute(route: RouteLocationNormalized) {
	if (route.name === routeCommunitiesViewOverview.name) {
		return CommunityPresetChannelType.FEATURED;
	}
	return (route.params.channel as string) || null;
}

/**
 * Initializes the route metadata for a community page.
 */
export function setCommunityMeta(community: Community, title: string) {
	const description = Translate.$gettextInterpolate(
		`Welcome to the %{ name } community on Game Jolt! Discover %{ name } fan art, lets plays and catch up on the latest news and theories!`,
		{ name: community.name }
	);
	const image = community.header?.mediaserver_url;

	Meta.description = description;

	Meta.fb = {
		type: 'website',
		title,
		description,
		image,
	};

	Meta.twitter = {
		card: 'summary_large_image',
		title,
		description,
		image,
	};
}

export async function loadArchivedChannels(store: CommunityRouteStore) {
	const payload = await Api.sendRequest(
		`/web/communities/fetch-archived-channels/` + store.community.path
	);
	if (payload.channels) {
		const channels = CommunityChannel.populate(payload.channels);

		// For each retrieved channel, either assign to one that's already in the list
		// or push. The channel could already be there when it got added through viewing
		// it from the channel view endpoint.
		for (const channel of channels) {
			const existingChannel = store.archivedChannels.find(i => i.id === channel.id);
			if (existingChannel) {
				existingChannel.assign(channel);
			} else {
				store.archivedChannels.push(channel);
			}
		}

		// Because of assign/push possibly messing up sort, sort now.
		store.archivedChannels = store.archivedChannels.sort((a, b) => numberSort(a.sort, b.sort));
	} else {
		// This can happen when an archived channel gets removed while viewing the sidebar.
		store.archivedChannels = [];
		store.community.has_archived_channels = false;
	}
}
