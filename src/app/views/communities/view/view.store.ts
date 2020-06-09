import Vue from 'vue';
import { Route } from 'vue-router';
import { Collaborator } from '../../../../_common/collaborator/collaborator.model';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../_common/community/community.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { User } from '../../../../_common/user/user.model';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';

export const CommunityRouteStoreKey = Symbol('community-route');

export class CommunityRouteStore {
	community: Community = null as any;
	frontpageChannel: CommunityChannel = null as any;
	allChannel: CommunityChannel = null as any;
	channelPath: null | string = null;

	sidebarData: null | CommunitySidebarData = null;
	collaborator: null | Collaborator = null;

	get channel() {
		const channels = [
			this.frontpageChannel,
			this.allChannel,
			...(this.community.channels || []),
		];
		return channels.find(i => i.title === this.channelPath) || null;
	}

	// get canEditMedia() {
	// 	return this.community.hasPerms('community-media');
	// }

	get isShowingSidebar() {
		return Screen.isLg;
	}

	setCommunity(community: Community) {
		this.community = community;

		// Generated channels.
		const commonFields = {
			community_id: community.id,
			added_on: community.added_on,
			sort: 0,
			permissions: true,
		};
		this.frontpageChannel = new CommunityChannel({
			title: CommunityPresetChannelType.FEATURED,
			background: community.featured_background,
			...commonFields,
		});
		this.allChannel = new CommunityChannel({
			title: CommunityPresetChannelType.ALL,
			background: community.all_background,
			...commonFields,
		});
	}

	updateCommunity(community: any) {
		this.community.assign(community);
	}

	setChannelPathFromRoute(route: Route) {
		this.channelPath = getChannelPathFromRoute(route);
	}

	isVirtualChannel(channel: CommunityChannel) {
		return [this.frontpageChannel, this.allChannel].includes(channel);
	}
}

export async function acceptCollaboration(store: CommunityRouteStore, currentUser: User) {
	const invite = store.collaborator;
	if (!invite) {
		return;
	}

	await invite.$accept();
	const { community, sidebarData } = store;

	// Accepting the collaboration also automatically follows you to the
	// community. To avoid sending the api request needlessly we update the
	// community model before calling joinCommunity.

	// Also, using Vue.set because perms and is_member are not initialized
	// in the model.
	Vue.set(community, 'perms', invite.perms);
	Vue.set(community, 'is_member', true);

	store.collaborator = null;

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
	return route.params.channel || CommunityPresetChannelType.FEATURED;
}
