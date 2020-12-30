import Vue from 'vue';
import { Route } from 'vue-router';
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

	hasCompetitions = false;

	get channel() {
		const channels = [
			this.frontpageChannel,
			this.allChannel,
			...(this.community.channels || []),
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

export function setChannelPathFromRoute(store: CommunityRouteStore, route: Route) {
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

	// Also, using Vue.set because perms and is_member are not initialized
	// in the model.
	Vue.set(community, 'perms', invite.perms);
	Vue.set(community, 'is_member', true);

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

export function getChannelPathFromRoute(route: Route) {
	if (route.name === routeCommunitiesViewOverview.name) {
		return CommunityPresetChannelType.FEATURED;
	}
	return route.params.channel || null;
}

/**
 * Initializes the route metadata for a community page.
 */
export function setCommunityMeta(community: Community, title: string) {
	const description = Translate.$gettextInterpolate(
		`Welcome to the %{ name } community on Game Jolt! Find and explore %{ name } fan art, lets plays and catch up on the latest news and theories!`,
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
