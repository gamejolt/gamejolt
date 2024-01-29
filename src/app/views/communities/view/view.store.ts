import { InjectionKey, computed, inject, ref, shallowReadonly, toRef } from 'vue';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import {
	$acceptCollaboratorInvite,
	$removeCollaboratorInvite,
	CollaboratorModel,
} from '../../../../_common/collaborator/collaborator.model';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import {
	CommunityModel,
	CommunityPresetChannelType,
} from '../../../../_common/community/community.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { Screen } from '../../../../_common/screen/screen-service';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import { numberSort } from '../../../../utils/array';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';
import { routeCommunitiesViewOverview } from './overview/overview.route';

export const CommunityRouteStoreKey: InjectionKey<CommunityRouteStore> = Symbol('community-route');
export type CommunityRouteStore = ReturnType<typeof createCommunityRouteStore>;

export function useCommunityRouteStore() {
	return inject(CommunityRouteStoreKey);
}

export function getChannelPathFromRoute(route: RouteLocationNormalized) {
	if (route.name === routeCommunitiesViewOverview.name) {
		return CommunityPresetChannelType.FEATURED;
	}

	return (route.params.channel as string) || null;
}

export function setCommunity(store: CommunityRouteStore, newCommunity: CommunityModel) {
	store.isLoaded.value = true;

	// When the community changes, reset archive channel settings.
	if (store.community.value?.id !== newCommunity.id) {
		store.archivedChannels.value = [];
		store.loadedArchivedChannels.value = false;
		store.expandedArchivedChannels.value = false;
	}

	store.community.value = newCommunity;
	_updateChannels(store);
}

export function updateCommunity(store: CommunityRouteStore, community: any) {
	store.community.value?.assign(community);
	_updateChannels(store);
}

export function setChannelPathFromRoute(
	store: CommunityRouteStore,
	route: RouteLocationNormalized
) {
	store.channelPath.value = getChannelPathFromRoute(route) || null;
}

export function isVirtualChannel(store: CommunityRouteStore, channel: CommunityChannelModel) {
	return [store.frontpageChannel.value, store.allChannel.value].includes(channel);
}

export async function acceptCollaboration(store: CommunityRouteStore, currentUser: UserModel) {
	const invite = store.collaborator.value;
	const { community, sidebarData } = store;

	if (!invite || !community.value || !sidebarData.value) {
		return;
	}

	await $acceptCollaboratorInvite(invite);

	// Accepting the collaboration also automatically follow you to the
	// community. To avoid sending the api request needlessly we update the
	// community model before calling joinCommunity.

	community.value.perms = invite.perms;
	community.value.is_member = true;

	// Add the user to the list of collaborators.
	if (currentUser && sidebarData) {
		// When there are hidden collaborators because the list hasn't been
		// fully expanded, just increase the number. The new collaborator
		// will be loaded when clicking Load More.
		if (sidebarData.value.collaboratorCount > sidebarData.value.collaborators.length) {
			sidebarData.value.collaboratorCount++;
		} else {
			sidebarData.value.collaborators.push(currentUser);
		}
	}
}

export async function declineCollaboration(store: CommunityRouteStore) {
	if (!store.collaborator.value) {
		return;
	}

	await $removeCollaboratorInvite(store.collaborator.value);
	store.collaborator.value = undefined;
}

/**
 * Initializes the route metadata for a community page.
 */
export function setCommunityMeta(community: CommunityModel, title: string) {
	const description = $gettext(
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
	if (!store.community.value) {
		return;
	}

	const payload = await Api.sendRequest(
		`/web/communities/fetch-archived-channels/` + store.community.value.path
	);
	if (payload.channels) {
		const channels = CommunityChannelModel.populate(payload.channels);

		// For each retrieved channel, either assign to one that's already in the list
		// or push. The channel could already be there when it got added through viewing
		// it from the channel view endpoint.
		for (const channel of channels) {
			const existingChannel = store.archivedChannels.value.find(i => i.id === channel.id);
			if (existingChannel) {
				existingChannel.assign(channel);
			} else {
				store.archivedChannels.value.push(channel);
			}
		}

		// Because of assign/push possibly messing up sort, sort now.
		store.archivedChannels.value = store.archivedChannels.value.sort((a, b) =>
			numberSort(a.sort, b.sort)
		);
	} else {
		// This can happen when an archived channel gets removed while viewing the sidebar.
		store.archivedChannels.value = [];
		store.community.value.has_archived_channels = false;
	}
}

/**
 * The preset channels are fake channels created from the community and have to
 * be refreshed anytime the community is modified.
 */
function _updateChannels(store: CommunityRouteStore) {
	// Generated channels.
	const commonFields = {
		community_id: store.community.value!.id,
		added_on: store.community.value!.added_on,
		sort: 0,
		permissions: true,
	};
	store.frontpageChannel.value = new CommunityChannelModel({
		title: CommunityPresetChannelType.FEATURED,
		background: store.community.value!.featured_background,
		...commonFields,
	});
	store.allChannel.value = new CommunityChannelModel({
		title: CommunityPresetChannelType.ALL,
		background: store.community.value!.all_background,
		...commonFields,
	});
}

export function createCommunityRouteStore() {
	const isLoaded = ref(false);
	const community = ref<CommunityModel>();
	const frontpageChannel = ref<CommunityChannelModel>();
	const allChannel = ref<CommunityChannelModel>();
	const channelPath = ref<string | null>(null);

	const sidebarData = ref<CommunitySidebarData>();
	const collaborator = ref<CollaboratorModel>();

	/** Gets populated when visiting an archived channel (just one) or viewing them in the sidebar/edit section. */
	const archivedChannels = ref<CommunityChannelModel[]>([]);
	const expandedArchivedChannels = ref(false);
	const loadedArchivedChannels = ref(false);

	const channel = computed(() => {
		const channels = [
			frontpageChannel.value,
			allChannel.value,
			...(community.value?.channels || []),
			...archivedChannels.value,
		];
		return channels.find(i => i?.title === channelPath.value);
	});

	const competition = toRef(() => channel.value?.competition);
	const canEditMedia = computed(() => community.value?.hasPerms('community-media'));
	const canEditDescription = computed(() => community.value?.hasPerms('community-description'));
	const isShowingSidebar = toRef(() => Screen.isLg);

	return shallowReadonly({
		isLoaded,
		community,
		frontpageChannel,
		allChannel,
		channelPath,
		sidebarData,
		collaborator,
		archivedChannels,
		expandedArchivedChannels,
		loadedArchivedChannels,
		channel,
		competition,
		canEditMedia,
		canEditDescription,
		isShowingSidebar,
	});
}
