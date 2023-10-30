<script lang="ts">
import { computed, provide, reactive, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../../_common/ad/ad-store';
import { Api } from '../../../../_common/api/api.service';
import { CollaboratorModel } from '../../../../_common/collaborator/collaborator.model';
import { CommunityModel, isEditingCommunity } from '../../../../_common/community/community.model';
import AppEditableOverlay from '../../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppMediaItemCover from '../../../../_common/media-item/cover/AppMediaItemCover.vue';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { ContextPane, useSidebarStore } from '../../../../_common/sidebar/sidebar.store';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { enforceLocation } from '../../../../utils/router';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';
import { showCommunityHeaderModal } from '../../../components/forms/community/header/modal/modal.service';
import { useGridStore } from '../../../components/grid/grid-store';
import AppShellContentWithSidebar from '../../../components/shell/AppShellContentWithSidebar.vue';
import { useAppStore } from '../../../store/index';
import AppCommunitiesViewContext from './_context/AppCommunitiesViewContext.vue';
import AppMobileHeader from './_mobile-header/AppMobileHeader.vue';
import { routeCommunitiesViewEditDetails } from './edit/details/details.route';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	setChannelPathFromRoute,
	setCommunity,
} from './view.store';

export const CommunityThemeKey = 'community';

export default {
	...defineAppRouteOptions({
		cache: true,
		deps: { params: ['path'] },
		async resolver({ route }) {
			const payload = await Api.sendRequest('/web/communities/view/' + route.params.path);

			if (payload && payload.community) {
				const redirect = enforceLocation(route, { path: payload.community.path });
				if (redirect) {
					return redirect;
				}
			}

			return payload;
		},
	}),
};
</script>

<script lang="ts" setup>
const routeStore = reactive(new CommunityRouteStore()) as CommunityRouteStore;
provide(CommunityRouteStoreKey, routeStore);

const { communityStates, setActiveCommunity, clearActiveCommunity, viewCommunity } = useAppStore();
const { grid, whenGridBootstrapped } = useGridStore();
const { user } = useCommonStore();
const { setPageTheme, clearPageTheme } = useThemeStore();
const { activeContextPane, addContextPane, removeContextPane } = useSidebarStore();
const appPromotionStore = useAppPromotionStore();
const ads = useAdsController();
const route = useRoute();

const contextPane = ref<ContextPane | null>(null);

const community = computed(() => routeStore.community);
const isEditing = computed(() => isEditingCommunity(route));
const competitionHeader = computed(() => routeStore.channel?.competition?.header ?? null);
const coverMediaItem = computed(() => competitionHeader.value ?? community.value.header ?? null);
const coverEditable = computed(
	() =>
		isEditing.value &&
		routeStore.canEditMedia &&
		route.name === routeCommunitiesViewEditDetails.name
);
const hasUnreadPosts = computed(
	() => communityStates.value.getCommunityState(community.value).isUnread
);
const isFrontpage = computed(() => routeStore.channelPath === routeStore.frontpageChannel.title);

const isShowingHeader = computed(() => {
	if (routeStore.channel?.type === 'competition') {
		return !!competitionHeader.value && !isEditing.value;
	}

	if (!coverMediaItem.value) {
		return false;
	}

	if (isFrontpage.value) {
		return true;
	}

	return isEditing.value && route.name === routeCommunitiesViewEditDetails.name;
});

createAppRoute({
	routeTitle: computed(() => ``),
	onInit() {
		// Add a new context pane if we haven't already.
		if (!contextPane.value) {
			addContextPane(AppCommunitiesViewContext);
			contextPane.value = activeContextPane.value;
		}

		// Assign the props required for 'sidebarComponent'.
		if (contextPane.value) {
			contextPane.value.props = { routeStore };
		}

		setAppPromotionCohort(appPromotionStore, 'community');
	},
	onResolved({ payload }) {
		const community = new CommunityModel(payload.community);

		setCommunity(routeStore, community);
		routeStore.sidebarData = new CommunitySidebarData(payload);
		routeStore.collaborator = payload.invite ? new CollaboratorModel(payload.invite) : null;

		setActiveCommunity(community);
		viewCommunity(community);

		const theme = community.theme ?? null;
		setPageTheme({ key: CommunityThemeKey, theme });

		if (user.value && community.is_member) {
			_getCommunityBootstrap();
		}

		const settings = new AdSettingsContainer();
		if (payload.disableAds === true) {
			settings.isPageDisabled = true;
		}

		setPageAdsSettings(ads, settings);
	},
	onDestroyed() {
		removeContextPane(contextPane.value);
		clearActiveCommunity();
		clearPageTheme(CommunityThemeKey);
		releasePageAdsSettings(ads);
		if (grid.value) {
			grid.value.deregisterViewingCommunity(community.value.id);
		}
	},
});

watch(
	() => route,
	() => {
		setChannelPathFromRoute(routeStore, route);
	},
	{ immediate: true, deep: true }
);

async function _getCommunityBootstrap() {
	// When this is the first route the user enters, grid might not be bootstrapped yet.
	const grid = await whenGridBootstrapped();
	grid.queueRequestCommunityBootstrap(community.value.id);
}

function showEditHeader() {
	showCommunityHeaderModal(community.value);
}
</script>

<template>
	<AppShellContentWithSidebar v-if="community">
		<template #default>
			<!-- Community Header Image -->
			<AppEditableOverlay
				v-if="coverEditable"
				:class="{ '-cover-img': !!coverMediaItem }"
				:disabled="!coverEditable"
				@click="showEditHeader()"
			>
				<template #overlay>
					<AppTranslate v-if="!coverMediaItem">Upload Header</AppTranslate>
					<AppTranslate v-else>Change Header</AppTranslate>
				</template>

				<!-- If no cover media, reserve space with a min-height. -->
				<template #default>
					<div
						class="fill-gray"
						:style="{
							'min-height': !coverMediaItem ? '200px' : '',
						}"
					>
						<AppMediaItemCover v-if="coverMediaItem" :media-item="coverMediaItem" />
					</div>
				</template>
			</AppEditableOverlay>
			<div v-else-if="!!coverMediaItem && isShowingHeader" class="-cover-img">
				<AppMediaItemCover :media-item="coverMediaItem" />
			</div>

			<!-- Mobile Header -->
			<template v-if="!routeStore.isShowingSidebar && !isEditing">
				<AppMobileHeader :has-unread="hasUnreadPosts" />
			</template>

			<RouterView />
		</template>
	</AppShellContentWithSidebar>
</template>

<style lang="stylus" scoped>
.-cover-img
	position: relative

	&::after
		content: ''
		position: absolute
		bottom: 0
		left: 0
		right: 0
		height: 150px
		max-height: 50%
		background-image: linear-gradient(to bottom, transparent 0, rgba($black, 0.3) 70%, rgba($black, 0.6) 100%)
		z-index: 0
</style>
