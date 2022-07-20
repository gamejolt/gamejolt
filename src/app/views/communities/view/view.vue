<script lang="ts">
import { ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Provide, Watch } from 'vue-property-decorator';
import { enforceLocation, getAbsoluteLink } from '../../../../utils/router';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { Collaborator } from '../../../../_common/collaborator/collaborator.model';
import { Community, isEditingCommunity } from '../../../../_common/community/community.model';
import AppCommunityJoinWidget from '../../../../_common/community/join-widget/join-widget.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import AppEditableOverlay from '../../../../_common/editable-overlay/editable-overlay.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../_common/share/share.service';
import { ContextPane, useSidebarStore } from '../../../../_common/sidebar/sidebar.store';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { AppCommunityPerms } from '../../../components/community/perms/perms';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';
import { CommunityHeaderModal } from '../../../components/forms/community/header/modal/modal.service';
import AppPageHeaderControls from '../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import AppShellContentWithSidebar from '../../../components/shell/AppShellContentWithSidebar.vue';
import { useAppStore } from '../../../store/index';
import { routeCommunitiesViewEditDetails } from './edit/details/details.route';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	setChannelPathFromRoute,
	setCommunity,
} from './view.store';
import AppCommunitiesViewContext from './_context/context.vue';
import AppEditableThumbnail from './_editable-thumbnail/editable-thumbnail.vue';
import AppMobileHeader from './_mobile-header/mobile-header.vue';
import AppNavChannels from './_nav/channels/channels.vue';

export const CommunityThemeKey = 'community';

@Options({
	name: 'RouteCommunitiesView',
	components: {
		AppShellContentWithSidebar,
		AppPageHeader,
		AppPageHeaderControls,
		AppCommunityJoinWidget,
		AppCommunityPerms,
		AppPopper,
		AppCommunityVerifiedTick,
		AppMobileHeader,
		AppNavChannels,
		AppEditableThumbnail,
		AppEditableOverlay,
		AppMediaItemCover,
	},
})
@OptionsForRoute({
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
})
export default class RouteCommunitiesView extends BaseRouteComponent {
	@Provide({ to: CommunityRouteStoreKey })
	routeStore = setup(() => {
		return ref(new CommunityRouteStore());
	});

	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());
	sidebarStore = setup(() => useSidebarStore());
	appPromotionStore = shallowSetup(() => useAppPromotionStore());

	get user() {
		return this.commonStore.user;
	}

	get communityStates() {
		return this.store.communityStates;
	}

	get grid() {
		return this.store.grid;
	}

	get activeContextPane() {
		return this.sidebarStore.activeContextPane;
	}

	readonly Environment = Environment;
	readonly Screen = Screen;

	contextPane: ContextPane | null = null;

	get hasUnreadPosts() {
		return this.communityStates.getCommunityState(this.community).isUnread;
	}

	get community() {
		return this.routeStore.community;
	}

	get communityMemberCount() {
		return formatNumber(this.community.member_count);
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	get shouldShowModTools() {
		return this.user && this.user.isMod;
	}

	get competitionHeader() {
		return this.routeStore.channel?.competition?.header ?? null;
	}

	get coverMediaItem() {
		return this.competitionHeader ?? this.community.header ?? null;
	}

	get coverEditable() {
		return (
			this.isEditing &&
			this.routeStore.canEditMedia &&
			this.$route.name === routeCommunitiesViewEditDetails.name
		);
	}

	get isFrontpage() {
		return this.routeStore.channelPath === this.routeStore.frontpageChannel.title;
	}

	get isShowingHeader() {
		if (this.routeStore.channel?.type === 'competition') {
			return !!this.competitionHeader && !this.isEditing;
		}

		if (!this.coverMediaItem) {
			return false;
		}

		if (this.isFrontpage) {
			return true;
		}

		return this.isEditing && this.$route.name === routeCommunitiesViewEditDetails.name;
	}

	@Watch('$route', { immediate: true })
	onRouteChange() {
		setChannelPathFromRoute(this.routeStore, this.$route);
	}

	routeCreated() {
		// Add a new context pane if we haven't already.
		if (!this.contextPane) {
			this.sidebarStore.addContextPane(AppCommunitiesViewContext);
			this.contextPane = this.activeContextPane;
		}

		// Assign the props required for 'this.sidebarComponent'.
		if (this.contextPane) {
			this.contextPane.props = { routeStore: this.routeStore };
		}

		setAppPromotionCohort(this.appPromotionStore, 'community');
	}

	routeResolved($payload: any) {
		const { routeStore } = this;
		const community = new Community($payload.community);

		setCommunity(routeStore, community);
		routeStore.sidebarData = new CommunitySidebarData($payload);
		routeStore.collaborator = $payload.invite ? new Collaborator($payload.invite) : null;

		this.store.setActiveCommunity(community);
		this.store.viewCommunity(community);
		this.setPageTheme();

		if (this.user && community.is_member) {
			this.getCommunityBootstrap();
		}
	}

	private async getCommunityBootstrap() {
		// When this is the first route the user enters, grid might not be bootstrapped yet.
		const grid = await this.store.tillGridBootstrapped();
		grid.queueRequestCommunityBootstrap(this.community.id);
	}

	routeDestroyed() {
		this.sidebarStore.removeContextPane(this.contextPane);
		this.store.clearActiveCommunity();
		this.themeStore.clearPageTheme(CommunityThemeKey);
		if (this.grid) {
			this.grid.deregisterViewingCommunity(this.community.id);
		}
	}

	private setPageTheme() {
		const theme = this.community?.theme ?? null;
		this.themeStore.setPageTheme({ key: CommunityThemeKey, theme });
	}

	showEditHeader() {
		CommunityHeaderModal.show(this.community);
	}

	copyShareUrl() {
		const url = getAbsoluteLink(this.$router, this.community.routeLocation);
		copyShareLink(url, 'community');
	}
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

			<router-view />
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
