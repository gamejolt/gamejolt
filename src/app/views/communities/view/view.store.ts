import { InjectionKey, computed, inject, ref, toRef } from 'vue';
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

export function createCommunityRouteStore() {
	const isLoaded = ref(false);
	const community = ref<CommunityModel | null>();
	const frontpageChannel = ref<CommunityChannelModel | null>();
	const allChannel = ref<CommunityChannelModel | null>();
	const channelPath = ref<string | null>();

	const sidebarData = ref<CommunitySidebarData | null>();
	const collaborator = ref<CollaboratorModel | null>();

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
		return channels.find(i => i?.title === channelPath.value) || null;
	});

	const competition = toRef(() => channel.value?.competition);
	const canEditMedia = computed(() => community.value?.hasPerms('community-media'));
	const canEditDescription = computed(() => community.value?.hasPerms('community-description'));
	const isShowingSidebar = toRef(() => Screen.isLg);

	function setCommunity(newCommunity: CommunityModel) {
		isLoaded.value = true;

		// When the community changes, reset archive channel settings.
		if (community.value?.id !== newCommunity.id) {
			archivedChannels.value = [];
			loadedArchivedChannels.value = false;
			expandedArchivedChannels.value = false;
		}

		community.value = newCommunity;
		_updateChannels();
	}

	function updateCommunity(newCommunity: any) {
		community.value!.assign(newCommunity);

		_updateChannels();
	}

	/**
	 * The preset channels are fake channels created from the community and have to
	 * be refreshed anytime the community is modified.
	 */
	function _updateChannels() {
		// Generated channels.
		const commonFields = {
			community_id: community.value!.id,
			added_on: community.value!.added_on,
			sort: 0,
			permissions: true,
		};
		frontpageChannel.value = new CommunityChannelModel({
			title: CommunityPresetChannelType.FEATURED,
			background: community.value!.featured_background,
			...commonFields,
		});
		allChannel.value = new CommunityChannelModel({
			title: CommunityPresetChannelType.ALL,
			background: community.value!.all_background,
			...commonFields,
		});
	}

	function setChannelPathFromRoute(route: RouteLocationNormalized) {
		channelPath.value = getChannelPathFromRoute(route);
	}

	function isVirtualChannel(channel: CommunityChannelModel) {
		return [frontpageChannel.value, allChannel.value].includes(channel);
	}

	async function acceptCollaboration(currentUser: UserModel) {
		if (!collaborator.value) {
			return;
		}

		await $acceptCollaboratorInvite(collaborator.value);

		// Accepting the collaboration also automatically follow you to the
		// community. To avoid sending the api request needlessly we update the
		// community model before calling joinCommunity.

		community.value!.perms = collaborator.value.perms;
		community.value!.is_member = true;

		// Add the user to the list of collaborators.
		if (currentUser && sidebarData.value) {
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

	async function declineCollaboration() {
		if (!collaborator.value) {
			return;
		}

		await $removeCollaboratorInvite(collaborator.value);
		collaborator.value = null;
	}

	/**
	 * Initializes the route metadata for a community page.
	 */
	function setCommunityMeta(title: string) {
		const description = $gettext(
			`Welcome to the %{ name } community on Game Jolt! Discover %{ name } fan art, lets plays and catch up on the latest news and theories!`,
			{ name: community.value!.name }
		);
		const image = community.value!.header?.mediaserver_url;

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

	async function loadArchivedChannels() {
		const payload = await Api.sendRequest(
			`/web/communities/fetch-archived-channels/` + community.value!.path
		);
		if (payload.channels) {
			const channels = CommunityChannelModel.populate(payload.channels);

			// For each retrieved channel, either assign to one that's already in the list
			// or push. The channel could already be there when it got added through viewing
			// it from the channel view endpoint.
			for (const channel of channels) {
				const existingChannel = archivedChannels.value.find(i => i.id === channel.id);
				if (existingChannel) {
					existingChannel.assign(channel);
					// TODO(reactive-community-route-store): clear existingChannel from archived?
				} else {
					archivedChannels.value.push(channel);
				}
			}

			// Because of assign/push possibly messing up sort, sort now.
			archivedChannels.value = archivedChannels.value.sort((a, b) =>
				numberSort(a.sort, b.sort)
			);
		} else {
			// This can happen when an archived channel gets removed while viewing the sidebar.
			archivedChannels.value = [];
			community.value!.has_archived_channels = false;
		}
	}

	return {
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
		setCommunity,
		updateCommunity,
		setChannelPathFromRoute,
		isVirtualChannel,
		acceptCollaboration,
		declineCollaboration,
		setCommunityMeta,
		loadArchivedChannels,
	};
}
